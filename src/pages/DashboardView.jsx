import React, { useEffect, useRef } from "react";
// Import all of D3 (assuming 'd3' package is installed)
import * as d3 from "d3";
// Import Icons from lucide-react

// Helper function to aggregate total revenue over time (daily)
const processRevenueData = (orders) => {
  const dailyRevenueMap = orders.reduce((acc, order) => {
    // Parse date for consistent grouping
    const date = new Date(order.created_at).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const amount = order.total_amount || 0;

    acc[date] = (acc[date] || 0) + amount;
    return acc;
  }, {});

  // Convert map back to array and ensure dates are parsed for sorting
  const sortedData = Object.keys(dailyRevenueMap)
    .map((dateString) => ({
      date: new Date(dateString + " 2024"), // Add year for proper sorting, assuming context
      revenue: parseFloat(dailyRevenueMap[dateString].toFixed(2)),
    }))
    .sort((a, b) => a.date - b.date);

  // Convert date object back to short format for display
  return sortedData.map((d) => ({
    ...d,
    dateString: d.date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  }));
};

// Helper function to count orders by delivery status
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

// --- D3 CHART COMPONENTS (omitted for brevity, assume content is the same) ---

// 1. Line Chart Component
const D3LineChart = ({ data, chartRef }) => {
  useEffect(() => {
    if (!data || data.length === 0) return;

    // Dimensions
    const margin = { top: 20, right: 30, bottom: 40, left: 60 };
    const width = chartRef.current.clientWidth - margin.left - margin.right;
    const height = chartRef.current.clientHeight - margin.top - margin.bottom;

    // Clear previous chart
    d3.select(chartRef.current).selectAll("*").remove();

    // Create SVG container
    const svg = d3
      .select(chartRef.current)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3
      .scalePoint()
      .domain(data.map((d) => d.dateString))
      .range([0, width])
      .padding(0.5);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.revenue) * 1.1])
      .range([height, 0]);

    // Line generator
    const line = d3
      .line()
      .x((d) => xScale(d.dateString))
      .y((d) => yScale(d.revenue))
      .curve(d3.curveMonotoneX);

    // Draw Line
    svg
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#059669") // Green Line
      .attr("stroke-width", 2)
      .attr("d", line);

    // Draw Axes
    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickSizeOuter(0));

    svg.append("g").call(d3.axisLeft(yScale).tickFormat((d) => `₱${d}`));

    // Add tooltips/interaction (D3 tooltips are complex, skipping detailed implementation for brevity)
    svg
      .selectAll(".dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", (d) => xScale(d.dateString))
      .attr("cy", (d) => yScale(d.revenue))
      .attr("r", 4)
      .attr("fill", "#059669")
      .on("mouseover", function (event, d) {
        d3.select(this).transition().duration(100).attr("r", 6);
        // In a real app, you'd show a custom tooltip element here
      })
      .on("mouseout", function (event, d) {
        d3.select(this).transition().duration(100).attr("r", 4);
      });
  }, [data, chartRef.current?.clientWidth, chartRef.current?.clientHeight]);

  return null; // D3 draws into the ref container
};

