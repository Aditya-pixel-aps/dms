"use client";

import { useCallback, useEffect, useState } from "react";
import DashboardShell from "@/app/components/DashboardShell";
import Table, { Column } from "@/app/components/ui/Table";
import Button from "@/app/components/ui/Button";
import AddRetailerModal from "@/app/components/AddRetailerModal";
import type { Retailer } from "@/lib/types";
import { supabase } from "@/lib/supabase/client";

type RetailerWithRoute = Retailer & {
  routes: {
    id: number;
    name: string;
  } | {
    id: number;
    name: string;
  }[] | null;
};

type RouteOption = {
  id: number;
  name: string;
};

const columns: Column<RetailerWithRoute>[] = [
  { key: "name", header: "Retailer" },
  { key: "phone", header: "Phone", render: (r) => r.phone ?? "—" },
  { key: "address", header: "Address", render: (r) => r.address ?? "—" },
  {
    key: "route_id",
    header: "Route",
    render: (r) => {
      const routeData = r.routes;
      if (Array.isArray(routeData)) {
        return routeData[0]?.name ?? "—";
      }
      return routeData?.name ?? "—";
    },
  },
];

export default function DistributorCustomersPage() {
  const [retailers, setRetailers] = useState<RetailerWithRoute[]>([]);
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const loadRetailers = useCallback(async () => {
    const { data, error } = await supabase
      .from("retailers")
      .select(`
        id,
        name,
        phone,
        address,
        route_id,
        routes (
          id,
          name
        )
      `)
      .order("name");
    if (error) {
      console.error("Error loading retailers:", error);
    } else if (data) {
      setRetailers(data as unknown as RetailerWithRoute[]);
    }
  }, []);

  const loadRoutes = useCallback(async () => {
    const { data, error } = await supabase
      .from("routes")
      .select("id, name")
      .order("id");
    if (error) {
      console.error("Error loading routes:", error);
    } else if (data) {
      setRoutes(data);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadRetailers();
    loadRoutes();
  }, [loadRetailers, loadRoutes]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleSuccess = (newRetailerName: string) => {
    setSuccessMessage(`Successfully added retailer: ${newRetailerName}`);
    loadRetailers();
  };

  return (
    <DashboardShell
      requiredRole="distributor"
      title="Retailers"
      headerAction={
        <Button onClick={() => setIsModalOpen(true)} variant="primary">
          Add Retailer
        </Button>
      }
    >
      <div className="space-y-6">
        {successMessage && (
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-sm font-medium text-emerald-600 dark:text-emerald-400 animate-in fade-in slide-in-from-top-2 duration-200">
            {successMessage}
          </div>
        )}

        <Table columns={columns} rows={retailers} getRowKey={(r) => r.id} />
      </div>

      <AddRetailerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        routes={routes}
        onSuccess={handleSuccess}
      />
    </DashboardShell>
  );
}
