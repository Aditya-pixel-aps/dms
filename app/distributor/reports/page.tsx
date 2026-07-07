"use client";

import { useEffect, useState, useMemo } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

import DashboardShell from "@/app/components/DashboardShell";
import Spinner from "@/app/components/ui/Spinner";
import Button from "@/app/components/ui/Button";
import Input from "@/app/components/ui/Input";
import { supabase } from "@/lib/supabase/client";

import AnalyticsCards from "@/app/components/analytics/AnalyticsCards";
import OrdersPieChart from "@/app/components/analytics/OrdersPieChart";
import RevenueBarChart from "@/app/components/analytics/RevenueBarChart";
import OrdersLineChart from "@/app/components/analytics/OrdersLineChart";
import TopProductsTable from "@/app/components/analytics/TopProductsTable";
import LowStockTable from "@/app/components/analytics/LowStockTable";
import TopRetailersTable from "@/app/components/analytics/TopRetailersTable";
import SalesmanPerformanceTable from "@/app/components/analytics/SalesmanPerformanceTable";
import VehicleAnalyticsTable from "@/app/components/analytics/VehicleAnalyticsTable";
import RouteAnalyticsTable from "@/app/components/analytics/RouteAnalyticsTable";
import RecentActivity, { ActivityItem } from "@/app/components/analytics/RecentActivity";

type DateFilterType = "Today" | "7days" | "30days" | "month" | "year" | "custom";