// 2. Pie/Arc Chart Component
const D3PieChart = ({ data, chartRef }) => {
  useEffect(() => {
    if (!data || data.length === 0) return;

    const margin = 20;
    const width = chartRef.current.clientWidth;
    const height = chartRef.current.clientHeight;
    const radius = Math.min(width, height) / 2 - margin;

    // Clear previous chart
    d3.select(chartRef.current).selectAll("*").remove();

    // Create SVG container
    const svg = d3
      .select(chartRef.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    // Color Scale (using the Tailwind-inspired colors from previous solutions)
    const color = d3
      .scaleOrdinal()
      .domain(data.map((d) => d.name))
      .range(["#4299e1", "#ed8936", "#48bb78", "#f56565"]);

    // Compute the position of each group on the pie
    const pie = d3
      .pie()
      .value((d) => d.value)
      .sort(null); // Do not sort slices

    const data_ready = pie(data);

    // Arc generator
    const arc = d3
      .arc()
      .innerRadius(radius * 0.5) // Doughnut hole
      .outerRadius(radius * 0.8);

    // Label generator (for outside labels)
    const outerArc = d3
      .arc()
      .innerRadius(radius * 0.9)
      .outerRadius(radius * 0.9);

    // Draw slices
    svg
      .selectAll("slices")
      .data(data_ready)
      .join("path")
      .attr("d", arc)
      .attr("fill", (d) => color(d.data.name))
      .attr("stroke", "white")
      .style("stroke-width", "2px")
      .style("opacity", 0.9);

    // Add labels (names and values, drawn outside)
    svg
      .selectAll("labels")
      .data(data_ready)
      .join("text")
      .text((d) => `${d.data.name} (${d.data.value})`)
      .attr("transform", (d) => {
        const pos = outerArc.centroid(d);
        // Adjust position to be further outside
        const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        pos[0] = radius * (midAngle < Math.PI ? 1 : -1);
        return `translate(${pos})`;
      })
      .style("text-anchor", (d) => {
        const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        return midAngle < Math.PI ? "start" : "end";
      })
      .style("font-size", 12)
      .style("fill", "#4A5568"); // Gray color

    // Add Polylines connecting slices to labels
    svg
      .selectAll("polylines")
      .data(data_ready)
      .join("polyline")
      .attr("stroke", "green") // Light gray
      .style("fill", "none")
      .attr("stroke-width", 1)
      .attr("points", (d) => {
        const posA = arc.centroid(d); // centroid of the arc
        const posB = outerArc.centroid(d); // position for the end of the line
        const posC = outerArc.centroid(d); // position for the text
        const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        posC[0] = radius * 0.99 * (midAngle < Math.PI ? 1 : -1); // x position of text
        return [posA, posB, posC];
      });
  }, [data, chartRef.current?.clientWidth, chartRef.current?.clientHeight]);

  return null;
};

// --- MAIN DASHBOARD COMPONENT ---

const DashboardView = ({ greetingName, dashboardStats, orders }) => {
  // Refs for the D3 drawing containers
  const revenueChartContainerRef = useRef(null);
  const statusChartContainerRef = useRef(null);

  const revenueData = processRevenueData(orders);
  const statusData = processStatusData(orders);

  // Set minimum height for chart containers to ensure D3 has space
  const chartStyle = { minHeight: "320px" };

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
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        {/* Card 1: Total Sales */}
        <div className='bg-green-700 p-6 rounded-xl shadow-lg border border-green-700 flex flex-col justify-between h-36'>
          {/* Top Row: Title and Icon Circle (Flex row) */}
          <div className='flex items-center justify-between'>
            <span className='text-sm font-medium text-white uppercase tracking-wider'>
              Total Sales (30 Days)
            </span>
          </div>
          {/* Bottom Row: Value */}
          <h3 className='text-4xl font-bold text-white'>
            ₱{dashboardStats.totalSales.toFixed(2)}
          </h3>
        </div>

        {/* Card 2: New Orders */}
        <div className='bg-blue-700 p-6 rounded-xl shadow-lg border border-blue-700 flex flex-col justify-between h-36'>
          {/* Top Row: Title and Icon Circle (Flex row) */}
          <div className='flex items-center justify-between'>
            <span className='text-sm font-medium text-white uppercase tracking-wider'>
              New Orders (30 Days)
            </span>
          </div>
          {/* Middle Content */}
          <h3 className='text-4xl font-bold text-white mt-1'>
            {dashboardStats.newOrders}
          </h3>
          {/* Bottom Row: Details */}
          <p className='text-xs text-white'>
            Check Order Management for details
          </p>
        </div>

        {/* Card 3: Avg Order Value */}
        <div className='bg-yellow-600 p-6 rounded-xl shadow-lg border border-yellow-600 flex flex-col justify-between h-36'>
          {/* Top Row: Title and Icon Circle (Flex row) */}
          <div className='flex items-center justify-between'>
            <span className='text-sm font-medium text-white uppercase tracking-wider'>
              Avg Order Value (30 Days)
            </span>
          </div>
          {/* Middle Content */}
          <h3 className='text-4xl font-bold text-white mt-1'>
            ₱
            {(
              dashboardStats.totalSales / (dashboardStats.newOrders || 1)
            ).toFixed(2)}
          </h3>
          {/* Bottom Row: Details */}
          <p className='text-xs text-white'>Sales / New Orders</p>
        </div>

        {/* Card 4: Top Item Sold */}
        <div className='bg-[#121212] p-6 rounded-xl shadow-lg border border-[#121212] flex flex-col justify-between h-36'>
          {/* Top Row: Title and Icon Circle (Flex row) */}
          <div className='flex items-center justify-between'>
            <span className='text-sm font-medium text-white uppercase tracking-wider'>
              Top Item Sold (30 Days)
            </span>
          </div>
          {/* Middle Content */}
          <h3 className='text-4xl font-bold text-white mt-1'>
            {dashboardStats.topItemSold}
          </h3>
          {/* Bottom Row: Details */}
          <p className='text-xs text-white'>Highest Quantity by Product</p>
        </div>
      </div>

      {/* ⚡️ CHARTS AREA (D3) */}
      <div className='mt-10 space-y-16'>
        <h2 className='text-3xl font-bold text-gray-800 ml-6'>
          Recent Activity & Trends
        </h2>

        {orders.length > 0 && (
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Chart 1: Total Revenue Over Time (D3 Line Chart) */}
            <div
              className='bg-white p-6 rounded-xl shadow-lg border border-gray-100 h-80'
              style={chartStyle}
            >
              <h3 className='text-xl font-semibold mb-4 text-gray-700'>
                Daily Revenue (Last 30 Days)
              </h3>
              {/* D3 draws the chart into this container */}
              <div
                ref={revenueChartContainerRef}
                style={{ height: "calc(100% - 30px)" }}
              >
                <D3LineChart
                  data={revenueData}
                  chartRef={revenueChartContainerRef}
                />
              </div>
            </div>

            {/* Chart 2: Orders by Status (D3 Pie Chart) */}
            <div
              className='bg-white p-6 rounded-xl shadow-lg border border-gray-100 h-80'
              style={chartStyle}
            >
              <h3 className='text-xl font-semibold mb-4 text-gray-700'>
                Orders by Delivery Status (Last 30 Days)
              </h3>
              {/* D3 draws the chart into this container */}
              <div
                ref={statusChartContainerRef}
                style={{ height: "calc(100% - 30px)" }}
              >
                <D3PieChart
                  data={statusData}
                  chartRef={statusChartContainerRef}
                />
              </div>
            </div>
          </div>
        )}
        {orders.length === 0 && (
          <p className='text-gray-500 ml-6'>
            No recent order data available to generate charts.
          </p>
        )}
      </div>
    </>
  );
};

export default DashboardView;
