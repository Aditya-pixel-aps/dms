"use client";

import { useEffect, useState } from "react";
import DashboardShell from "@/app/components/DashboardShell";
import { StatCard } from "@/app/components/ui/Card";
import { supabase } from "@/lib/supabase/client";

export default function DistributorPage() {
  const [pendingOrders, setPendingOrders] = useState<number | string>("—");
  const [todaysOrders, setTodaysOrders] = useState<number | string>("—");
  const [revenue, setRevenue] = useState<string>("—");
  const [productsCount, setProductsCount] = useState<number | string>("—");
  const [lowStockCount, setLowStockCount] = useState<number | string>("—");

  useEffect(() => {
    async function loadStats() {
      // 1. Pending Orders
      const { count: pending, error: pendingError } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("status", "Pending");
      if (!pendingError && pending !== null) {
        setPendingOrders(pending);
      } else if (pendingError) {
        console.error("Error loading pending orders:", pendingError);
      }

      // 2. Today's Orders
      const todayStr = new Date().toISOString().slice(0, 10);
      const { count: todayCount, error: todayError } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("order_date", todayStr);
      if (!todayError && todayCount !== null) {
        setTodaysOrders(todayCount);
      } else if (todayError) {
        console.error("Error loading today's orders:", todayError);
      }

      // 3. Revenue
      const { data: invoices, error: revenueError } = await supabase
        .from("invoices")
        .select("total");
      if (!revenueError && invoices) {
        const sum = invoices.reduce((acc, inv) => acc + Number(inv.total), 0);
        setRevenue(`Rs ${sum.toLocaleString()}`);
      } else if (revenueError) {
        console.error("Error loading revenue:", revenueError);
      }

      // 4. Products
      const { count: prodCount, error: prodError } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true });
      if (!prodError && prodCount !== null) {
        setProductsCount(prodCount);
      } else if (prodError) {
        console.error("Error loading products count:", prodError);
      }

      // 5. Low Stock
      const { count: lowCount, error: lowError } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .lt("stock_qty", 20);
      if (!lowError && lowCount !== null) {
        setLowStockCount(lowCount);
      } else if (lowError) {
        console.error("Error loading low stock count:", lowError);
      }
    }
    loadStats();
  }, []);

  return (
    <DashboardShell requiredRole="distributor" title="Distributor Dashboard">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Pending Orders" value={pendingOrders} />
        <StatCard label="Today's Orders" value={todaysOrders} />
        <StatCard label="Revenue" value={revenue} />
        <StatCard label="Products" value={productsCount} />
        <StatCard label="Low Stock" value={lowStockCount} />
      </div>
    </DashboardShell>
  );
}