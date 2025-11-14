import React from "react";

const OrderManagement = ({
  orders,
  ordersLoading,
  ordersError,
  handleStatusChange,
  handlePaymentStatusChange,
  DELIVERY_STATUS_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
}) => {
  return (
    <div className='bg-white p-6 rounded-xl shadow-lg border border-gray-100'>
      <h1 className='text-[#121212] font-extrabold text-6xl mb-10'>
        Manage Orders
      </h1>
      <h2 className='text-xl font-semibold text-gray-800 mb-4'>
        Order Management Interface
      </h2>

      {ordersLoading && <p className='text-blue-500'>Loading orders...</p>}

      {ordersError && <p className='text-red-500'>Error: {ordersError}</p>}

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
                  Payment Method
                </th>
                <th className='px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Order Date (Created At)
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
                    {order.payment_method || "N/A"}
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

                  {/* Editable Delivery Status Dropdown */}
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
  );
};

export default OrderManagement;
