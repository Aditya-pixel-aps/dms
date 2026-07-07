"use client";

import { useEffect, useState } from "react";
import DashboardShell from "@/app/components/DashboardShell";
import Table, { Column } from "@/app/components/ui/Table";
import Badge from "@/app/components/ui/Badge";
import type { Product } from "@/lib/types";
import { supabase } from "@/lib/supabase/client";

const columns: Column<Product>[] = [
  { key: "name", header: "Product" },
  { key: "sku", header: "SKU" },
  { key: "price", header: "Price", render: (p) => `$${Number(p.price).toFixed(2)}` },
  {
    key: "stock_qty",
    header: "Availability",
    render: (p) =>
      p.stock_qty === 0 ? (
        <Badge tone="red">Out of stock</Badge>
      ) : (
        <Badge tone="green">In stock</Badge>
      ),
  },
];

export default function SalesmanProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const loadProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("id");
      if (error) {
        console.error("Error loading products:", error);
      } else if (data) {
        setProducts(data);
      }
    };
    loadProducts();
  }, []);

  return (
    <DashboardShell requiredRole="salesman" title="Products">
      <Table columns={columns} rows={products} getRowKey={(p) => p.id} />
    </DashboardShell>
  );
}
