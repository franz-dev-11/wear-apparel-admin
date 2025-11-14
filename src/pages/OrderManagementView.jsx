import React from "react";

const DELIVERY_STATUS_OPTIONS = [
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];
const PAYMENT_STATUS_OPTIONS = ["Pending", "Paid", "Failed", "Refunded"];

/**
 * Converts an array of objects (orders) into a CSV formatted string.
 * @param {Array<Object>} data The array of order objects.
 * @returns {string} The CSV formatted string.
 */
const convertToCSV = (data) => {
  if (!data || data.length === 0) return "";

  // 1. Get the headers (keys of the first object)
  const headers = Object.keys(data[0]);

  // 2. Format the headers row
  const csvHeaders = headers.join(",");

  // 3. Format the data rows
  const csvBody = data
    .map((row) =>
      headers
        .map((fieldName) => {
          // Handle null/undefined values and escape double quotes
          let value =
            row[fieldName] === null || row[fieldName] === undefined
              ? ""
              : row[fieldName].toString();
          // Wrap values in double quotes if they contain commas or double quotes
          if (value.includes(",") || value.includes('"')) {
            // Escape existing double quotes by doubling them
            value = value.replace(/"/g, '""');
            value = `"${value}"`;
          }
          return value;
        })
        .join(",")
    )
    .join("\n");

  return `${csvHeaders}\n${csvBody}`;
};

/**
 * Handles the download of the CSV file.
 * @param {Array<Object>} data The data to export.
 * @param {string} filename The name for the downloaded file.
 */
const handleExport = (data, filename = "orders.csv") => {
  const csvString = convertToCSV(data);
  if (!csvString) return;

  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const OrderManagementView = ({
  orders,
  ordersError,
  handleStatusChange,
  handlePaymentStatusChange,
  // Added the handleExport function to props
  // NOTE: We will use the local handleExport for this example as the original one was removed.
  // In a real app, you might receive it as a prop if it contains business logic.
}) => {
  // We'll use the local handleExport function, passing the current 'orders' data to it.
  const exportOrdersToCSV = () => {
    handleExport(
      orders,
      `orders_export_${new Date().toISOString().slice(0, 10)}.csv`
    );
  };

  return (
    <div className='bg-white p-6 rounded-xl shadow-lg border border-gray-100'>
      <div className='flex justify-between items-center mb-10'>
        <h1 className='text-[#121212] font-extrabold text-6xl'>
          Manage Orders
        </h1>
        {/* The Export Button is added back here */}
        <button
          onClick={exportOrdersToCSV}
          disabled={!orders || orders.length === 0}
          className={`py-2 px-4 rounded-lg text-white font-semibold shadow-md transition duration-200 
            ${
              !orders || orders.length === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            }`}
        >
          Export Data to CSV
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
                  Payment Method {/* ADDED: New header for payment method */}
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

                  {/* ADDED: New cell for payment method */}
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {order.payment_method || "N/A"}
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
