import React from "react";

const DELIVERY_STATUS_OPTIONS = [
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];
const PAYMENT_STATUS_OPTIONS = ["Pending", "Paid", "Failed", "Refunded"];

// ⭐️ NEW: Function to convert data to CSV string
const convertToCSV = (data) => {
  // Define headers for the CSV
  const headers = [
    "Order ID",
    "Customer Name",
    "Total Amount",
    "Order Date",
    "Payment Status",
    "Delivery Status",
  ];

  // Convert orders array to CSV rows
  const csvContent = data.map((order) => {
    // Ensure data is wrapped in quotes if it contains commas or newlines
    const date = new Date(order.created_at).toISOString();
    return [
      order.id,
      `"${(order.customer_name || "N/A").replace(/"/g, '""')}"`, // Handle names with commas/quotes
      order.total_amount || 0,
      date,
      order.payment_status,
      order.delivery_status,
    ].join(",");
  });

  return [headers.join(","), ...csvContent].join("\n");
};

const OrderManagementView = ({
  orders,
  ordersError,
  handleStatusChange,
  handlePaymentStatusChange,
}) => {
  // ⭐️ NEW: Function to trigger CSV download
  const handleExport = () => {
    if (orders.length === 0) {
      alert("No order data available to export.");
      return;
    }

    const csvString = convertToCSV(orders);
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "all_orders_export.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className='bg-white p-6 rounded-xl shadow-lg border border-gray-100'>
      <div className='flex justify-between items-center mb-10'>
        <h1 className='text-[#121212] font-extrabold text-6xl'>
          Manage Orders
        </h1>
        {/* ⭐️ NEW: Export Button */}
        <button
          onClick={handleExport}
          className={`px-4 py-2 text-sm font-medium rounded-lg shadow-md transition-colors 
            ${
              orders.length > 0
                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                : "bg-gray-400 text-gray-700 cursor-not-allowed"
            }`}
          disabled={orders.length === 0}
        >
          Export Data to CSV ({orders.length})
        </button>
      </div>

      <h2 className='text-xl font-semibold text-gray-800 mb-4'>
        Order Management Interface
      </h2>

      {ordersError && <p className='text-red-500'>Error: {ordersError}</p>}

      {!ordersError && orders.length > 0 && (
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
                        handlePaymentStatusChange(order.id, e.target.value)
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

      {!ordersError && orders.length === 0 && (
        <p className='text-gray-500'>No orders found.</p>
      )}
    </div>
  );
};

export default OrderManagementView;
