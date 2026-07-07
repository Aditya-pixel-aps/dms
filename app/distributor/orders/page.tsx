"use client";

import { useCallback, useEffect, useState } from "react";
import DashboardShell from "@/app/components/DashboardShell";
import Table, { Column } from "@/app/components/ui/Table";
import Badge from "@/app/components/ui/Badge";
import Button from "@/app/components/ui/Button";
import Card from "@/app/components/ui/Card";
import type { OrderStatus, Product } from "@/lib/types";
import { supabase } from "@/lib/supabase/client";
import { generateInvoicePdf } from "@/utils/generateInvoicePdf";
import AssignVehicleModal from "@/app/components/AssignVehicleModal";

type BillingOrderItem = {
  product_id: number;
  product_name: string;
  qty: number;
  unit_price: number;
};

type BillingOrderRow = {
  id: number;
  retailer_id: number;
  retailer_name: string;
  retailer_address?: string | null;
  retailer_phone?: string | null;
  salesman_id: number;
  salesman_name?: string | null;
  route_id: number;
  status: OrderStatus;
  order_date: string;
  items: BillingOrderItem[];
  invoice_id?: number | null;
  invoice_date?: string | null;
  vehicle_id?: number | null;
  vehicle_no?: string | null;
};

const statusTone: Record<OrderStatus, "yellow" | "blue" | "green" | "red" | "gray" | "purple"> = {
  Pending: "yellow",
  Billed: "blue",
  Dispatched: "purple",
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
  vehicle_id?: number | null;
  retailers: {
    name: string;
    address?: string | null;
    phone?: string | null;
  } | {
    name: string;
    address?: string | null;
    phone?: string | null;
  }[] | null;
  salesmen?: {
    name: string;
  } | {
    name: string;
  }[] | null;
  invoices?: {
    id: number;
    billed_at: string;
  } | {
    id: number;
    billed_at: string;
  }[] | null;
  vehicles?: {
    vehicle_no: string;
  } | {
    vehicle_no: string;
  }[] | null;
  order_items: DBOrderItem[] | null;
};

