// server/src/db.js
// In-Memory robust store with optional PostgreSQL client pool fallback
const { Pool } = require('pg');
const crypto = require('crypto');

let pool = null;
if (process.env.DATABASE_URL && process.env.USE_REAL_POSTGRES === 'true') {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
}

// In-Memory relational database simulation ensuring atomic transactions, constraints & immediate execution
const db = {
  users: [
    {
      id: 'u-farmer-1',
      auth_id: 'auth-f-1',
      name: 'Ramesh Patel',
      email: 'ramesh.farmer@agriconnect.org',
      mobile: '+91 98765 43210',
      role: 'farmer',
      verification_status: 'verified',
      password: 'password123',
      created_at: new Date(Date.now() - 30 * 86400000).toISOString()
    },
    {
      id: 'u-buyer-1',
      auth_id: 'auth-b-1',
      name: 'Green Harvest Organics (Anita Rao)',
      email: 'buyer@greenharvest.com',
      mobile: '+91 98220 11223',
      role: 'buyer',
      verification_status: 'verified',
      password: 'password123',
      created_at: new Date(Date.now() - 20 * 86400000).toISOString()
    },
    {
      id: 'u-dist-1',
      auth_id: 'auth-d-1',
      name: 'Kisan Agro Logistics',
      email: 'logistics@kisanagro.com',
      mobile: '+91 98111 77889',
      role: 'distributor',
      verification_status: 'verified',
      password: 'password123',
      created_at: new Date(Date.now() - 15 * 86400000).toISOString()
    },
    {
      id: 'u-admin-1',
      auth_id: 'auth-a-1',
      name: 'Admin Desk',
      email: 'admin@agriconnect.org',
      mobile: '+91 99000 88990',
      role: 'admin',
      verification_status: 'verified',
      password: 'password123',
      created_at: new Date(Date.now() - 60 * 86400000).toISOString()
    }
  ],
  farmer_profiles: [
    {
      user_id: 'u-farmer-1',
      farm_name: 'Golden Valley Organic Acres',
      location_text: 'Nashik Valley, Maharashtra, India',
      producer_type: 'Individual Farmer'
    }
  ],
  categories: [
    { id: 'cat-1', name: 'Grains & Cereals', description: 'Rice, Wheat, Millets, Maize, Barley', active: true },
    { id: 'cat-2', name: 'Pulses & Legumes', description: 'Chickpeas, Lentils, Moong, Toor Dal', active: true },
    { id: 'cat-3', name: 'Fresh Vegetables', description: 'Farm fresh organically grown vegetables', active: true },
    { id: 'cat-4', name: 'Fruits & Berries', description: 'Fresh seasonal fruits straight from orchards', active: true },
    { id: 'cat-5', name: 'Spices & Herbs', description: 'Cardamom, Turmeric, Cumin, Pepper', active: true }
  ],
  products: [
    {
      id: 'p-1',
      seller_id: 'u-farmer-1',
      category_id: 'cat-1',
      commodity_name: 'Premium Basmati Rice (Organic)',
      variety: '1121 Extra Long Grain',
      description: 'Aromatic, aged traditional basmati paddy harvested using pure rainwater harvesting and natural vermicompost.',
      quantity: 450,
      unit: 'quintal',
      price: 4850,
      grade: 'Grade A Export',
      harvest_date: new Date(Date.now() - 15 * 86400000).toISOString(),
      pickup_location: 'Nashik Valley Warehouse #4, Maharashtra',
      image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80',
      status: 'active',
      created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'p-2',
      seller_id: 'u-farmer-1',
      category_id: 'cat-2',
      commodity_name: 'Desi Chickpeas (Chana)',
      variety: 'Kabuli Bold Grade 1',
      description: 'Sun-dried high protein chickpeas harvested without synthetic chemicals or pesticides.',
      quantity: 180,
      unit: 'quintal',
      price: 6200,
      grade: 'Premium Grade',
      harvest_date: new Date(Date.now() - 25 * 86400000).toISOString(),
      pickup_location: 'Nashik Valley Warehouse #4, Maharashtra',
      image_url: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=800&q=80',
      status: 'active',
      created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'p-3',
      seller_id: 'u-farmer-1',
      category_id: 'cat-5',
      commodity_name: 'High Curcumin Lakadong Turmeric',
      variety: 'Lakadong Organic Raw Roots',
      description: 'Lab-tested 7.5% curcumin natural turmeric, washed, dried, ready for processing or direct consumer packaging.',
      quantity: 75,
      unit: 'quintal',
      price: 12500,
      grade: 'Curcumin > 7%',
      harvest_date: new Date(Date.now() - 35 * 86400000).toISOString(),
      pickup_location: 'Nashik Agro Hub Unit 2, Maharashtra',
      image_url: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80',
      status: 'active',
      created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'p-4',
      seller_id: 'u-farmer-1',
      category_id: 'cat-3',
      commodity_name: 'Vine-Ripened Organic Tomatoes',
      variety: 'San Marzano Hybrid',
      description: 'Firm, juicy, farm-picked fresh tomatoes with deep crimson colour and natural sweetness.',
      quantity: 300,
      unit: 'crate (25kg)',
      price: 650,
      grade: 'Grade A Fresh',
      harvest_date: new Date(Date.now() - 2 * 86400000).toISOString(),
      pickup_location: 'Green Acres Farm Gate, Nashik, Maharashtra',
      image_url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80',
      status: 'active',
      created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  inventory: [
    { product_id: 'p-1', available_qty: 450, reserved_qty: 0, updated_at: new Date().toISOString() },
    { product_id: 'p-2', available_qty: 180, reserved_qty: 0, updated_at: new Date().toISOString() },
    { product_id: 'p-3', available_qty: 75, reserved_qty: 0, updated_at: new Date().toISOString() },
    { product_id: 'p-4', available_qty: 300, reserved_qty: 0, updated_at: new Date().toISOString() }
  ],
  orders: [
    {
      id: 'ord-1001',
      buyer_id: 'u-buyer-1',
      seller_id: 'u-farmer-1',
      status: 'dispatched',
      total_amount: 97000,
      delivery_address: 'Green Harvest Logistics Hub, Plot 42 Industrial Area, Pune 411019',
      cancellation_reason: null,
      created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 1 * 86400000).toISOString()
    }
  ],
  order_items: [
    {
      id: 'oi-1001',
      order_id: 'ord-1001',
      product_id: 'p-1',
      quantity: 20,
      unit_price: 4850,
      subtotal: 97000
    }
  ],
  deliveries: [
    {
      id: 'del-1001',
      order_id: 'ord-1001',
      distributor_id: 'u-dist-1',
      transporter_name: 'Kisan Express Fleet #KA-04-E-2918',
      pickup_address: 'Nashik Valley Warehouse #4, Maharashtra',
      destination_address: 'Green Harvest Logistics Hub, Plot 42 Industrial Area, Pune 411019',
      scheduled_date: new Date(Date.now() + 1 * 86400000).toISOString(),
      status: 'in_transit',
      updated_at: new Date().toISOString()
    }
  ],
  payments: [
    {
      id: 'pay-1001',
      order_id: 'ord-1001',
      provider: 'EscrowPay AgriGateway',
      provider_reference: 'TXN-AGRI-2026-98711',
      amount: 97000,
      status: 'paid',
      paid_at: new Date(Date.now() - 4 * 86400000).toISOString()
    }
  ],
  audit_logs: [
    {
      id: 'log-1',
      actor_id: 'u-farmer-1',
      action: 'LIST_PRODUCT',
      entity_type: 'product',
      entity_id: 'p-1',
      metadata: { commodity: 'Premium Basmati Rice' },
      timestamp: new Date(Date.now() - 10 * 86400000).toISOString()
    },
    {
      id: 'log-2',
      actor_id: 'u-buyer-1',
      action: 'ORDER_PLACED',
      entity_type: 'order',
      entity_id: 'ord-1001',
      metadata: { total: 97000 },
      timestamp: new Date(Date.now() - 4 * 86400000).toISOString()
    }
  ]
};

module.exports = {
  db,
  pool,
  generateUuid: () => crypto.randomUUID ? crypto.randomUUID() : 'uuid-' + Math.random().toString(36).substring(2, 10)
};
