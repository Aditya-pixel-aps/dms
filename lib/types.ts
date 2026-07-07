// Types mirror the database schema defined in README.md (Section 9).

export type Role = "distributor" | "salesman";

export type OrderStatus =
  | "Pending"
  | "Billed"
  | "Dispatched"
  | "Delivered"
  | "Cancelled";

export type Profile = {
  id: string; // uuid, FK -> auth.users.id
  full_name: string;
  role: Role;
  created_at?: string;
};

export type Route = {
  id: number;
  name: string;
  visit_days: number[]; // ISO weekdays 1=Mon..7=Sun
};

export type Retailer = {
  id: number;
  name: string;
  phone: string | null;
  address: string | null;
  route_id: number;
};

export type Salesman = {
  id: number;
  profile_id: string;
  name: string;
  phone: string | null;
  active: boolean;
};

export type Product = {
  id: number;
  sku: string | null;
  name: string;
  price: number;
  stock_qty: number;
};

export type Order = {
  id: number;
  retailer_id: number;
  salesman_id: number;
  route_id: number;
  status: OrderStatus;
  order_date: string;
};

export type OrderItem = {
  id: number;
  order_id: number;
  product_id: number;
  qty: number;
  unit_price: number;
};

export type Vehicle = {
  id: number;
  vehicle_no: string;
  capacity: number | null;
  route_id: number | null;
};

export type Invoice = {
  id: number;
  order_id: number;
  vehicle_id: number | null;
  total: number;
  billed_at: string;
};
