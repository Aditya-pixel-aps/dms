import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import Card from "@/app/components/ui/Card";

interface MonthlyRevenueData {
  month: string;
  revenue: number;
}

interface RevenueBarChartProps {
  data: MonthlyRevenueData[];
}

export default function RevenueBarChart({ data }: RevenueBarChartProps) {
  const hasData = data.some((item) => item.revenue > 0);

  const formatCurrency = (val: number) => {
    return `₹${val.toLocaleString("en-IN", {
      maximumFractionDigits: 0,
    })}`;
  };

  return (
    <Card className="flex flex-col h-full min-h-[350px]">
      <div>
        <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">Monthly Sales Revenue</h3>
        <p className="text-xs text-muted mt-1">Total revenue generated per month</p>
      </div>

      <div className="flex-1 flex items-center justify-center min-h-[220px] mt-4">
        {!hasData ? (
          <p className="text-sm text-muted">No sales revenue data available</p>
        ) : (
          <div className="w-full h-full relative" style={{ minHeight: "220px" }}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--muted)", fontSize: 11 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                  tick={{ fill: "var(--muted)", fontSize: 11 }}
                />
                <Tooltip
                  formatter={(value: any) => [formatCurrency(Number(value)), "Revenue"]}
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                    borderRadius: "8px",
                    color: "var(--card-foreground)",
                  }}
                  cursor={{ fill: "var(--secondary-hover)", opacity: 0.4 }}
                />
                <Bar
                  dataKey="revenue"
                  fill="#4f46e5" // Indigo 600
                  radius={[4, 4, 0, 0]}
                  maxBarSize={45}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </Card>
  );
}
