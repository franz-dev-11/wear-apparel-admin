import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient.jsx";
import CreateUserForm from "./CreateUserForm.jsx";
import UserTable from "./UserTable.jsx";
import Sidebar from "../components/Sidebar.jsx";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

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

// ----------------------------------------------------
// ⚡️ DATA PROCESSING FUNCTIONS FOR CHARTS
// ----------------------------------------------------

// Function to aggregate total revenue over time (daily)
const processRevenueData = (orders) => {
  const dailyRevenueMap = orders.reduce((acc, order) => {
    // Assuming 'created_at' is a date string from your Supabase table
    const date = new Date(order.created_at).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const amount = order.total_amount || 0;

    acc[date] = (acc[date] || 0) + amount;
    return acc;
  }, {});

  // Convert map to array of objects, sorted by date
  return Object.keys(dailyRevenueMap)
    .map((date) => ({
      date,
      "Total Revenue": parseFloat(dailyRevenueMap[date].toFixed(2)),
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));
};

// Function to count orders by delivery status
const processStatusData = (orders) => {
  const statusCounts = orders.reduce((acc, order) => {
    // Uses the local 'delivery_status' property mapped in fetchOrders
    const status = order.delivery_status || "Unknown";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  return Object.keys(statusCounts).map((status) => ({
    name: status,
    value: statusCounts[status],
  }));
};

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

  // --- Logic for Sidebar and URL Management ---

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
  // FETCH DASHBOARD SUMMARY STATS
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
  // HANDLER TO UPDATE ORDER DELIVERY STATUS (FIXED COLUMN NAME)
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
        // ⭐️ FIX: Now correctly targeting the 'delivery_status' column
        .update({ delivery_status: newStatus })
        .eq("id", orderId);

      if (error) throw error;

      // Persistence Fix: Re-fetch orders after successful database update
      if (activeItem === "orders") {
        fetchOrders(null);
      }
    } catch (error) {
      console.error("Error updating order delivery status:", error.message);
      // Revert local state on error
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
  // HANDLER TO UPDATE ORDER PAYMENT STATUS (FIXED for Persistence)
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

      // Persistence Fix: Re-fetch orders after successful database update
      if (activeItem === "orders") {
        fetchOrders(null);
      }
    } catch (error) {
      console.error("Error updating payment status:", error.message);
      // Revert local state on error
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
  // FUNCTION TO FETCH ORDERS (For Order Management View & Dashboard Charts)
  // ----------------------------------------------------
  const fetchOrders = useCallback(async (dateFilter = null) => {
    setOrdersLoading(true);
    setOrdersError(null);
    setOrders([]);

    let query = supabase
      .from("orders")
      // Only selecting payment_status explicitly, letting '*' grab delivery_status
      .select("*, payment_status")
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
          // ⭐️ FIX: Now correctly reading from 'order.delivery_status'
          delivery_status: order.delivery_status || DELIVERY_STATUS_OPTIONS[0],
          payment_status: order.payment_status || PAYMENT_STATUS_OPTIONS[0],
        }))
      );
    }
    setOrdersLoading(false);
  }, []);

  // ----------------------------------------------------
  // EFFECT HOOK TO TRIGGER DATA FETCH
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

  // --- Render Logic (using the original structure) ---
  return (
    <div className='flex min-h-screen bg-gray-50'>
      <Sidebar
        user={userWithFullName}
        onLogout={async () => await supabase.auth.signOut()}
        activeItem={activeItem}
        setActiveItem={handleSidebarClick}
      />

      <main className='flex-1 p-6 ml-64 min-w-0'>
        {/* --- Conditional Content Rendering --- */}

        {/* 1. Dashboard View */}
        {(activeItem === "dashboard" || activeItem === "") && (
          <>
            <h1 className='text-[#121212] font-extrabold text-6xl mb-10 ml-6 mt-6'>
              Realtime Dashboard
            </h1>
            <p className='text-gray-700 mb-8 ml-6'>
              Welcome, <span className='font-semibold'>{greetingName}</span>!
              Here is your WEAR APPAREL business summary.
            </p>

            {/* Dashboard Stats Grid */}
            {dashboardStats.loading ? (
              <p className='text-blue-500 ml-6'>Loading dashboard data...</p>
            ) : (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
                {/* Card 1: Total Sales */}
                <div className='bg-green-700 p-6 rounded-xl shadow-lg border border-green-700 flex flex-col items-start'>
                  <span className='text-sm font-medium text-white uppercase tracking-wider'>
                    Total Sales (30 Days)
                  </span>
                  <h3 className='text-3xl font-bold text-white mt-1'>
                    ₱{dashboardStats.totalSales.toFixed(2)}
                  </h3>
                </div>

                {/* Card 2: New Orders */}
                <div className='bg-blue-700 p-6 rounded-xl shadow-lg border border-blue-700 flex flex-col items-start'>
                  <span className='text-sm font-medium text-white uppercase tracking-wider'>
                    New Orders (30 Days)
                  </span>
                  <h3 className='text-3xl font-bold text-white mt-1'>
                    {dashboardStats.newOrders}
                  </h3>
                  <p className='text-xs text-white mt-2'>
                    Check Order Management for details
                  </p>
                </div>

                {/* Card 3: Avg Order Value */}
                <div className='bg-yellow-600 p-6 rounded-xl shadow-lg border border-yellow-600 flex flex-col items-start'>
                  <span className='text-sm font-medium text-white uppercase tracking-wider'>
                    Avg Order Value (30 Days)
                  </span>
                  <h3 className='text-3xl font-bold text-white mt-1'>
                    ₱
                    {(
                      dashboardStats.totalSales /
                      (dashboardStats.newOrders || 1)
                    ).toFixed(2)}
                  </h3>
                  <p className='text-xs text-white mt-2'>Sales / New Orders</p>
                </div>

                {/* Card 4: Top Item Sold */}
                <div className='bg-[#121212] p-6 rounded-xl shadow-lg border border-[#121212] flex flex-col items-start'>
                  <span className='text-sm font-medium text-white uppercase tracking-wider'>
                    Top Item Sold (30 Days)
                  </span>
                  <h3 className='text-3xl font-bold text-white mt-1'>
                    {dashboardStats.topItemSold}
                  </h3>
                  <p className='text-xs text-white mt-2'>
                    Highest Quantity by Product
                  </p>
                </div>
              </div>
            )}

            {/* ⚡️ CHARTS AREA */}
            <div className='mt-10 space-y-8'>
              <h2 className='text-3xl font-bold text-gray-800 ml-6'>
                Recent Activity & Trends
              </h2>

              {ordersLoading && (
                <p className='text-blue-500 ml-6'>
                  Loading orders data for charts...
                </p>
              )}

              {!ordersLoading && orders.length > 0 && (
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                  {/* Chart 1: Total Revenue Over Time (Line Chart) */}
                  <div className='bg-white p-6 rounded-xl shadow-lg border border-gray-100 h-80'>
                    <h3 className='text-xl font-semibold mb-4 text-gray-700'>
                      Daily Revenue (Last 30 Days)
                    </h3>
                    <ResponsiveContainer width='100%' height='90%'>
                      <LineChart
                        data={processRevenueData(orders)}
                        margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray='3 3' stroke='#e0e0e0' />
                        <XAxis dataKey='date' />
                        <YAxis tickFormatter={(value) => `₱${value}`} />
                        <Tooltip
                          formatter={(value) => [
                            `₱${value.toFixed(2)}`,
                            "Revenue",
                          ]}
                        />
                        <Legend />
                        <Line
                          type='monotone'
                          dataKey='Total Revenue'
                          stroke='#8884d8'
                          strokeWidth={2}
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Chart 2: Orders by Status (Pie Chart) */}
                  <div className='bg-white p-6 rounded-xl shadow-lg border border-gray-100 h-80'>
                    <h3 className='text-xl font-semibold mb-4 text-gray-700'>
                      Orders by Delivery Status (Last 30 Days)
                    </h3>
                    <ResponsiveContainer width='100%' height='90%'>
                      <PieChart>
                        <Pie
                          data={processStatusData(orders)}
                          dataKey='value'
                          nameKey='name'
                          cx='50%'
                          cy='50%'
                          outerRadius={80}
                          fill='#82ca9d'
                          labelLine={true}
                          label={({ name, percent }) =>
                            `${name} (${(percent * 100).toFixed(0)}%)`
                          }
                        >
                          {/* Custom colors for each status slice (Tailwind inspired) */}
                          {processStatusData(orders).map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                ["#4299e1", "#ed8936", "#48bb78", "#f56565"][
                                  index % 4
                                ]
                              } // Blue (Shipped), Orange (Processing), Green (Delivered), Red (Cancelled)
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value, name) => [value, `${name} Orders`]}
                        />
                        <Legend
                          layout='horizontal'
                          verticalAlign='bottom'
                          align='center'
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
              {!ordersLoading && orders.length === 0 && (
                <p className='text-gray-500 ml-6'>
                  No recent order data available to generate charts.
                </p>
              )}
            </div>
            {/* END CHARTS AREA */}
          </>
        )}

        {/* 2. Order Management View */}
        {activeItem === "orders" && (
          <div className='bg-white p-6 rounded-xl shadow-lg border border-gray-100'>
            <h1 className='text-[#121212] font-extrabold text-6xl mb-10'>
              Manage Orders
            </h1>
            <h2 className='text-xl font-semibold text-gray-800 mb-4'>
              Order Management Interface
            </h2>

            {ordersLoading && (
              <p className='text-blue-500'>Loading orders...</p>
            )}

            {ordersError && (
              <p className='text-red-500'>Error: {ordersError}</p>
            )}

            {!ordersLoading && !ordersError && orders.length > 0 && (
              <div className='overflow-x-auto'>
                <table className='min-w-full divide-y divide-gray-200'>
                  <thead>
                    <tr>
                      <th className='px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Order ID
                      </th>
                      <th className='px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Customer
                      </th>
                      <th className='px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Order Date
                      </th>
                      <th className='px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Payment Status
                      </th>
                      <th className='px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Status (Delivery)
                      </th>
                      <th className='px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className='bg-white divide-y divide-gray-200'>
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                          {order.id}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                          {order.customer_name || "N/A"}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>

                        {/* Editable Payment Status Dropdown */}
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                          <select
                            value={order.payment_status}
                            onChange={(e) =>
                              handlePaymentStatusChange(
                                order.id,
                                e.target.value
                              )
                            }
                            className={`p-1 border rounded text-xs leading-5 font-semibold 
                              ${
                                order.payment_status === "Paid"
                                  ? "bg-green-100 text-green-800 border-green-300"
                                  : order.payment_status === "Pending"
                                  ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                                  : "bg-red-100 text-red-800 border-red-300"
                              }`}
                          >
                            {PAYMENT_STATUS_OPTIONS.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Editable Delivery Status Dropdown (Using delivery_status) */}
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                          <select
                            value={order.delivery_status}
                            onChange={(e) =>
                              handleStatusChange(order.id, e.target.value)
                            }
                            className={`p-1 border rounded text-xs leading-5 font-semibold 
                              ${
                                order.delivery_status === "Delivered"
                                  ? "bg-green-100 text-green-800 border-green-300"
                                  : order.delivery_status === "Shipped"
                                  ? "bg-blue-100 text-blue-800 border-blue-300"
                                  : "bg-yellow-100 text-yellow-800 border-yellow-300"
                              }`}
                          >
                            {DELIVERY_STATUS_OPTIONS.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                          ₱{(order.total_amount || 0).toFixed(2)}{" "}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!ordersLoading && !ordersError && orders.length === 0 && (
              <p className='text-gray-500'>No orders found.</p>
            )}
          </div>
        )}

        {/* 3. Create User Form View */}
        {activeItem === "create-users" && (
          <div className=' max-w-lg'>
            <CreateUserForm />
          </div>
        )}

        {/* 4. User Management Table View */}
        {activeItem === "manage-users" && ( // <-- NEW CONDITIONAL BLOCK
          <div className=' max-w-full'>
            <UserTable />
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;
