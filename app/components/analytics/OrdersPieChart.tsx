import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from "recharts";
import Card from "@/app/components/ui/Card";

interface OrderStatusData {
  name: string;
  value: number;
}

interface OrdersPieChartProps {
  data: OrderStatusData[];
}

const COLORS = {
  Pending: "#f59e0b", // Amber
  Billed: "#a855f7", // Purple
  Dispatched: "#0ea5e9", // Sky
  Delivered: "#10b981", // Emerald
  Cancelled: "#f43f5e", // Rose
};

export default function OrdersPieChart({ data }: OrdersPieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  const chartData = data.filter((item) => item.value > 0);

  return (
    <Card className="flex flex-col h-full min-h-[350px]">
      <div>
        <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">Order Status Analytics</h3>
        <p className="text-xs text-muted mt-1">Distribution of orders in the selected period</p>
      </div>

      <div className="flex-1 flex items-center justify-center min-h-[220px] mt-4">
        {total === 0 ? (
          <p className="text-sm text-muted">No order data for this period</p>
        ) : (
          <div className="w-full h-full relative" style={{ minHeight: "220px" }}>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[entry.name as keyof typeof COLORS] || "#6b7280"}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [
                    `${value} (${((Number(value) / total) * 100).toFixed(1)}%)`,
                    "Orders",
                  ]}
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                    borderRadius: "8px",
                    color: "var(--card-foreground)",
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => {
                    const item = data.find((d) => d.name === value);
                    const qty = item ? item.value : 0;
                    const pct = total > 0 ? ((qty / total) * 100).toFixed(0) : "0";
                    return (
                      <span className="text-xs font-medium text-card-foreground">
                        {value}: {qty} ({pct}%)
                      </span>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </Card>
  );
}
