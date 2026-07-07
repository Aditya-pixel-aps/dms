import React from "react";
import Table, { Column } from "@/app/components/ui/Table";
import Card from "@/app/components/ui/Card";

export interface SalesmanPerformance {
  id: number | string;
  name: string;
  totalOrders: number;
  totalRevenue: number;
  deliveredOrders: number;
  [key: string]: unknown;
}

interface SalesmanPerformanceTableProps {
  salesmen: SalesmanPerformance[];
}

export default function SalesmanPerformanceTable({ salesmen }: SalesmanPerformanceTableProps) {
  const formatCurrency = (val: number) => {
    return `₹${val.toLocaleString("en-IN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  const columns: Column<SalesmanPerformance>[] = [
    {
      key: "name",
      header: "Salesman",
      render: (row) => <span className="font-medium text-card-foreground">{row.name}</span>,
    },
    {
      key: "totalOrders",
      header: "Orders",
      render: (row) => <span className="text-muted font-semibold">{row.totalOrders}</span>,
    },
    {
      key: "deliveredOrders",
      header: "Delivered Orders",
      render: (row) => <span className="text-indigo-600 font-semibold">{row.deliveredOrders}</span>,
    },
    {
      key: "totalRevenue",
      header: "Revenue",
      render: (row) => <span className="text-emerald-600 font-semibold">{formatCurrency(row.totalRevenue)}</span>,
    },
  ];

  return (
    <Card className="flex flex-col h-full">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">Salesman Performance</h3>
        <p className="text-xs text-muted mt-1">Orders and revenue breakdown per salesman</p>
      </div>

      <div className="flex-1">
        {salesmen.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted">No salesman activity for this period</div>
        ) : (
          <Table
            columns={columns}
            rows={salesmen}
            getRowKey={(row) => row.id}
          />
        )}
      </div>
    </Card>
  );
}
