"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import DashboardShell from "@/app/components/DashboardShell";
import Table, { Column } from "@/app/components/ui/Table";
import Badge from "@/app/components/ui/Badge";
import Card from "@/app/components/ui/Card";
import Input from "@/app/components/ui/Input";
import Button from "@/app/components/ui/Button";
import type { OrderStatus, Product, Retailer } from "@/lib/types";
import { supabase } from "@/lib/supabase/client";

type SalesmanOrderItem = {
  product_id: number;
  product_name: string;
  qty: number;
  unit_price: number;
};

type SalesmanOrderRow = {
  id: number;
  retailer_id: number;
  retailer_name: string;
  salesman_id: number;
  route_id: number;
  status: OrderStatus;
  order_date: string;
  items: SalesmanOrderItem[];
};

const statusTone: Record<OrderStatus, "yellow" | "blue" | "green" | "red" | "gray"> = {
  Pending: "yellow",
  Billed: "blue",
  Dispatched: "blue",
  Delivered: "green",
  Cancelled: "red",
};

const formatCurrency = (value: number) => `Rs ${value.toLocaleString()}`;

type DBOrderItem = {
  product_id: number;
  qty: number;
  unit_price: number;
  products: {
    name: string;
  } | {
    name: string;
  }[] | null;
};

type DBOrder = {
  id: number;
  retailer_id: number;
  salesman_id: number;
  route_id: number;
  status: OrderStatus;
  order_date: string;
  retailers: {
    name: string;
  } | {
    name: string;
  }[] | null;
  order_items: DBOrderItem[] | null;
};

