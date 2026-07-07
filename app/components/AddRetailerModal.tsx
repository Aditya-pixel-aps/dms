"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import Button from "@/app/components/ui/Button";
import Input from "@/app/components/ui/Input";

type RouteOption = {
  id: number;
  name: string;
};

type AddRetailerModalProps = {
  isOpen: boolean;
  onClose: () => void;
  routes: RouteOption[];
  onSuccess: (newRetailerName: string) => void;
};

export default function AddRetailerModal({
  isOpen,
  onClose,
  routes,
  onSuccess,
}: AddRetailerModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [routeId, setRouteId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleClose = () => {
    setName("");
    setPhone("");
    setAddress("");
    setRouteId("");
    setError(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !address.trim() || !routeId) {
      setError("Please fill out all fields.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const { error: insertError } = await supabase
        .from("retailers")
        .insert({
          name: name.trim(),
          phone: phone.trim(),
          address: address.trim(),
          route_id: Number(routeId),
        });

      if (insertError) {
        setError(insertError.message);
      } else {
        const savedName = name.trim();
        setName("");
        setPhone("");
        setAddress("");
        setRouteId("");
        onSuccess(savedName);
        onClose();
      }
    } catch (err: unknown) {
      console.error("Failed to save retailer:", err);
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
          <h3 className="text-lg font-bold text-card-foreground">Add New Retailer</h3>
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
              Retailer Name *
            </span>
            <Input
              type="text"
              required
              disabled={isSubmitting}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Supermarket Store"
            />
          </label>

          <label className="block space-y-2 text-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-muted">
              Phone Number *
            </span>
            <Input
              type="tel"
              required
              disabled={isSubmitting}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +923001234567"
            />
          </label>

          <label className="block space-y-2 text-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-muted">
              Address *
            </span>
            <Input
              type="text"
              required
              disabled={isSubmitting}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. 123 Main St, Karachi"
            />
          </label>

          <label className="block space-y-2 text-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-muted">
              Route *
            </span>
            <select
              className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-card-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all disabled:opacity-50"
              required
              disabled={isSubmitting}
              value={routeId}
              onChange={(e) => setRouteId(e.target.value)}
            >
              <option value="">Select a route</option>
              {routes.map((route) => (
                <option key={route.id} value={route.id}>
                  {route.name}
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
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
