import React from "react";
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

// Function to aggregate total revenue over time (daily)
const processRevenueData = (orders) => {
  const dailyRevenueMap = orders.reduce((acc, order) => {
    const date = new Date(order.created_at).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const amount = order.total_amount || 0;

    acc[date] = (acc[date] || 0) + amount;
    return acc;
  }, {});

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
    const status = order.delivery_status || "Unknown";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  return Object.keys(statusCounts).map((status) => ({
    name: status,
    value: statusCounts[status],
  }));
};

const DashboardView = ({
  greetingName,
  dashboardStats,
  orders,
  ordersLoading,
}) => {
  return (
    <>
      <h1 className='text-[#121212] font-extrabold text-6xl mb-10 ml-6 mt-6'>
        Realtime Dashboard
      </h1>
      <p className='text-gray-700 mb-8 ml-6'>
        Welcome, <span className='font-semibold'>{greetingName}</span>! Here is
        your WEAR APPAREL business summary.
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
                dashboardStats.totalSales / (dashboardStats.newOrders || 1)
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
                    formatter={(value) => [`₱${value.toFixed(2)}`, "Revenue"]}
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
    </>
  );
};

export default DashboardView;