export default function DistributorOrdersPage() {
  const [orders, setOrders] = useState<BillingOrderRow[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [orderToAssign, setOrderToAssign] = useState<BillingOrderRow | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const selectedOrder = orders.find((order) => order.id === selectedOrderId) ?? null;

  const fetchProducts = useCallback(async () => {
    const { data: productsData, error: productsError } = await supabase
      .from("products")
      .select("*")
      .order("id");
    if (productsError) {
      console.error("Error loading products:", productsError);
    } else if (productsData) {
      setProducts(productsData);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    const { data: ordersData, error: ordersError } = await supabase
      .from("orders")
      .select(`
        id,
        retailer_id,
        salesman_id,
        route_id,
        status,
        order_date,
        vehicle_id,
        retailers (
          name,
          address,
          phone
        ),
        salesmen (
          name
        ),
        invoices (
          id,
          billed_at
        ),
        vehicles (
          vehicle_no
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
      const formatted: BillingOrderRow[] = (ordersData as unknown as DBOrder[]).map((order) => {
        const retailersData = order.retailers;
        const retailerName =
          (retailersData && !Array.isArray(retailersData) ? retailersData.name : null) ||
          (Array.isArray(retailersData) ? retailersData[0]?.name : null) ||
          "Unknown Retailer";
        const retailerAddress =
          (retailersData && !Array.isArray(retailersData) ? retailersData.address : null) ||
          (Array.isArray(retailersData) ? retailersData[0]?.address : null) ||
          null;
        const retailerPhone =
          (retailersData && !Array.isArray(retailersData) ? retailersData.phone : null) ||
          (Array.isArray(retailersData) ? retailersData[0]?.phone : null) ||
          null;

        const salesmenData = order.salesmen;
        const salesmanName =
          (salesmenData && !Array.isArray(salesmenData) ? salesmenData.name : null) ||
          (Array.isArray(salesmenData) ? salesmenData[0]?.name : null) ||
          null;

        const invoicesData = order.invoices;
        const invoiceId =
          (invoicesData && !Array.isArray(invoicesData) ? invoicesData.id : null) ||
          (Array.isArray(invoicesData) ? invoicesData[0]?.id : null) ||
          null;
        const invoiceDate =
          (invoicesData && !Array.isArray(invoicesData) ? invoicesData.billed_at : null) ||
          (Array.isArray(invoicesData) ? invoicesData[0]?.billed_at : null) ||
          null;

        const vehiclesData = order.vehicles;
        const vehicleNo =
          (vehiclesData && !Array.isArray(vehiclesData) ? vehiclesData.vehicle_no : null) ||
          (Array.isArray(vehiclesData) ? vehiclesData[0]?.vehicle_no : null) ||
          null;

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
          retailer_address: retailerAddress,
          retailer_phone: retailerPhone,
          salesman_id: Number(order.salesman_id),
          salesman_name: salesmanName,
          route_id: Number(order.route_id),
          status: order.status as OrderStatus,
          order_date: order.order_date,
          items,
          invoice_id: invoiceId,
          invoice_date: invoiceDate,
          vehicle_id: order.vehicle_id ? Number(order.vehicle_id) : null,
          vehicle_no: vehicleNo,
        };
      });
      setOrders(formatted);
      setSelectedOrderId((prevSelected) => {
        if (prevSelected !== null && formatted.some((o) => o.id === prevSelected)) {
          return prevSelected;
        }
        return formatted.length > 0 ? formatted[0].id : null;
      });
    }
  }, []);

  useEffect(() => {
    async function loadData() {
      await fetchProducts();
      await fetchOrders();
    }
    loadData();
  }, [fetchProducts, fetchOrders]);

  const approveOrder = async (orderId: number) => {
    const order = orders.find((item) => item.id === orderId);
    if (!order) return;

    const { error } = await supabase.rpc("approve_order", {
      p_order_id: orderId,
    });

    if (error) {
      setMessage(`Error approving order #${orderId}: ${error.message}`);
    } else {
      setMessage(`Invoice created for order #${order.id}. Stock was reduced successfully.`);
      await fetchProducts();
      await fetchOrders();
      setSelectedOrderId(orderId);
    }
  };

  const markDelivered = async (orderId: number) => {
    if (isSaving) return;
    setIsSaving(true);
    setMessage("");

    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: "Delivered" })
        .eq("id", orderId);

      if (error) {
        setMessage(`Error marking order #${orderId} delivered: ${error.message}`);
      } else {
        setMessage(`Order #${orderId} status has been updated to Delivered.`);
        await fetchOrders();
      }
    } catch (err) {
      console.error("Failed to update status to Delivered:", err);
      setMessage("An unexpected network error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  const pendingCount = orders.filter((order) => order.status === "Pending").length;
  const billedCount = orders.filter((order) => order.status === "Billed").length;
  const lowStockProducts = products.filter((product) => product.stock_qty < 20);
  const lowStockCount = lowStockProducts.length;

  const selectedOrderSubtotal = selectedOrder
    ? selectedOrder.items.reduce((sum, item) => sum + item.qty * item.unit_price, 0)
    : 0;
  const selectedOrderTax = Math.round(selectedOrderSubtotal * 0.12);
  const selectedOrderTotal = selectedOrderSubtotal + selectedOrderTax;

  const orderTotal = (order: BillingOrderRow) =>
    order.items.reduce((sum, item) => sum + item.qty * item.unit_price, 0);

  const columns: Column<BillingOrderRow>[] = [
    { key: "id", header: "Order #" },
    { key: "retailer_name", header: "Retailer" },
    { key: "salesman_id", header: "Salesman" },
    {
      key: "items",
      header: "Items",
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
    {
      key: "actions",
      header: "Action",
      render: (order) => (
        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={() => setSelectedOrderId(order.id)}>
            Review
          </Button>
          {order.status === "Pending" && (
            <Button
              type="button"
              variant="primary"
              onClick={() => approveOrder(order.id)}
            >
              Approve
            </Button>
          )}
          {order.status === "Billed" && (
            <Button
              type="button"
              variant="primary"
              onClick={() => {
                setOrderToAssign(order);
                setIsAssignModalOpen(true);
              }}
            >
              Assign Vehicle
            </Button>
          )}
          {order.status === "Dispatched" && (
            <Button
              type="button"
              variant="primary"
              disabled={isSaving}
              onClick={() => markDelivered(order.id)}
            >
              Mark Delivered
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <DashboardShell requiredRole="distributor" title="Orders">
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <p className="text-sm font-medium text-muted">Pending approvals</p>
            <p className="mt-1.5 text-2xl font-bold text-card-foreground">{pendingCount}</p>
          </Card>
          <Card>
            <p className="text-sm font-medium text-muted">Billed orders</p>
            <p className="mt-1.5 text-2xl font-bold text-card-foreground">{billedCount}</p>
          </Card>
          <Card>
            <p className="text-sm font-medium text-muted">Low stock alerts</p>
            <p className="mt-1.5 text-2xl font-bold text-card-foreground text-red-500">{lowStockCount}</p>
          </Card>
        </div>

        {message && (
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
            {message}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <Table
            columns={columns}
            rows={orders}
            getRowKey={(order) => order.id}
            onRowDoubleClick={(order) => setSelectedOrderId(order.id)}
          />

          <Card className="space-y-4">
            <div>
              <p className="text-sm font-bold text-card-foreground">Invoice summary</p>
              <p className="text-xs font-semibold text-muted mt-0.5">Review the selected order before billing.</p>
            </div>

            {selectedOrder ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-border bg-secondary-hover/20 p-4">
                  <p className="text-sm font-bold text-card-foreground">Order #{selectedOrder.id}</p>
                  <p className="text-xs text-muted mt-0.5">{selectedOrder.retailer_name} • Salesman {selectedOrder.salesman_id}</p>
                </div>
                <div className="space-y-2 text-sm text-card-foreground">
                  {selectedOrder.items.map((item) => (
                    <div key={item.product_id} className="flex justify-between">
                      <span className="font-medium">{item.product_name} × {item.qty}</span>
                      <span className="font-semibold">{formatCurrency(item.qty * item.unit_price)}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-2 border-t border-border pt-3.5 text-sm text-muted">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold text-card-foreground">{formatCurrency(selectedOrderSubtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (12%)</span>
                    <span className="font-semibold text-card-foreground">{formatCurrency(selectedOrderTax)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-card-foreground text-base border-t border-border/40 pt-2 mt-1">
                    <span>Total</span>
                    <span className="text-indigo-600 dark:text-indigo-400">{formatCurrency(selectedOrderTotal)}</span>
                  </div>
                </div>

                {selectedOrder.status !== "Pending" && (
                  <Button
                    type="button"
                    variant="primary"
                    className="w-full mt-2"
                    onClick={() => generateInvoicePdf(selectedOrder)}
                  >
                    Download PDF
                  </Button>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted text-center py-4">Select an order to view its invoice preview.</p>
            )}

            <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Stock warnings</p>
              {lowStockProducts.length === 0 ? (
                <p className="mt-2 text-sm text-amber-600 dark:text-amber-400/90 font-medium">All products are above the low-stock threshold.</p>
              ) : (
                <ul className="mt-2.5 space-y-1.5 text-sm text-amber-700 dark:text-amber-300 font-medium">
                  {lowStockProducts.map((product) => (
                    <li key={product.id}>{product.name}: {product.stock_qty} remaining</li>
                  ))}
                </ul>
              )}
            </div>
          </Card>
        </div>

        <AssignVehicleModal
          isOpen={isAssignModalOpen}
          onClose={() => {
            setIsAssignModalOpen(false);
            setOrderToAssign(null);
          }}
          orderId={orderToAssign ? orderToAssign.id : null}
          onSuccess={() => {
            fetchOrders();
          }}
        />
      </div>
    </DashboardShell>
  );
}
