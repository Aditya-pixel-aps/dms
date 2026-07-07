"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import Button from "@/app/components/ui/Button";

type VehicleOption = {
  id: number;
  vehicle_no: string;
  capacity: number | null;
};

type AssignVehicleModalProps = {
  isOpen: boolean;
  onClose: () => void;
  orderId: number | null;
  onSuccess: (vehicleId: number, vehicleNo: string, isFallback: boolean) => void;
};

export default function AssignVehicleModal({
  isOpen,
  onClose,
  orderId,
  onSuccess,
}: AssignVehicleModalProps) {
  const [vehicles, setVehicles] = useState<VehicleOption[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const loadVehicles = async () => {
      setError(null);
      const { data, error: fetchError } = await supabase
        .from("vehicles")
        .select("id, vehicle_no, capacity")
        .order("vehicle_no");

      if (fetchError) {
        console.error("Error loading vehicles:", fetchError);
        setError("Failed to load vehicles from the database.");
      } else if (data) {
        setVehicles(data);
      }
    };

    loadVehicles();
  }, [isOpen]);

  if (!isOpen || orderId === null) return null;

  const handleClose = () => {
    setSelectedVehicleId("");
    setError(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicleId) {
      setError("Please select a vehicle.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const selectedVeh = vehicles.find((v) => v.id === Number(selectedVehicleId));
      const vehicleNo = selectedVeh ? selectedVeh.vehicle_no : "MH-12-AB-1234";

      const { error: updateError } = await supabase
        .from("orders")
        .update({
          vehicle_id: Number(selectedVehicleId),
          status: "Dispatched",
        })
        .eq("id", orderId);

      if (updateError) {
        setError(updateError.message);
      } else {
        setSelectedVehicleId("");
        onSuccess(Number(selectedVehicleId), vehicleNo, false);
        onClose();
      }
    } catch (err: unknown) {
      console.error("Failed to assign vehicle:", err);
      setError("An unexpected network error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={isSubmitting ? undefined : handleClose}
      />

      {/* Modal Content Panel */}
      <div className="relative w-full max-w-md transform overflow-hidden rounded-xl border border-border bg-card text-card-foreground p-6 shadow-xl transition-all animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
          <h3 className="text-lg font-bold text-card-foreground">Assign Vehicle for Order #{orderId}</h3>
          <button
            type="button"
            className="text-muted hover:text-card-foreground text-lg font-semibold disabled:opacity-50 cursor-pointer"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg border border-red-200/50 bg-red-50/50 dark:border-red-900/30 dark:bg-red-950/20 p-3.5 text-sm font-medium text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <label className="block space-y-2 text-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-muted">
              Select Vehicle *
            </span>
            <select
              className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-card-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all disabled:opacity-50"
              required
              disabled={isSubmitting}
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
            >
              <option value="">Select a vehicle</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.vehicle_no} {v.capacity ? `(Cap: ${v.capacity})` : ""}
                </option>
              ))}
            </select>
          </label>

          <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
            <Button
              type="button"
              variant="secondary"
              disabled={isSubmitting}
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting || !selectedVehicleId}>
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
