import React from "react";
import Table, { Column } from "@/app/components/ui/Table";
import Card from "@/app/components/ui/Card";

export interface ProductPerformance {
  id: number | string;
  name: string;
  qtySold: number;
  revenue: number;
  [key: string]: unknown;
}

interface TopProductsTableProps {
  products: ProductPerformance[];
}

export default function TopProductsTable({ products }: TopProductsTableProps) {
  const formatCurrency = (val: number) => {
    return `₹${val.toLocaleString("en-IN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  const columns: Column<ProductPerformance>[] = [
    {
      key: "name",
      header: "Product",
      render: (row) => <span className="font-medium text-card-foreground">{row.name}</span>,
    },
    {
      key: "qtySold",
      header: "Quantity Sold",
      render: (row) => <span className="text-muted font-semibold">{row.qtySold}</span>,
    },
    {
      key: "revenue",
      header: "Revenue",
      render: (row) => <span className="text-emerald-600 font-semibold">{formatCurrency(row.revenue)}</span>,
    },
  ];

  return (
    <Card className="flex flex-col h-full">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">Top Selling Products</h3>
        <p className="text-xs text-muted mt-1">Top 10 products by quantity sold</p>
      </div>

      <div className="flex-1">
        {products.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted">No product performance data for this period</div>
        ) : (
          <Table
            columns={columns}
            rows={products}
            getRowKey={(row) => row.id}
          />
        )}
      </div>
    </Card>
  );
}
