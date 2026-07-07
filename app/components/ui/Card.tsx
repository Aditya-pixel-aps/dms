import React from "react";

export default function Card({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`rounded-xl border border-border bg-card text-card-foreground p-5 shadow-xs transition-all duration-200 ${className}`}>
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <Card>
      <p className="text-sm font-medium text-muted">{label}</p>
      <p className="mt-1.5 text-2xl font-bold text-card-foreground">{value}</p>
    </Card>
  );
}