export default function DistributorReportsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Raw fetched tables from Supabase
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [retailers, setRetailers] = useState<any[]>([]);
  const [salesmen, setSalesmen] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);

  // Global filters
  const [filter, setFilter] = useState<DateFilterType>("30days");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  // Search keyword
  const [search, setSearch] = useState("");

  // Initialize custom dates with reasonable values
  useEffect(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    setCustomStart(thirtyDaysAgo);
    setCustomEnd(todayStr);
  }, []);

  // Fetch all Supabase data
  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        ordersRes,
        productsRes,
        retailersRes,
        salesmenRes,
        vehiclesRes,
        routesRes,
        invoicesRes,
      ] = await Promise.all([
        supabase.from("orders").select(`
          id,
          retailer_id,
          salesman_id,
          route_id,
          status,
          order_date,
          created_at,
          vehicle_id,
          retailers ( name ),
          salesmen ( name ),
          routes ( name ),
          order_items (
            product_id,
            qty,
            unit_price,
            products ( name )
          )
        `),
        supabase.from("products").select("id, sku, name, price, stock_qty"),
        supabase.from("retailers").select("id, name, route_id"),
        supabase.from("salesmen").select("id, name, active"),
        supabase.from("vehicles").select("id, vehicle_no, capacity, route_id"),
        supabase.from("routes").select("id, name"),
        supabase.from("invoices").select("id, order_id, total, billed_at, vehicle_id"),
      ]);

      // Check results individually to log errors but keep loading remainder
      if (ordersRes?.error) console.error("Error loading orders:", ordersRes?.error?.message);
      if (productsRes?.error) console.error("Error loading products:", productsRes?.error?.message);
      if (retailersRes?.error) console.error("Error loading retailers:", retailersRes?.error?.message);
      if (salesmenRes?.error) console.error("Error loading salesmen:", salesmenRes?.error?.message);
      if (vehiclesRes?.error) console.error("Error loading vehicles:", vehiclesRes?.error?.message);
      if (routesRes?.error) console.error("Error loading routes:", routesRes?.error?.message);
      if (invoicesRes?.error) console.error("Error loading invoices:", invoicesRes?.error?.message);

      setOrders(ordersRes?.data || []);
      setProducts(productsRes?.data || []);
      setRetailers(retailersRes?.data || []);
      setSalesmen(salesmenRes?.data || []);
      setVehicles(vehiclesRes?.data || []);
      setRoutes(routesRes?.data || []);
      setInvoices(invoicesRes?.data || []);
    } catch (err: any) {
      console.error("Dashboard parallel loading failed:", err);
      setError("Failed to fetch analytics data from Supabase.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Compute date range objects based on selected filter
  const dateRange = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    let start = todayStart;
    let end = todayEnd;

    if (filter === "Today") {
      start = todayStart;
      end = todayEnd;
    } else if (filter === "7days") {
      start = new Date(todayStart.getTime() - 6 * 24 * 60 * 60 * 1000);
      end = todayEnd;
    } else if (filter === "30days") {
      start = new Date(todayStart.getTime() - 29 * 24 * 60 * 60 * 1000);
      end = todayEnd;
    } else if (filter === "month") {
      start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    } else if (filter === "year") {
      start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
      end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
    } else if (filter === "custom") {
      if (customStart) {
        const [y, m, d] = customStart.split("-").map(Number);
        start = new Date(y, m - 1, d, 0, 0, 0, 0);
      } else {
        start = todayStart;
      }
      if (customEnd) {
        const [y, m, d] = customEnd.split("-").map(Number);
        end = new Date(y, m - 1, d, 23, 59, 59, 999);
      } else {
        end = todayEnd;
      }
    }
    return { start, end };
  }, [filter, customStart, customEnd]);

  // Parsing helper to avoid local timezone offset shifting the date
  const parseLocalDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  // Filtered dataset subsets based on date range
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const orderDate = parseLocalDate(o.order_date);
      return orderDate >= dateRange.start && orderDate <= dateRange.end;
    });
  }, [orders, dateRange]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const billedDate = new Date(inv.billed_at);
      return billedDate >= dateRange.start && billedDate <= dateRange.end;
    });
  }, [invoices, dateRange]);



  // Aggregate summary metrics
  const summaryMetrics = useMemo(() => {
    const totalOrdersCount = filteredOrders.length;
    const pending = filteredOrders.filter((o) => o.status === "Pending").length;
    const billed = filteredOrders.filter((o) => o.status === "Billed").length;
    const dispatched = filteredOrders.filter((o) => o.status === "Dispatched").length;
    const delivered = filteredOrders.filter((o) => o.status === "Delivered").length;
    const cancelled = filteredOrders.filter((o) => o.status === "Cancelled").length;

    const totalRev = filteredInvoices.reduce((sum, inv) => sum + Number(inv.total), 0);

    const activeSalesmenCount = salesmen.filter((s) => s.active).length;

    return {
      totalOrders: totalOrdersCount,
      pendingOrders: pending,
      billedOrders: billed,
      dispatchedOrders: dispatched,
      deliveredOrders: delivered,
      cancelledOrders: cancelled,
      totalRetailers: retailers.length,
      totalProducts: products.length,
      totalSalesmen: activeSalesmenCount,
      totalVehicles: vehicles.length,
      totalRevenue: totalRev,
    };
  }, [filteredOrders, filteredInvoices, retailers, products, salesmen, vehicles]);

  // Aggregate order status breakdown for Pie Chart
  const orderStatusPieData = useMemo(() => {
    return [
      { name: "Pending", value: summaryMetrics.pendingOrders },
      { name: "Billed", value: summaryMetrics.billedOrders },
      { name: "Dispatched", value: summaryMetrics.dispatchedOrders },
      { name: "Delivered", value: summaryMetrics.deliveredOrders },
      { name: "Cancelled", value: summaryMetrics.cancelledOrders },
    ];
  }, [summaryMetrics]);

  // Aggregate monthly sales for Bar Chart (Chronological order)
  const monthlyRevenueData = useMemo(() => {
    const monthlyMap: Record<string, number> = {};
    filteredInvoices.forEach((inv) => {
      const date = new Date(inv.billed_at);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      monthlyMap[key] = (monthlyMap[key] || 0) + Number(inv.total);
    });

    const sortedKeys = Object.keys(monthlyMap).sort();
    return sortedKeys.map((key) => {
      const [year, month] = key.split("-");
      const labelDate = new Date(Number(year), Number(month) - 1, 1);
      return {
        month: labelDate.toLocaleDateString("en-IN", { month: "short", year: "2-digit" }),
        revenue: monthlyMap[key],
      };
    });
  }, [filteredInvoices]);

  // Aggregate monthly orders for Line Chart
  const monthlyOrdersData = useMemo(() => {
    const monthlyMap: Record<string, number> = {};
    filteredOrders.forEach((o) => {
      const key = o.order_date.slice(0, 7); // YYYY-MM
      monthlyMap[key] = (monthlyMap[key] || 0) + 1;
    });

    const sortedKeys = Object.keys(monthlyMap).sort();
    return sortedKeys.map((key) => {
      const [year, month] = key.split("-");
      const labelDate = new Date(Number(year), Number(month) - 1, 1);
      return {
        month: labelDate.toLocaleDateString("en-IN", { month: "short", year: "2-digit" }),
        orders: monthlyMap[key],
      };
    });
  }, [filteredOrders]);

  // Match search keyword helper
  const searchMatch = (val: string) => {
    if (!search.trim()) return true;
    return val.toLowerCase().includes(search.toLowerCase().trim());
  };

  // Aggregate Top Selling Products
  const topProducts = useMemo(() => {
    const productMap: Record<number, { name: string; qtySold: number; revenue: number }> = {};

    filteredOrders.forEach((o) => {
      if (o.status !== "Cancelled" && o.order_items) {
        o.order_items.forEach((item: any) => {
          const prodId = item.product_id;
          const qty = Number(item.qty);
          const price = Number(item.unit_price);
          const name = item.products?.name || `Product #${prodId}`;

          if (!productMap[prodId]) {
            productMap[prodId] = { name, qtySold: 0, revenue: 0 };
          }
          productMap[prodId].qtySold += qty;
          productMap[prodId].revenue += qty * price;
        });
      }
    });

    const list = Object.keys(productMap).map((id) => ({
      id: Number(id),
      ...productMap[Number(id)],
    }));

    return list
      .filter((p) => searchMatch(p.name))
      .sort((a, b) => b.qtySold - a.qtySold)
      .slice(0, 10);
  }, [filteredOrders, search]);

  // Low stock products (lowest stock first)
  const lowStockProducts = useMemo(() => {
    return products
      .filter((p) => searchMatch(p.name) || (p.sku && searchMatch(p.sku)))
      .sort((a, b) => a.stock_qty - b.stock_qty);
  }, [products, search]);

  // Top Retailers by revenue
  const topRetailers = useMemo(() => {
    const retailerMap: Record<number, { name: string; totalOrders: number; totalRevenue: number }> = {};

    filteredOrders.forEach((o) => {
      if (o.status !== "Cancelled") {
        const retId = o.retailer_id;
        const name = o.retailers?.name || `Retailer #${retId}`;
        const orderRev = o.order_items
          ? o.order_items.reduce((sum: number, item: any) => sum + Number(item.qty) * Number(item.unit_price), 0)
          : 0;

        if (!retailerMap[retId]) {
          retailerMap[retId] = { name, totalOrders: 0, totalRevenue: 0 };
        }
        retailerMap[retId].totalOrders += 1;
        retailerMap[retId].totalRevenue += orderRev;
      }
    });

    const list = Object.keys(retailerMap).map((id) => ({
      id: Number(id),
      ...retailerMap[Number(id)],
    }));

    return list
      .filter((r) => searchMatch(r.name))
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 10);
  }, [filteredOrders, search]);

  // Salesmen performance
  const salesmanPerformance = useMemo(() => {
    const salesmenMap: Record<number, { name: string; totalOrders: number; totalRevenue: number; deliveredOrders: number }> = {};

    // Initialize all salesmen to display even with 0 metrics
    salesmen.forEach((s) => {
      salesmenMap[s.id] = { name: s.name, totalOrders: 0, totalRevenue: 0, deliveredOrders: 0 };
    });

    filteredOrders.forEach((o) => {
      const salesId = o.salesman_id;
      if (!salesmenMap[salesId]) {
        salesmenMap[salesId] = {
          name: o.salesmen?.name || `Salesman #${salesId}`,
          totalOrders: 0,
          totalRevenue: 0,
          deliveredOrders: 0,
        };
      }

      if (o.status !== "Cancelled") {
        const orderRev = o.order_items
          ? o.order_items.reduce((sum: number, item: any) => sum + Number(item.qty) * Number(item.unit_price), 0)
          : 0;

        salesmenMap[salesId].totalOrders += 1;
        salesmenMap[salesId].totalRevenue += orderRev;
        if (o.status === "Delivered") {
          salesmenMap[salesId].deliveredOrders += 1;
        }
      }
    });

    return Object.keys(salesmenMap)
      .map((id) => ({
        id: Number(id),
        ...salesmenMap[Number(id)],
      }))
      .filter((s) => searchMatch(s.name))
      .sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, [filteredOrders, salesmen, search]);

  // Vehicle utilization (dispatches & deliveries)
  const vehiclePerformance = useMemo(() => {
    const vehicleMap: Record<number, { vehicleNo: string; assignedOrders: number; deliveredOrders: number; capacity: number | string }> = {};

    vehicles.forEach((v) => {
      vehicleMap[v.id] = { vehicleNo: v.vehicle_no, assignedOrders: 0, deliveredOrders: 0, capacity: v.capacity ?? "—" };
    });

    filteredOrders.forEach((o) => {
      const vehId = o.vehicle_id;
      if (vehId && vehicleMap[vehId]) {
        vehicleMap[vehId].assignedOrders += 1;
        if (o.status === "Delivered") {
          vehicleMap[vehId].deliveredOrders += 1;
        }
      }
    });

    return Object.keys(vehicleMap)
      .map((id) => ({
        id: Number(id),
        ...vehicleMap[Number(id)],
      }))
      .filter((v) => searchMatch(v.vehicleNo))
      .sort((a, b) => b.assignedOrders - a.assignedOrders);
  }, [filteredOrders, vehicles, search]);

  // Route Performance
  const routePerformance = useMemo(() => {
    const routeMap: Record<number, { name: string; totalOrders: number; totalRevenue: number; totalRetailers: number }> = {};

    routes.forEach((r) => {
      const retailersOnRoute = retailers.filter((ret) => ret.route_id === r.id).length;
      routeMap[r.id] = { name: r.name, totalOrders: 0, totalRevenue: 0, totalRetailers: retailersOnRoute };
    });

    filteredOrders.forEach((o) => {
      const routeId = o.route_id;
      if (!routeMap[routeId]) {
        const retailersOnRoute = retailers.filter((ret) => ret.route_id === routeId).length;
        routeMap[routeId] = {
          name: o.routes?.name || `Route #${routeId}`,
          totalOrders: 0,
          totalRevenue: 0,
          totalRetailers: retailersOnRoute,
        };
      }

      if (o.status !== "Cancelled") {
        const orderRev = o.order_items
          ? o.order_items.reduce((sum: number, item: any) => sum + Number(item.qty) * Number(item.unit_price), 0)
          : 0;

        routeMap[routeId].totalOrders += 1;
        routeMap[routeId].totalRevenue += orderRev;
      }
    });

    return Object.keys(routeMap)
      .map((id) => ({
        id: Number(id),
        ...routeMap[Number(id)],
      }))
      .filter((r) => searchMatch(r.name))
      .sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, [filteredOrders, routes, retailers, search]);

  // Compile Chronological Recent Activity feed
  const recentActivities = useMemo(() => {
    const items: ActivityItem[] = [];

    // 1. Order placements / dispatches / deliveries
    filteredOrders.forEach((o) => {
      const retName = o.retailers?.name || "Unknown Retailer";
      const itemsCount = o.order_items ? o.order_items.reduce((sum: number, item: any) => sum + Number(item.qty), 0) : 0;

      // Order created
      items.push({
        id: `created-${o.id}`,
        type: "order_created",
        title: "Order Captured",
        description: `${retName} placed Order #${o.id} containing ${itemsCount} items.`,
        timestamp: o.created_at,
      });

      // Dispatched (vehicle assigned)
      if (o.vehicle_id && (o.status === "Dispatched" || o.status === "Delivered")) {
        const vehicleNo = vehicles.find((v) => v.id === o.vehicle_id)?.vehicle_no || "assigned vehicle";
        items.push({
          id: `dispatched-${o.id}`,
          type: "vehicle_assigned",
          title: "Vehicle Dispatched",
          description: `Vehicle ${vehicleNo} assigned for Order #${o.id} delivery to ${retName}.`,
          timestamp: o.created_at, // use fallback or billing
        });
      }

      // Delivered
      if (o.status === "Delivered") {
        items.push({
          id: `delivered-${o.id}`,
          type: "order_delivered",
          title: "Order Delivered",
          description: `Order #${o.id} successfully delivered to ${retName}.`,
          timestamp: o.created_at,
        });
      }
    });

    // 2. Invoices (Order Approved / Billed)
    filteredInvoices.forEach((inv) => {
      const order = orders.find((o) => o.id === inv.order_id);
      const retName = order?.retailers?.name || "Retailer";
      items.push({
        id: `invoice-${inv.id}`,
        type: "invoice_generated",
        title: "Order Approved",
        description: `Invoice INV-${inv.id} generated for ${retName} (Order #${inv.order_id}). Total: ₹${Number(inv.total).toLocaleString("en-IN")}`,
        timestamp: inv.billed_at,
      });
    });

    // Sort newest first
    return items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 15);
  }, [filteredOrders, filteredInvoices, vehicles, orders]);

  // Export PDF Report handler
  const exportPdfReport = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const primaryColor: [number, number, number] = [15, 23, 42]; // Slate 900
    const secondaryColor: [number, number, number] = [79, 70, 229]; // Indigo 600

    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("DMS DISTRIBUTOR - ANALYTICS REPORT", 15, 20);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(107, 114, 128); // Gray 500
    const dateRangeStr = `${dateRange.start.toLocaleDateString("en-IN")} to ${dateRange.end.toLocaleDateString("en-IN")}`;
    doc.text(`Report Period: ${filter} (${dateRangeStr})`, 15, 25);
    doc.text(`Generated at: ${new Date().toLocaleString("en-IN")}`, 15, 29);

    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.5);
    doc.line(15, 33, 195, 33);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("1. SUMMARY METRICS", 15, 41);

    const summaryRows = [
      ["Total Revenue", `₹${summaryMetrics.totalRevenue.toLocaleString("en-IN")}`],
      ["Total Orders", summaryMetrics.totalOrders.toString()],
      ["Pending Orders", summaryMetrics.pendingOrders.toString()],
      ["Billed Orders", summaryMetrics.billedOrders.toString()],
      ["Dispatched Orders", summaryMetrics.dispatchedOrders.toString()],
      ["Delivered Orders", summaryMetrics.deliveredOrders.toString()],
      ["Cancelled Orders", summaryMetrics.cancelledOrders.toString()],
      ["Total Retailers", summaryMetrics.totalRetailers.toString()],
      ["Total Products", summaryMetrics.totalProducts.toString()],
      ["Total Salesmen", summaryMetrics.totalSalesmen.toString()],
      ["Total Vehicles", summaryMetrics.totalVehicles.toString()],
    ];

    autoTable(doc, {
      startY: 44,
      margin: { left: 15, right: 15 },
      head: [["Metric", "Value"]],
      body: summaryRows,
      theme: "striped",
      headStyles: { fillColor: primaryColor, textColor: [255, 255, 255] },
      styles: { fontSize: 8.5 },
    });

    let currentY = (doc as any).lastAutoTable.finalY + 10;

    const printTable = (title: string, headers: string[], body: any[][]) => {
      if (currentY > 230) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(title, 15, currentY);

      autoTable(doc, {
        startY: currentY + 3,
        margin: { left: 15, right: 15 },
        head: [headers],
        body: body,
        theme: "striped",
        headStyles: { fillColor: primaryColor, textColor: [255, 255, 255] },
        styles: { fontSize: 8.5 },
      });

      currentY = (doc as any).lastAutoTable.finalY + 10;
    };

    const topProductsRows = topProducts.slice(0, 5).map((p, idx) => [
      (idx + 1).toString(),
      p.name,
      p.qtySold.toString(),
      `₹${p.revenue.toLocaleString("en-IN")}`,
    ]);
    printTable("2. TOP SELLING PRODUCTS", ["S.No", "Product", "Qty Sold", "Revenue"], topProductsRows);

    const lowStockRows = lowStockProducts.slice(0, 5).map((p, idx) => [
      (idx + 1).toString(),
      p.name,
      p.stock_qty.toString(),
    ]);
    printTable("3. LOW STOCK PRODUCTS", ["S.No", "Product", "Stock Qty"], lowStockRows);

    const topRetailersRows = topRetailers.slice(0, 5).map((r, idx) => [
      (idx + 1).toString(),
      r.name,
      r.totalOrders.toString(),
      `₹${r.totalRevenue.toLocaleString("en-IN")}`,
    ]);
    printTable("4. TOP RETAILERS", ["S.No", "Retailer", "Orders", "Revenue"], topRetailersRows);

    const salesmanRows = salesmanPerformance.slice(0, 5).map((s, idx) => [
      (idx + 1).toString(),
      s.name,
      s.totalOrders.toString(),
      s.deliveredOrders.toString(),
      `₹${s.totalRevenue.toLocaleString("en-IN")}`,
    ]);
    printTable("5. SALESMAN PERFORMANCE", ["S.No", "Salesman", "Orders", "Delivered", "Revenue"], salesmanRows);

    const vehicleRows = vehiclePerformance.slice(0, 5).map((v, idx) => [
      (idx + 1).toString(),
      v.vehicleNo,
      v.assignedOrders.toString(),
      v.deliveredOrders.toString(),
      v.capacity?.toString() ?? "—",
    ]);
    printTable("6. VEHICLE UTILIZATION", ["S.No", "Vehicle No", "Assigned", "Delivered", "Capacity"], vehicleRows);

    const routeRows = routePerformance.slice(0, 5).map((r, idx) => [
      (idx + 1).toString(),
      r.name,
      r.totalOrders.toString(),
      r.totalRetailers.toString(),
      `₹${r.totalRevenue.toLocaleString("en-IN")}`,
    ]);
    printTable("7. ROUTE PERFORMANCE", ["S.No", "Route", "Orders", "Retailers", "Revenue"], routeRows);

    doc.save(`dms_analytics_${filter}_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  // Export Excel / CSV Report handler
  const exportExcelReport = () => {
    const dateRangeStr = `${dateRange.start.toISOString().slice(0, 10)} to ${dateRange.end.toISOString().slice(0, 10)}`;

    let csvContent = "";
    csvContent += "DMS DISTRIBUTOR - ANALYTICS REPORT\n";
    csvContent += `Report Period, ${filter} (${dateRangeStr})\n`;
    csvContent += `Generated at, ${new Date().toLocaleString("en-IN")}\n\n`;

    csvContent += "1. SUMMARY METRICS\n";
    csvContent += "Metric,Value\n";
    csvContent += `Total Revenue, ${summaryMetrics.totalRevenue}\n`;
    csvContent += `Total Orders, ${summaryMetrics.totalOrders}\n`;
    csvContent += `Pending Orders, ${summaryMetrics.pendingOrders}\n`;
    csvContent += `Billed Orders, ${summaryMetrics.billedOrders}\n`;
    csvContent += `Dispatched Orders, ${summaryMetrics.dispatchedOrders}\n`;
    csvContent += `Delivered Orders, ${summaryMetrics.deliveredOrders}\n`;
    csvContent += `Cancelled Orders, ${summaryMetrics.cancelledOrders}\n`;
    csvContent += `Total Retailers, ${summaryMetrics.totalRetailers}\n`;
    csvContent += `Total Products, ${summaryMetrics.totalProducts}\n`;
    csvContent += `Total Salesmen, ${summaryMetrics.totalSalesmen}\n`;
    csvContent += `Total Vehicles, ${summaryMetrics.totalVehicles}\n\n`;

    csvContent += "2. TOP SELLING PRODUCTS\n";
    csvContent += "Rank,Product,Quantity Sold,Revenue (INR)\n";
    topProducts.forEach((p, idx) => {
      csvContent += `${idx + 1},"${p.name.replace(/"/g, '""')}",${p.qtySold},${p.revenue}\n`;
    });
    csvContent += "\n";

    csvContent += "3. LOW STOCK PRODUCTS\n";
    csvContent += "Rank,Product,Current Stock\n";
    lowStockProducts.forEach((p, idx) => {
      csvContent += `${idx + 1},"${p.name.replace(/"/g, '""')}",${p.stock_qty}\n`;
    });
    csvContent += "\n";

    csvContent += "4. TOP RETAILERS\n";
    csvContent += "Rank,Retailer,Total Orders,Total Revenue (INR)\n";
    topRetailers.forEach((r, idx) => {
      csvContent += `${idx + 1},"${r.name.replace(/"/g, '""')}",${r.totalOrders},${r.totalRevenue}\n`;
    });
    csvContent += "\n";

    csvContent += "5. SALESMAN PERFORMANCE\n";
    csvContent += "Rank,Salesman,Orders,Delivered Orders,Total Revenue (INR)\n";
    salesmanPerformance.forEach((s, idx) => {
      csvContent += `${idx + 1},"${s.name.replace(/"/g, '""')}",${s.totalOrders},${s.deliveredOrders},${s.totalRevenue}\n`;
    });
    csvContent += "\n";

    csvContent += "6. VEHICLE UTILIZATION\n";
    csvContent += "Rank,Vehicle Number,Assigned Orders,Delivered Orders,Capacity\n";
    vehiclePerformance.forEach((v, idx) => {
      csvContent += `${idx + 1},"${v.vehicleNo.replace(/"/g, '""')}",${v.assignedOrders},${v.deliveredOrders},"${(v.capacity ?? "").toString().replace(/"/g, '""')}"\n`;
    });
    csvContent += "\n";

    csvContent += "7. ROUTE PERFORMANCE\n";
    csvContent += "Rank,Route,Orders,Retailers,Total Revenue (INR)\n";
    routePerformance.forEach((r, idx) => {
      csvContent += `${idx + 1},"${r.name.replace(/"/g, '""')}",${r.totalOrders},${r.totalRetailers},${r.totalRevenue}\n`;
    });
    csvContent += "\n";

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `dms_analytics_${filter}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardShell requiredRole="distributor" title="Analytics Dashboard">
      {/* Page Actions & Filters Header */}
      <div className="flex flex-col gap-4 border-b border-border bg-card/10 p-5 rounded-2xl mb-6 lg:flex-row lg:items-center lg:justify-between shadow-xs">
        {/* Left: Global Date Toggles */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(["Today", "7days", "30days", "month", "year", "custom"] as const).map((opt) => {
            const labelMap = {
              Today: "Today",
              "7days": "7 Days",
              "30days": "30 Days",
              month: "This Month",
              year: "This Year",
              custom: "Custom Range",
            };
            return (
              <Button
                key={opt}
                variant={filter === opt ? "primary" : "secondary"}
                onClick={() => setFilter(opt)}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg"
              >
                {labelMap[opt]}
              </Button>
            );
          })}
        </div>

        {/* Center/Right Inputs: Custom date pickers and Search bar */}
        <div className="flex flex-wrap items-end gap-3.5">
          {filter === "custom" && (
            <div className="flex items-center gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-muted uppercase tracking-wider">Start Date</label>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="rounded-lg border border-border bg-card px-2.5 py-1 text-xs text-card-foreground outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all duration-200"
                />
              </div>
              <span className="text-muted self-end mb-1.5 font-medium">—</span>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-muted uppercase tracking-wider">End Date</label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="rounded-lg border border-border bg-card px-2.5 py-1 text-xs text-card-foreground outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all duration-200"
                />
              </div>
            </div>
          )}

          {/* Search Analytics input */}
          <div className="w-56">
            <Input
              type="text"
              placeholder="Search analytics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3.5 py-1.5 text-xs"
            />
          </div>

          {/* Exports Buttons */}
          <div className="flex gap-2">
            <Button variant="secondary" onClick={exportPdfReport} className="px-3 py-1.5 text-xs flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              PDF
            </Button>
            <Button variant="secondary" onClick={exportExcelReport} className="px-3 py-1.5 text-xs flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Excel (CSV)
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex h-96 items-center justify-center">
          <Spinner label="Assembling analytics..." />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200/50 bg-red-50/50 p-6 text-center dark:bg-red-950/10 dark:border-red-900/30">
          <p className="text-sm font-semibold text-red-600 dark:text-red-400">{error}</p>
          <Button variant="secondary" onClick={loadDashboardData} className="mt-4 px-4 py-2">
            Retry Loading
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* SECTION 1: Summary Cards */}
          <AnalyticsCards
            totalOrders={summaryMetrics.totalOrders}
            pendingOrders={summaryMetrics.pendingOrders}
            billedOrders={summaryMetrics.billedOrders}
            dispatchedOrders={summaryMetrics.dispatchedOrders}
            deliveredOrders={summaryMetrics.deliveredOrders}
            cancelledOrders={summaryMetrics.cancelledOrders}
            totalRetailers={summaryMetrics.totalRetailers}
            totalProducts={summaryMetrics.totalProducts}
            totalSalesmen={summaryMetrics.totalSalesmen}
            totalVehicles={summaryMetrics.totalVehicles}
            totalRevenue={summaryMetrics.totalRevenue}
          />

          {/* Charts Row: Status Pie, Monthly Revenue Bar, Monthly Orders Line */}
          <div className="grid gap-6 md:grid-cols-3">
            {/* SECTION 2: Order Status */}
            <OrdersPieChart data={orderStatusPieData} />
            {/* SECTION 3: Monthly Sales */}
            <RevenueBarChart data={monthlyRevenueData} />
            {/* SECTION 4: Monthly Orders */}
            <OrdersLineChart data={monthlyOrdersData} />
          </div>

          {/* Tables Row 1: Top Selling Products, Low Stock Alert */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* SECTION 5: Top Selling Products */}
            <TopProductsTable products={topProducts} />
            {/* SECTION 6: Low Stock Products */}
            <LowStockTable products={lowStockProducts} />
          </div>

          {/* Tables Row 2: Top Retailers, Salesman Performance */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* SECTION 7: Top Retailers */}
            <TopRetailersTable retailers={topRetailers} />
            {/* SECTION 8: Salesman Performance */}
            <SalesmanPerformanceTable salesmen={salesmanPerformance} />
          </div>

          {/* Tables Row 3: Vehicle Utilization, Route Performance */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* SECTION 9: Vehicle Utilization */}
            <VehicleAnalyticsTable vehicles={vehiclePerformance} />
            {/* SECTION 10: Route Performance */}
            <RouteAnalyticsTable routes={routePerformance} />
          </div>

          {/* SECTION 11: Recent Activity chronological timeline */}
          <div>
            <RecentActivity activities={recentActivities} />
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
