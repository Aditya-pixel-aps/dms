"use client";

import DashboardShell from "@/app/components/DashboardShell";
import { StatCard } from "@/app/components/ui/Card";

export default function SalesmanPage() {
  return (
    <DashboardShell requiredRole="salesman" title="Salesman Dashboard">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="My customers" value="—" />
        <StatCard label="Orders today" value="—" />
        <StatCard label="Pending deliveries" value="—" />
      </div>
    </DashboardShell>
  );
}