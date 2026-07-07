import React from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import Card from "@/app/components/ui/Card";

interface MonthlyOrdersData {
  month: string;
  orders: number;
}

interface OrdersLineChartProps {
  data: MonthlyOrdersData[];
}

export default function OrdersLineChart({ data }: OrdersLineChartProps) {
  const hasData = data.some((item) => item.orders > 0);

  return (
    <Card className="flex flex-col h-full min-h-[350px]">
      <div>
        <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">Monthly Order Volume</h3>
        <p className="text-xs text-muted mt-1">Number of orders received per month</p>
      </div>

      <div className="flex-1 flex items-center justify-center min-h-[220px] mt-4">
        {!hasData ? (
          <p className="text-sm text-muted">No order volume data available</p>
        ) : (
          <div className="w-full h-full relative" style={{ minHeight: "220px" }}>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
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
                  tick={{ fill: "var(--muted)", fontSize: 11 }}
                  allowDecimals={false}
                />
                <Tooltip
                  formatter={(value: any) => [`${value} Orders`, "Volume"]}
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                    borderRadius: "8px",
                    color: "var(--card-foreground)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke="#0ea5e9" // Sky 500
                  strokeWidth={3}
                  activeDot={{ r: 6 }}
                  dot={{ r: 4, stroke: "var(--card)", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </Card>
  );
}