export default function SalesmanOrdersPage() {
  const searchParams = useSearchParams();
  const retailerId = Number(searchParams.get("retailer_id") ?? "");
  const [selectedOrder, setSelectedOrder] = useState<SalesmanOrderRow | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [draftItems, setDraftItems] = useState<SalesmanOrderItem[]>([]);
  const [message, setMessage] = useState("");
  const [orders, setOrders] = useState<SalesmanOrderRow[]>([]);
  const [retailers, setRetailers] = useState<Retailer[]>([]);

  const fetchOrders = useCallback(async (currentRetailers: Retailer[] = []) => {
    const { data: ordersData, error: ordersError } = await supabase
      .from("orders")
      .select(`
        id,
        retailer_id,
        salesman_id,
        route_id,
        status,
        order_date,
        retailers (
          name
        ),
        order_items (
          product_id,
          qty,
          unit_price,
          products (
            name
          )
        )
      `)
      .order("id", { ascending: false });

    if (ordersError) {
      console.error("Error loading orders:", ordersError);
    } else if (ordersData) {
      const formatted: SalesmanOrderRow[] = (ordersData as unknown as DBOrder[]).map((order) => {
        const retailersData = order.retailers;
        const retailerName =
          (retailersData && !Array.isArray(retailersData) ? retailersData.name : null) ||
          (Array.isArray(retailersData) ? retailersData[0]?.name : null) ||
          currentRetailers.find((r) => r.id === order.retailer_id)?.name ||
          "Unknown Retailer";

        const items = (order.order_items || []).map((item) => {
          const productsData = item.products;
          const productName =
            (productsData && !Array.isArray(productsData) ? productsData.name : null) ||
            (Array.isArray(productsData) ? productsData[0]?.name : null) ||
            "Unknown Product";
          return {
            product_id: Number(item.product_id),
            product_name: productName,
            qty: Number(item.qty),
            unit_price: Number(item.unit_price),
          };
        });

        return {
          id: Number(order.id),
          retailer_id: Number(order.retailer_id),
          retailer_name: retailerName,
          salesman_id: Number(order.salesman_id),
          route_id: Number(order.route_id),
          status: order.status as OrderStatus,
          order_date: order.order_date,
          items,
        };
      });
      setOrders(formatted);
      setSelectedOrder((currentSelected) => {
        if (!currentSelected) return null;
        return formatted.find((o) => o.id === currentSelected.id) || currentSelected;
      });
    }
  }, []);

  useEffect(() => {
    async function loadData() {
      const { data: retailersData, error: retailersError } = await supabase
        .from("retailers")
        .select("*")
        .order("name");

      let latestRetailers: Retailer[] = [];
      if (retailersError) {
        console.error("Error loading retailers:", retailersError);
      } else if (retailersData) {
        setRetailers(retailersData);
        latestRetailers = retailersData;
      }

      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("*")
        .order("id");

      if (productsError) {
        console.error("Error loading products:", productsError);
      } else if (productsData) {
        setProducts(productsData);
        if (productsData.length > 0) {
          setSelectedProductId(productsData[0].id);
        }
      }

      await fetchOrders(latestRetailers);
    }
    loadData();
  }, [fetchOrders]);

  const filteredOrders = useMemo(
    () => (retailerId ? orders.filter((order) => order.retailer_id === retailerId) : orders),
    [orders, retailerId]
  );

  const selectedRetailer = retailers.find((retailer) => retailer.id === retailerId) ?? null;
  const selectedProduct = products.find((item) => item.id === selectedProductId);
  const draftSubtotal = draftItems.reduce((sum, item) => sum + item.qty * item.unit_price, 0);
  const draftTax = Math.round(draftSubtotal * 0.12);
  const draftTotal = draftSubtotal + draftTax;

  const addItemToDraft = () => {
    if (!selectedRetailer || !selectedProduct) return;

    if (quantity > selectedProduct.stock_qty) {
      setMessage(`Only ${selectedProduct.stock_qty} units of ${selectedProduct.name} are available.`);
      return;
    }

    setDraftItems((current) => {
      const existing = current.find((item) => item.product_id === selectedProduct.id);
      if (existing) {
        return current.map((item) =>
          item.product_id === selectedProduct.id
            ? { ...item, qty: item.qty + quantity }
            : item
        );
      }

      return [
        ...current,
        {
          product_id: selectedProduct.id,
          product_name: selectedProduct.name,
          qty: quantity,
          unit_price: selectedProduct.price,
        },
      ];
    });

    setMessage("");
  };

  const submitBilling = async () => {
    if (!selectedRetailer || draftItems.length === 0) {
      setMessage("Select a retailer and add at least one product before submitting.");
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert({
        status: "Pending",
        order_date: today,
        retailer_id: selectedRetailer.id,
        salesman_id: 1,
        route_id: selectedRetailer.route_id,
      })
      .select()
      .single();

    if (orderError) {
      setMessage(`Error creating order: ${orderError.message}`);
      return;
    }

    const orderId = orderData.id;
    const itemsToInsert = draftItems.map((item) => ({
      order_id: orderId,
      product_id: item.product_id,
      qty: item.qty,
      unit_price: item.unit_price,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(itemsToInsert);

    if (itemsError) {
      setMessage(`Error creating order items: ${itemsError.message}`);
      return;
    }

    await fetchOrders(retailers);
    setDraftItems([]);
    setQuantity(1);
    setMessage(`Invoice created for ${selectedRetailer.name}. Total: ${formatCurrency(draftTotal)}.`);
  };

  const orderTotal = (order: SalesmanOrderRow) =>
    order.items.reduce((sum, item) => sum + item.qty * item.unit_price, 0);

  const columns: Column<SalesmanOrderRow>[] = [
    { key: "id", header: "Order #" },
    { key: "retailer_name", header: "Retailer" },
    {
      key: "items",
      header: "Summary",
      render: (order) =>
        order.items.map((item) => `${item.product_name} × ${item.qty}`).join(", "),
    },
    {
      key: "status",
      header: "Status",
      render: (order) => <Badge tone={statusTone[order.status]}>{order.status}</Badge>,
    },
    {
      key: "total",
      header: "Total",
      render: (order) => formatCurrency(orderTotal(order)),
    },
    { key: "order_date", header: "Date" },
  ];

  return (
    <DashboardShell requiredRole="salesman" title="Billing">
      <div className="space-y-6">
        {selectedRetailer ? (
          <Card className="p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-card-foreground">Billing for {selectedRetailer.name}</h2>
                <p className="text-sm text-muted">
                  Select products and create a bill for this retailer.
                </p>
              </div>
              <div className="rounded-full bg-secondary-hover border border-border/50 px-3.5 py-1 text-xs font-semibold text-muted">
                Route {selectedRetailer.route_id}
              </div>
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2 text-sm">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted">Product</span>
                    <select
                      className="w-full rounded-lg border border-border bg-card p-2 text-sm text-card-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                      value={selectedProductId ?? ""}
                      onChange={(event) => setSelectedProductId(Number(event.target.value))}
                    >
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name} — {formatCurrency(product.price)}/unit
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="space-y-2 text-sm">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted">Quantity</span>
                    <Input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(event) => setQuantity(Number(event.target.value) || 1)}
                    />
                  </label>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">{message}</p>
                  <Button
                    variant="primary"
                    type="button"
                    onClick={addItemToDraft}
                  >
                    Add to bill
                  </Button>
                </div>

                <div className="rounded-xl border border-border p-4 bg-card">
                  <div className="mb-3 flex items-center justify-between border-b border-border/50 pb-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted">Draft items</p>
                    <Badge tone="blue">{draftItems.length} item{draftItems.length === 1 ? "" : "s"}</Badge>
                  </div>
                  {draftItems.length === 0 ? (
                    <p className="text-sm text-muted">No products added yet.</p>
                  ) : (
                    <ul className="space-y-2 text-sm">
                      {draftItems.map((item) => (
                        <li key={item.product_id} className="flex items-center justify-between rounded-lg bg-secondary-hover/40 border border-border/30 px-3.5 py-2 text-card-foreground">
                          <span className="font-semibold">{item.product_name}</span>
                          <span className="font-bold">x{item.qty}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="space-y-4 rounded-xl border border-border bg-secondary-hover/30 p-4">
                <div className="rounded-xl border border-border bg-card p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted">Invoice preview</p>
                  <div className="mt-3 space-y-2 text-sm text-muted">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-semibold text-card-foreground">{formatCurrency(draftSubtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax (12%)</span>
                      <span className="font-semibold text-card-foreground">{formatCurrency(draftTax)}</span>
                    </div>
                    <div className="flex justify-between border-t border-border pt-2.5 font-bold text-card-foreground text-base">
                      <span>Total</span>
                      <span className="text-indigo-600 dark:text-indigo-400">{formatCurrency(draftTotal)}</span>
                    </div>
                  </div>
                </div>

                <Button
                  variant="primary"
                  className="w-full py-2.5 shadow-md"
                  type="button"
                  onClick={submitBilling}
                  disabled={draftItems.length === 0}
                >
                  Create bill
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-card-foreground">Billing orders</h2>
                <p className="text-sm text-muted">
                  Double-click any order row to open the bill details.
                </p>
              </div>
            </div>
          </Card>
        )}

        <Table
          columns={columns}
          rows={filteredOrders}
          getRowKey={(order) => order.id}
          onRowDoubleClick={(order) => setSelectedOrder(order)}
        />

        <Card className="p-6">
          {selectedOrder ? (
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2 border-b border-border/50 pb-3">
                <div>
                  <p className="text-sm font-bold text-card-foreground">Order #{selectedOrder.id}</p>
                  <p className="text-xs font-medium text-muted mt-0.5">{selectedOrder.retailer_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-muted mb-1">Status</p>
                  <Badge tone={statusTone[selectedOrder.status]}>{selectedOrder.status}</Badge>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-secondary-hover/20 p-4">
                <div className="space-y-3 text-sm text-card-foreground">
                  {selectedOrder.items.map((item) => (
                    <div key={item.product_id} className="flex justify-between">
                      <span className="font-medium">{item.product_name} × {item.qty}</span>
                      <span className="font-semibold">{formatCurrency(item.qty * item.unit_price)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2 border-t border-border pt-4 text-sm text-muted">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-card-foreground">{formatCurrency(orderTotal(selectedOrder))}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (12%)</span>
                  <span className="font-semibold text-card-foreground">{formatCurrency(Math.round(orderTotal(selectedOrder) * 0.12))}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-card-foreground border-t border-border/40 pt-2 mt-1">
                  <span>Total</span>
                  <span className="text-indigo-600 dark:text-indigo-400">{formatCurrency(orderTotal(selectedOrder) + Math.round(orderTotal(selectedOrder) * 0.12))}</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted text-center py-2">No bill selected. Double-click any summary row to view the order bill details.</p>
          )}
        </Card>
      </div>
    </DashboardShell>
  );
}
