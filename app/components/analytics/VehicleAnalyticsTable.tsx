import React from "react";
import Table, { Column } from "@/app/components/ui/Table";
import Card from "@/app/components/ui/Card";

export interface VehiclePerformance {
  id: number | string;
  vehicleNo: string;
  assignedOrders: number;
  deliveredOrders: number;
  capacity: number | string;
  [key: string]: unknown;
}

interface VehicleAnalyticsTableProps {
  vehicles: VehiclePerformance[];
}

export default function VehicleAnalyticsTable({ vehicles }: VehicleAnalyticsTableProps) {
  const columns: Column<VehiclePerformance>[] = [
    {
      key: "vehicleNo",
      header: "Vehicle Number",
      render: (row) => <span className="font-semibold text-card-foreground">{row.vehicleNo}</span>,
    },
    {
      key: "assignedOrders",
      header: "Assigned Orders",
      render: (row) => <span className="text-muted font-semibold">{row.assignedOrders}</span>,
    },
    {
      key: "deliveredOrders",
      header: "Delivered Orders",
      render: (row) => <span className="text-emerald-600 font-semibold">{row.deliveredOrders}</span>,
    },
    {
      key: "capacity",
      header: "Capacity (kg/units)",
      render: (row) => <span className="text-muted">{row.capacity ?? "—"}</span>,
    },
  ];

  return (
    <Card className="flex flex-col h-full">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">Vehicle Utilization</h3>
        <p className="text-xs text-muted mt-1">Orders dispatched and delivered by fleet vehicles</p>
      </div>

      <div className="flex-1">
        {vehicles.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted">No vehicle utilization data for this period</div>
        ) : (
          <Table
            columns={columns}
            rows={vehicles}
            getRowKey={(row) => row.id}
          />
        )}
      </div>
    </Card>
  );
}
