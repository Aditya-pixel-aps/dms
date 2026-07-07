import React from "react";
import Table, { Column } from "@/app/components/ui/Table";
import Card from "@/app/components/ui/Card";

export interface RoutePerformance {
  id: number | string;
  name: string;
  totalOrders: number;
  totalRevenue: number;
  totalRetailers: number;
  [key: string]: unknown;
}

interface RouteAnalyticsTableProps {
  routes: RoutePerformance[];
}

export default function RouteAnalyticsTable({ routes }: RouteAnalyticsTableProps) {
  const formatCurrency = (val: number) => {
    return `₹${val.toLocaleString("en-IN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  const columns: Column<RoutePerformance>[] = [
    {
      key: "name",
      header: "Route",
      render: (row) => <span className="font-medium text-card-foreground">{row.name}</span>,
    },
    {
      key: "totalOrders",
      header: "Orders",
      render: (row) => <span className="text-muted font-semibold">{row.totalOrders}</span>,
    },
    {
      key: "totalRetailers",
      header: "Retailers On Route",
      render: (row) => <span className="text-muted">{row.totalRetailers}</span>,
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
        <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">Route Performance</h3>
        <p className="text-xs text-muted mt-1">Orders, revenue, and coverage by route</p>
      </div>

      <div className="flex-1">
        {routes.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted">No route data for this period</div>
        ) : (
          <Table
            columns={columns}
            rows={routes}
            getRowKey={(row) => row.id}
          />
        )}
      </div>
    </Card>
  );
}
