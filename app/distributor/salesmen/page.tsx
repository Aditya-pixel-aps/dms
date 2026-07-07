"use client";

import DashboardShell from "@/app/components/DashboardShell";
import Table, { Column } from "@/app/components/ui/Table";
import Badge from "@/app/components/ui/Badge";

type Salesman = {
  id: string;
  name: string;
  region: string;
  customers: number;
  active: boolean;
};

const mockSalesmen: Salesman[] = [
  { id: "s1", name: "John Salesman", region: "North", customers: 14, active: true },
  { id: "s2", name: "Mary Reps", region: "East", customers: 9, active: true },
  { id: "s3", name: "Sam Field", region: "West", customers: 6, active: false },
];

const columns: Column<Salesman>[] = [
  { key: "name", header: "Name" },
  { key: "region", header: "Region" },
  { key: "customers", header: "Customers" },
  {
    key: "active",
    header: "Status",
    render: (s) =>
      s.active ? <Badge tone="green">Active</Badge> : <Badge tone="gray">Inactive</Badge>,
  },
];

export default function DistributorSalesmenPage() {
  return (
    <DashboardShell requiredRole="distributor" title="Salesmen">
      <Table columns={columns} rows={mockSalesmen} getRowKey={(s) => s.id} />
    </DashboardShell>
  );
}
