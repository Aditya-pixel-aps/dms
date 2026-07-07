import React from "react";

export default function Input({
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-card-foreground outline-none placeholder-muted/60 focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all ${className}`}
      {...props}
    />
  );
}
