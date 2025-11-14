import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient.jsx";
import CreateUserForm from "./CreateUserForm.jsx";
import UserTable from "./UserTable.jsx";
import Header from "../components/Header.jsx";
import OrderManagement from "./OrderManagement.jsx";
import DashboardView from "./DashboardView.jsx";

// Helper function to derive the active item ID from the URL hash
const getActiveItemFromHash = (hash) => {
  if (!hash || hash === "#") return "dashboard";
  return hash.substring(1);
};

const DELIVERY_STATUS_OPTIONS = [
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];
const PAYMENT_STATUS_OPTIONS = ["Pending", "Paid", "Failed", "Refunded"];

const DashboardPage = ({ session }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("User");
  const [loading, setLoading] = useState(true);
  const user = session?.user;

  const [activeItem, setActiveItem] = useState(
    getActiveItemFromHash(location.hash)
  );

  const [dashboardStats, setDashboardStats] = useState({
    totalSales: 0,
    newOrders: 0,
    topItemSold: "N/A",
    loading: false,
  });

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState(null);

  // --- Logic for Header and URL Management ---

  const handleSidebarClick = useCallback(
    (itemId) => {
      const newHash = itemId === "dashboard" ? "" : `#${itemId}`;
      navigate(location.pathname + newHash, { replace: true });
      setActiveItem(itemId); // Update local state immediately
    },
    [location.pathname, navigate]
  );

  useEffect(() => {
    const itemFromUrl = getActiveItemFromHash(location.hash);
    if (activeItem !== itemFromUrl) {
      setActiveItem(itemFromUrl);
    }
  }, [location.hash, activeItem]);

  // --- Profile Fetching Logic ---
  const getProfile = useCallback(async () => {
    setLoading(true);
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("users")
        .select(`full_name`)
        .eq("id", user.id)
        .single();
      if (error && error.code !== "PGRST116") throw error;
      if (data) setFullName(data.full_name);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    getProfile();
  }, [getProfile]);

  const greetingName = loading ? "Loading..." : fullName;
  const userWithFullName = {
    ...user,
    fullName: greetingName,
    roleId: user?.role_id,
  };

  // ----------------------------------------------------
  // FETCH DASHBOARD SUMMARY STATS (UNCHANGED)
  // ----------------------------------------------------
  const fetchDashboardStats = useCallback(async () => {
    setDashboardStats((prev) => ({ ...prev, loading: true }));
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const oneMonthAgoISO = oneMonthAgo.toISOString();

    try {
      // 1. Fetch Total Sales (Total Revenue)
      const { data: salesData, error: salesError } = await supabase
        .from("orders")
        .select("total_amount", { count: "exact" })
        .gte("created_at", oneMonthAgoISO);

      if (salesError) throw salesError;

      const totalSales = salesData.reduce(
        (sum, order) => sum + (parseFloat(order.total_amount) || 0),
        0
      );

      // 2. Fetch New Order Count
      const { count: newOrdersCount, error: countError } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .gte("created_at", oneMonthAgoISO);

      if (countError) throw countError;

      // 3. FETCH LINE ITEMS TO DETERMINE TOP ITEM SOLD
      const { data: orderItemsData, error: itemsError } = await supabase
        .from("order_items")
        .select("quantity, product_name, order_id!inner(created_at)")
        .gte("order_id.created_at", oneMonthAgoISO);

      if (itemsError) {
        console.warn(
          "Could not fetch order items for Top Item Sold calculation, defaulting to N/A:",
          itemsError.message
        );
      }

      let topItem = "N/A";
      if (orderItemsData && orderItemsData.length > 0) {
        const salesMap = orderItemsData.reduce((map, item) => {
          const name = item.product_name;
          map[name] = (map[name] || 0) + item.quantity;
          return map;
        }, {});

        let maxQuantity = 0;
        for (const name in salesMap) {
          if (salesMap[name] > maxQuantity) {
            maxQuantity = salesMap[name];
            topItem = name;
          }
        }
      }
      const topItemSold = topItem;

      setDashboardStats({
        totalSales: totalSales,
        newOrders: newOrdersCount || 0,
        topItemSold: topItemSold,
        loading: false,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error.message);
      setDashboardStats({
        totalSales: 0,
        newOrders: 0,
        topItemSold: "N/A",
        loading: false,
      });
    }
  }, []);

  // ----------------------------------------------------
  // HANDLER TO UPDATE ORDER DELIVERY STATUS (UNCHANGED)
  // ----------------------------------------------------
  const handleStatusChange = async (orderId, newStatus) => {
    console.log(`Updating order ${orderId} delivery status to: ${newStatus}`);
    const oldDeliveryStatus = orders.find(
      (o) => o.id === orderId
    )?.delivery_status;

    // Optimistic UI update
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === orderId ? { ...order, delivery_status: newStatus } : order
      )
    );

    try {
      const { error } = await supabase
        .from("orders")
        .update({ delivery_status: newStatus })
        .eq("id", orderId);

      if (error) throw error;

      if (activeItem === "orders") {
        fetchOrders(null);
      }
    } catch (error) {
      console.error("Error updating order delivery status:", error.message);
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId
            ? { ...order, delivery_status: oldDeliveryStatus }
            : order
        )
      );
    }
  };

  // ----------------------------------------------------
  // HANDLER TO UPDATE ORDER PAYMENT STATUS (UNCHANGED)
  // ----------------------------------------------------
  const handlePaymentStatusChange = async (orderId, newPaymentStatus) => {
    console.log(
      `Updating order ${orderId} payment status to: ${newPaymentStatus}`
    );
    const oldPaymentStatus = orders.find(
      (o) => o.id === orderId
    )?.payment_status;

    // Optimistic UI update
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === orderId
          ? { ...order, payment_status: newPaymentStatus }
          : order
      )
    );

    try {
      const { error } = await supabase
        .from("orders")
        .update({ payment_status: newPaymentStatus })
        .eq("id", orderId);

      if (error) throw error;

      if (activeItem === "orders") {
        fetchOrders(null);
      }
    } catch (error) {
      console.error("Error updating payment status:", error.message);
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId
            ? { ...order, payment_status: oldPaymentStatus }
            : order
        )
      );
    }
  };

  // ----------------------------------------------------
  // FUNCTION TO FETCH ORDERS (UNCHANGED)
  // ----------------------------------------------------
  const fetchOrders = useCallback(async (dateFilter = null) => {
    setOrdersLoading(true);
    setOrdersError(null);
    setOrders([]);

    let query = supabase
      .from("orders")
      .select("*, payment_status, payment_method")
      .order("created_at", { ascending: false });

    // Apply 30-day filter for dashboard view
    if (dateFilter) {
      query = query.gte("created_at", dateFilter);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching orders:", error.message);
      setOrdersError("Could not fetch orders. Please check RLS policies.");
    } else {
      setOrders(
        data.map((order) => ({
          ...order,
          delivery_status: order.delivery_status || DELIVERY_STATUS_OPTIONS[0],
          payment_status: order.payment_status || PAYMENT_STATUS_OPTIONS[0],
        }))
      );
    }
    setOrdersLoading(false);
  }, []);

  // ----------------------------------------------------
  // EFFECT HOOK TO TRIGGER DATA FETCH (UNCHANGED)
  // ----------------------------------------------------
  useEffect(() => {
    if (activeItem === "dashboard" || activeItem === "") {
      fetchDashboardStats();

      // Calculate 30-day filter date for charts
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      const oneMonthAgoISO = oneMonthAgo.toISOString();

      // Fetch orders for chart data (30 days only)
      fetchOrders(oneMonthAgoISO);
    }
    if (activeItem === "orders") {
      // Fetch all orders for the management page (no date filter)
      fetchOrders(null);
    }
  }, [activeItem, fetchDashboardStats, fetchOrders]);

  // --- Render Logic ---
  return (
    // ⭐️ CHANGED: Added min-h-screen to ensure the page always fills the viewport height
    <div className='bg-gray-50 min-h-screen'>
      <Header
        user={userWithFullName}
        onLogout={async () => await supabase.auth.signOut()}
        activeItem={activeItem}
        setActiveItem={handleSidebarClick}
      />

      {/* Main content area: pt-20 pushes content below the fixed header */}
      <main className='flex-1 p-6 pt-20 min-w-0'>
        {/* 1. Dashboard View */}
        {(activeItem === "dashboard" || activeItem === "") && (
          <DashboardView
            greetingName={greetingName}
            dashboardStats={dashboardStats}
            orders={orders}
            ordersLoading={ordersLoading}
          />
        )}

        {/* 2. Order Management View */}
        {activeItem === "orders" && (
          <OrderManagement
            orders={orders}
            ordersLoading={ordersLoading}
            ordersError={ordersError}
            handleStatusChange={handleStatusChange}
            handlePaymentStatusChange={handlePaymentStatusChange}
            DELIVERY_STATUS_OPTIONS={DELIVERY_STATUS_OPTIONS}
            PAYMENT_STATUS_OPTIONS={PAYMENT_STATUS_OPTIONS}
          />
        )}

        {/* 3. Create User Form View */}
        {activeItem === "create-users" && (
          <div className='min-h-screen flex items-center justify-center bg-gray-50 p-32 mt-[-230px]'>
            {/* The form component */}
            <CreateUserForm />
          </div>
        )}

        {/* 4. User Management Table View */}
        {activeItem === "manage-users" && (
          <div className=' max-w-full'>
            <UserTable />
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;
