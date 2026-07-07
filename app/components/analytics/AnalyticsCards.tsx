import React from "react";
import Card from "@/app/components/ui/Card";

interface AnalyticsCardsProps {
  totalOrders: number | string;
  pendingOrders: number | string;
  billedOrders: number | string;
  dispatchedOrders: number | string;
  deliveredOrders: number | string;
  cancelledOrders: number | string;
  totalRetailers: number | string;
  totalProducts: number | string;
  totalSalesmen: number | string;
  totalVehicles: number | string;
  totalRevenue: number;
}

export default function AnalyticsCards({
  totalOrders,
  pendingOrders,
  billedOrders,
  dispatchedOrders,
  deliveredOrders,
  cancelledOrders,
  totalRetailers,
  totalProducts,
  totalSalesmen,
  totalVehicles,
  totalRevenue,
}: AnalyticsCardsProps) {
  const formatCurrency = (val: number) => {
    return `₹${val.toLocaleString("en-IN", {
      maximumFractionDigits: 0,
    })}`;
  };

  const cards = [
    {
      title: "Total Revenue",
      value: typeof totalRevenue === "number" ? formatCurrency(totalRevenue) : totalRevenue,
      icon: (
        <svg className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bg: "bg-emerald-500/10",
    },
    {
      title: "Total Orders",
      value: totalOrders,
      icon: (
        <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
      bg: "bg-blue-500/10",
    },
    {
      title: "Pending Orders",
      value: pendingOrders,
      icon: (
        <svg className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bg: "bg-amber-500/10",
    },
    {
      title: "Billed Orders",
      value: billedOrders,
      icon: (
        <svg className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      bg: "bg-purple-500/10",
    },
    {
      title: "Dispatched Orders",
      value: dispatchedOrders,
      icon: (
        <svg className="h-5 w-5 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V14a1 1 0 01-1 1h-1m-5 1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
        </svg>
      ),
      bg: "bg-sky-500/10",
    },
    {
      title: "Delivered Orders",
      value: deliveredOrders,
      icon: (
        <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bg: "bg-emerald-600/10",
    },
    {
      title: "Cancelled Orders",
      value: cancelledOrders,
      icon: (
        <svg className="h-5 w-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bg: "bg-rose-500/10",
    },
    {
      title: "Total Retailers",
      value: totalRetailers,
      icon: (
        <svg className="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      bg: "bg-indigo-500/10",
    },
    {
      title: "Total Products",
      value: totalProducts,
      icon: (
        <svg className="h-5 w-5 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      bg: "bg-teal-500/10",
    },
    {
      title: "Total Salesmen",
      value: totalSalesmen,
      icon: (
        <svg className="h-5 w-5 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      bg: "bg-violet-500/10",
    },
    {
      title: "Total Vehicles",
      value: totalVehicles,
      icon: (
        <svg className="h-5 w-5 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
      bg: "bg-pink-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
      {cards.map((card, idx) => (
        <Card
          key={idx}
          className={`${
            card.title === "Total Revenue"
              ? "col-span-2 sm:col-span-3 lg:col-span-2 xl:col-span-2 border-emerald-500/20 bg-gradient-to-br from-emerald-500/[0.03] to-transparent"
              : ""
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-muted uppercase tracking-wider">{card.title}</p>
            <div className={`rounded-lg p-2 ${card.bg}`}>{card.icon}</div>
          </div>
          <p className={`mt-3 font-bold text-card-foreground tracking-tight ${card.title === "Total Revenue" ? "text-3xl" : "text-xl sm:text-2xl"}`}>
            {card.value}
          </p>
        </Card>
      ))}
    </div>
  );
}
