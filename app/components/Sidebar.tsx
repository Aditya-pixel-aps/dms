"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavItem = {
  href: string;
  label: string;
};

export const navByRole: Record<"distributor" | "salesman", NavItem[]> = {
  distributor: [
    { href: "/distributor", label: "Dashboard" },
    { href: "/distributor/salesmen", label: "Salesmen" },
    { href: "/distributor/products", label: "Products" },
    { href: "/distributor/orders", label: "Orders" },
    { href: "/distributor/customers", label: "Retailers" },
    { href: "/distributor/reports", label: "Reports" },
  ],
  salesman: [
    { href: "/salesman", label: "Dashboard" },
    { href: "/salesman/customers", label: "Retailers" },
    { href: "/salesman/orders", label: "Orders" },
    { href: "/salesman/products", label: "Products" },
  ],
};

export default function Sidebar({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex w-56 shrink-0 flex-col gap-1.5 border-r border-border bg-card/30 p-4">
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-lg px-3.5 py-2.5 text-sm font-semibold transition-all duration-200 ${
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted hover:bg-secondary-hover hover:text-card-foreground"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
