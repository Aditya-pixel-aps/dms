"use client";

import { useEffect, useState } from "react";
import DashboardShell from "@/app/components/DashboardShell";
import Table, { Column } from "@/app/components/ui/Table";
import Badge from "@/app/components/ui/Badge";
import Card from "@/app/components/ui/Card";
import Input from "@/app/components/ui/Input";
import Button from "@/app/components/ui/Button";
import type { Product } from "@/lib/types";
import { supabase } from "@/lib/supabase/client";

const columns: Column<Product>[] = [
  { key: "name", header: "Product" },
  { key: "sku", header: "SKU" },
  {
    key: "price",
    header: "Price",
    render: (p) => `$${Number(p.price).toFixed(2)}`,
  },
  {
    key: "stock_qty",
    header: "Stock",
    render: (p) =>
      p.stock_qty === 0 ? (
        <Badge tone="red">Out of stock</Badge>
      ) : p.stock_qty < 20 ? (
        <Badge tone="yellow">{p.stock_qty} low</Badge>
      ) : (
        <Badge tone="green">{p.stock_qty}</Badge>
      ),
  },
];

export default function DistributorProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [stockQty, setStockQty] = useState("");
  const [message, setMessage] = useState("");

  const loadProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("id");
    if (error) {
      console.error("Error loading products:", error);
    } else if (data) {
      setProducts(data);
    }
  };

  useEffect(() => {
    const init = async () => {
      await loadProducts();
    };
    init();
  }, []);

  const handleRowDoubleClick = (product: Product) => {
    setSelectedProduct(product);
    setName(product.name);
    setSku(product.sku || "");
    setPrice(String(product.price));
    setStockQty(String(product.stock_qty));
    setMessage(`Selected product: ${product.name}`);
  };

  const handleClear = () => {
    setSelectedProduct(null);
    setName("");
    setSku("");
    setPrice("");
    setStockQty("");
    setMessage("");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !stockQty) {
      setMessage("Please fill out name, price, and stock quantity.");
      return;
    }

    const parsedPrice = parseFloat(price);
    const parsedQty = parseInt(stockQty, 10);

    if (isNaN(parsedPrice) || parsedPrice < 0) {
      setMessage("Price must be a positive number.");
      return;
    }

    if (isNaN(parsedQty) || parsedQty < 0) {
      setMessage("Stock quantity must be a positive integer.");
      return;
    }

    const payload = {
      name,
      sku: sku || null,
      price: parsedPrice,
      stock_qty: parsedQty,
    };

    if (selectedProduct) {
      // Update
      const { error } = await supabase
        .from("products")
        .update(payload)
        .eq("id", selectedProduct.id);

      if (error) {
        setMessage(`Error updating product: ${error.message}`);
      } else {
        setMessage(`Successfully updated ${name}`);
        handleClear();
        await loadProducts();
      }
    } else {
      // Create
      const { error } = await supabase
        .from("products")
        .insert(payload);

      if (error) {
        setMessage(`Error creating product: ${error.message}`);
      } else {
        setMessage(`Successfully created ${name}`);
        handleClear();
        await loadProducts();
      }
    }
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;

    const confirmDelete = window.confirm(`Are you sure you want to delete ${selectedProduct.name}?`);
    if (!confirmDelete) return;

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", selectedProduct.id);

    if (error) {
      setMessage(`Error deleting product: ${error.message}`);
    } else {
      setMessage(`Successfully deleted product.`);
      handleClear();
      await loadProducts();
    }
  };

  return (
    <DashboardShell requiredRole="distributor" title="Products">
      <div className="space-y-6">
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <Card className="p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-card-foreground">Products List</h2>
                  <p className="text-sm text-muted">
                    Double-click any product row to edit or delete it.
                  </p>
                </div>
              </div>
            </Card>

            <Table
              columns={columns}
              rows={products}
              getRowKey={(p) => p.id}
              onRowDoubleClick={handleRowDoubleClick}
            />
          </div>

          <div>
            <Card className="p-6">
              <h2 className="text-lg font-bold text-card-foreground">
                {selectedProduct ? "Edit Product" : "Add New Product"}
              </h2>
              <p className="text-sm text-muted mb-6">
                {selectedProduct ? "Modify or delete the selected product." : "Enter product details to add a new product."}
              </p>

              <form onSubmit={handleSave} className="space-y-4">
                <label className="block space-y-2 text-sm">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted">Product Name *</span>
                  <Input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Cola 500ml"
                  />
                </label>

                <label className="block space-y-2 text-sm">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted">SKU</span>
                  <Input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="e.g. COLA-500"
                  />
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block space-y-2 text-sm">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted">Price *</span>
                    <Input
                      type="number"
                      step="0.01"
                      required
                      min="0"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0.00"
                    />
                  </label>

                  <label className="block space-y-2 text-sm">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted">Stock Quantity *</span>
                    <Input
                      type="number"
                      required
                      min="0"
                      value={stockQty}
                      onChange={(e) => setStockQty(e.target.value)}
                      placeholder="0"
                    />
                  </label>
                </div>

                {message && (
                  <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mt-2">{message}</p>
                )}

                <div className="flex flex-wrap gap-2 pt-2">
                  <Button type="submit" variant="primary">
                    {selectedProduct ? "Update Product" : "Create Product"}
                  </Button>

                  {selectedProduct && (
                    <Button type="button" variant="danger" onClick={handleDelete}>
                      Delete Product
                    </Button>
                  )}

                  {(selectedProduct || name || sku || price || stockQty) && (
                    <Button type="button" variant="secondary" onClick={handleClear}>
                      Clear
                    </Button>
                  )}
                </div>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
