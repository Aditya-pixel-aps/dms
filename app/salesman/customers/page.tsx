"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardShell from "@/app/components/DashboardShell";
import Table, { Column } from "@/app/components/ui/Table";
import Button from "@/app/components/ui/Button";
import type { Retailer } from "@/lib/types";
import { supabase } from "@/lib/supabase/client";

export default function SalesmanCustomersPage() {
  const router = useRouter();
  const [retailers, setRetailers] = useState<Retailer[]>([]);

  useEffect(() => {
    const loadRetailers = async () => {
      const { data, error } = await supabase
        .from("retailers")
        .select("*")
        .order("name");
      if (error) {
        console.error("Error loading retailers:", error);
      } else if (data) {
        setRetailers(data);
      }
    };
    loadRetailers();
  }, []);

  const columns: Column<Retailer>[] = [
    { key: "name", header: "Retailer" },
    { key: "phone", header: "Phone", render: (r) => r.phone ?? "—" },
    { key: "address", header: "Address", render: (r) => r.address ?? "—" },
    {
      key: "action",
      header: "",
      render: (retailer) => (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="primary"
            onClick={() => router.push(`/salesman/orders?retailer_id=${retailer.id}`)}
          >
            Bill now
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DashboardShell requiredRole="salesman" title="My Retailers">
      <Table columns={columns} rows={retailers} getRowKey={(r) => r.id} />
    </DashboardShell>
  );
}
