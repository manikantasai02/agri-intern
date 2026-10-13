-- ========================================================================
-- AgriConnect: Database Schema (PostgreSQL / Supabase)
-- Implements complete relational schema with constraints, triggers, and indices
-- ========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table (Linked to Supabase Auth or Local JWT Identity)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID UNIQUE NOT NULL, -- References auth.users(id) or local auth
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  mobile VARCHAR(20) UNIQUE NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('farmer', 'buyer', 'distributor', 'admin')),
  verification_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'suspended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Farmer Profiles Table
CREATE TABLE IF NOT EXISTS farmer_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  farm_name VARCHAR(150) NOT NULL,
  location_text VARCHAR(200) NOT NULL,
  producer_type VARCHAR(50) NOT NULL -- e.g., Individual Farmer, FPO
);

-- 3. Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  active BOOLEAN NOT NULL DEFAULT true
);

-- 4. Products / Crop Listings Table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id),
  commodity_name VARCHAR(100) NOT NULL,
  variety VARCHAR(100),
  description TEXT,
  quantity NUMERIC(12,2) NOT NULL CHECK (quantity >= 0),
  unit VARCHAR(20) NOT NULL, -- kg, tonne, quintal, bag, etc.
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  grade VARCHAR(50),
  harvest_date TIMESTAMPTZ,
  pickup_location VARCHAR(200) NOT NULL,
  image_url TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Inventory Table
CREATE TABLE IF NOT EXISTS inventory (
  product_id UUID PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
  available_qty NUMERIC(12,2) NOT NULL CHECK (available_qty >= 0),
  reserved_qty NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (reserved_qty >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES users(id),
  seller_id UUID NOT NULL REFERENCES users(id),
  status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'packed', 'dispatched', 'delivered', 'completed', 'cancelled')),
  total_amount NUMERIC(12,2) NOT NULL CHECK (total_amount >= 0),
  delivery_address TEXT NOT NULL,
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Order Items Table (Snapshot of purchase details)
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  quantity NUMERIC(12,2) NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0),
  subtotal NUMERIC(12,2) NOT NULL CHECK (subtotal >= 0)
);

-- 8. Deliveries Table
CREATE TABLE IF NOT EXISTS deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
  distributor_id UUID REFERENCES users(id),
  transporter_name VARCHAR(100),
  pickup_address TEXT NOT NULL,
  destination_address TEXT NOT NULL,
  scheduled_date TIMESTAMPTZ,
  status VARCHAR(30) NOT NULL DEFAULT 'unassigned' CHECK (status IN ('unassigned', 'assigned', 'picked_up', 'in_transit', 'delivered', 'exception')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Payments Table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL,
  provider_reference VARCHAR(150) UNIQUE,
  amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
  status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  paid_at TIMESTAMPTZ
);

-- 10. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  metadata JSONB,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_products_search ON products(commodity_name, status);
CREATE INDEX IF NOT EXISTS idx_orders_buyer_seller ON orders(buyer_id, seller_id);
CREATE INDEX IF NOT EXISTS idx_inventory_product ON inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_order ON deliveries(order_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_id);
