import React from "react";
import Table, { Column } from "@/app/components/ui/Table";
import Card from "@/app/components/ui/Card";

export interface RetailerPerformance {
  id: number | string;
  name: string;
  totalOrders: number;
  totalRevenue: number;
  [key: string]: unknown;
}

interface TopRetailersTableProps {
  retailers: RetailerPerformance[];
}

export default function TopRetailersTable({ retailers }: TopRetailersTableProps) {
  const formatCurrency = (val: number) => {
    return `₹${val.toLocaleString("en-IN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  const columns: Column<RetailerPerformance>[] = [
    {
      key: "name",
      header: "Retailer",
      render: (row) => <span className="font-medium text-card-foreground">{row.name}</span>,
    },
    {
      key: "totalOrders",
      header: "Total Orders",
      render: (row) => <span className="text-muted font-semibold">{row.totalOrders}</span>,
    },
    {
      key: "totalRevenue",
      header: "Total Revenue",
      render: (row) => <span className="text-emerald-600 font-semibold">{formatCurrency(row.totalRevenue)}</span>,
    },
  ];

  return (
    <Card className="flex flex-col h-full">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">Top Retailers</h3>
        <p className="text-xs text-muted mt-1">Top 10 retailers sorted by revenue</p>
      </div>

      <div className="flex-1">
        {retailers.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted">No retailer sales data for this period</div>
        ) : (
          <Table
            columns={columns}
            rows={retailers}
            getRowKey={(row) => row.id}
          />
        )}
      </div>
    </Card>
  );
}
