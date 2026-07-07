import React from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm",
  secondary: "border border-border bg-card text-card-foreground hover:bg-secondary-hover shadow-xs",
  danger: "bg-rose-600 text-white hover:bg-rose-700 shadow-sm",
  ghost: "text-card-foreground hover:bg-secondary-hover",
};

export default function Button({
  variant = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
}) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:pointer-events-none active:scale-95 ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
