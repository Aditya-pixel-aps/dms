import React from "react";
import Table, { Column } from "@/app/components/ui/Table";
import Card from "@/app/components/ui/Card";
import Badge from "@/app/components/ui/Badge";

export interface LowStockProduct {
  id: number | string;
  name: string;
  stock_qty: number;
  sku: string | null;
  [key: string]: unknown;
}

interface LowStockTableProps {
  products: LowStockProduct[];
}

export default function LowStockTable({ products }: LowStockTableProps) {
  const columns: Column<LowStockProduct>[] = [
    {
      key: "name",
      header: "Product",
      render: (row) => (
        <div>
          <span className="font-medium text-card-foreground block">{row.name}</span>
          {row.sku && <span className="text-[10px] text-muted block mt-0.5">{row.sku}</span>}
        </div>
      ),
    },
    {
      key: "stock_qty",
      header: "Current Stock",
      render: (row) => {
        let tone: "red" | "yellow" | "gray" = "gray";
        let label = "In Stock";

        if (row.stock_qty === 0) {
          tone = "red";
          label = "Out of Stock";
        } else if (row.stock_qty < 20) {
          tone = "yellow";
          label = "Low Stock";
        }

        return (
          <div className="flex items-center gap-2">
            <span className="font-bold text-card-foreground">{row.stock_qty}</span>
            <Badge tone={tone}>{label}</Badge>
          </div>
        );
      },
    },
  ];

  return (
    <Card className="flex flex-col h-full">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">Low Stock Alert</h3>
        <p className="text-xs text-muted mt-1">Products with the lowest inventory levels first</p>
      </div>

      <div className="flex-1">
        {products.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted">All products have healthy stock levels</div>
        ) : (
          <Table
            columns={columns}
            rows={products}
            getRowKey={(row) => row.id}
          />
        )}
      </div>
    </Card>
  );
}
