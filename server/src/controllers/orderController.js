const formatZodError = (err) => (err && Array.isArray(err.issues) ? err.issues.map(e => e.message).join(', ') : (err && Array.isArray(err.errors) ? err.errors.map(e => e.message).join(', ') : (err && err.message) || 'Validation failed'));
// server/src/controllers/orderController.js
const { z } = require('zod');
const { db, generateUuid } = require('../db');

const createOrderSchema = z.object({
  product_id: z.string().min(1, 'Product ID is required'),
  quantity: z.number().positive('Quantity must be greater than zero'),
  delivery_address: z.string().min(5, 'Delivery address is required')
});

const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'accepted', 'rejected', 'packed', 'dispatched', 'delivered', 'completed', 'cancelled']),
  cancellation_reason: z.string().optional()
});

/**
 * POST /api/v1/orders
 * Atomic transaction:
 * 1. Validate product exists and has sufficient stock
 * 2. Deduct available_qty & record reserved_qty in inventory
 * 3. Create order record
 * 4. Create order_items snapshot
 * 5. Create initial delivery record
 * 6. Create payment stub
 * 7. Write audit log
 */
const placeOrder = (req, res) => {
  const parseResult = createOrderSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      success: false,
      error: formatZodError(parseResult.error)
    });
  }

  const { product_id, quantity, delivery_address } = parseResult.data;
  const buyer_id = req.user.id;

  const product = db.products.find(p => p.id === product_id && p.status === 'active');
  if (!product) {
    return res.status(404).json({
      success: false,
      error: 'Product listing not found or is currently inactive.'
    });
  }

  if (product.seller_id === buyer_id) {
    return res.status(400).json({
      success: false,
      error: 'Farmers cannot purchase their own product listings.'
    });
  }

  const inv = db.inventory.find(i => i.product_id === product_id);
  if (!inv) {
    return res.status(400).json({
      success: false,
      error: 'Inventory record not found for this product.'
    });
  }

  // Stock check
  if (inv.available_qty < quantity) {
    return res.status(400).json({
      success: false,
      error: `Insufficient stock available. Requested: ${quantity} ${product.unit}, Available: ${inv.available_qty} ${product.unit}.`
    });
  }

  // Atomic state deduction to prevent race conditions
  inv.available_qty -= quantity;
  inv.reserved_qty += quantity;
  inv.updated_at = new Date().toISOString();

  // Also update product catalog remaining quantity
  product.quantity = inv.available_qty;

  const orderId = 'ord-' + generateUuid().substring(0, 8);
  const total_amount = Math.round(quantity * product.price * 100) / 100;

  const newOrder = {
    id: orderId,
    buyer_id,
    seller_id: product.seller_id,
    status: 'pending',
    total_amount,
    delivery_address,
    cancellation_reason: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  db.orders.unshift(newOrder);

  // Snapshot order items
  const orderItemId = 'oi-' + generateUuid().substring(0, 8);
  const newOrderItem = {
    id: orderItemId,
    order_id: orderId,
    product_id: product.id,
    quantity,
    unit_price: product.price,
    subtotal: total_amount
  };
  db.order_items.push(newOrderItem);

  // Initialize delivery record
  const deliveryId = 'del-' + generateUuid().substring(0, 8);
  const newDelivery = {
    id: deliveryId,
    order_id: orderId,
    distributor_id: null,
    transporter_name: 'Pending Assignment',
    pickup_address: product.pickup_location,
    destination_address: delivery_address,
    scheduled_date: new Date(Date.now() + 2 * 86400000).toISOString(),
    status: 'unassigned',
    updated_at: new Date().toISOString()
  };
  db.deliveries.push(newDelivery);

  // Initialize payment record
  const paymentId = 'pay-' + generateUuid().substring(0, 8);
  db.payments.push({
    id: paymentId,
    order_id: orderId,
    provider: 'EscrowPay AgriGateway',
    provider_reference: 'TXN-AGRI-' + Date.now(),
    amount: total_amount,
    status: 'paid', // Instant escrow reservation in mock mode
    paid_at: new Date().toISOString()
  });

  // Audit Log
  db.audit_logs.push({
    id: 'log-' + generateUuid(),
    actor_id: buyer_id,
    action: 'ORDER_PLACED_ATOMIC',
    entity_type: 'order',
    entity_id: orderId,
    metadata: { product_id, quantity, total_amount },
    timestamp: new Date().toISOString()
  });

  return res.status(201).json({
    success: true,
    message: 'Order created and stock successfully reserved',
    data: {
      order: newOrder,
      order_item: newOrderItem,
      delivery: newDelivery
    }
  });
};

/**
 * GET /api/v1/orders/:id
 */
const getOrderById = (req, res) => {
  const { id } = req.params;
  const order = db.orders.find(o => o.id === id);

  if (!order) {
    return res.status(404).json({ success: false, error: 'Order not found' });
  }

  // Participants or admin check
  if (order.buyer_id !== req.user.id && order.seller_id !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'distributor') {
    return res.status(403).json({ success: false, error: 'Unauthorized to view this order' });
  }

  const items = db.order_items.filter(oi => oi.order_id === order.id).map(oi => {
    const prod = db.products.find(p => p.id === oi.product_id);
    return {
      ...oi,
      product: prod ? { commodity_name: prod.commodity_name, variety: prod.variety, unit: prod.unit, image_url: prod.image_url } : null
    };
  });

  const delivery = db.deliveries.find(d => d.order_id === order.id);
  const payment = db.payments.find(p => p.order_id === order.id);
  const buyer = db.users.find(u => u.id === order.buyer_id);
  const seller = db.users.find(u => u.id === order.seller_id);

  return res.json({
    success: true,
    data: {
      ...order,
      items,
      delivery: delivery || null,
      payment: payment || null,
      buyer: buyer ? { name: buyer.name, email: buyer.email, mobile: buyer.mobile } : null,
      seller: seller ? { name: seller.name, email: seller.email, mobile: seller.mobile } : null
    }
  });
};

/**
 * GET /api/v1/orders - Retrieve user's orders (buyer or farmer/seller)
 */
const getOrders = (req, res) => {
  let userOrders = [];
  if (req.user.role === 'admin') {
    userOrders = [...db.orders];
  } else if (req.user.role === 'farmer') {
    userOrders = db.orders.filter(o => o.seller_id === req.user.id);
  } else if (req.user.role === 'buyer') {
    userOrders = db.orders.filter(o => o.buyer_id === req.user.id);
  } else if (req.user.role === 'distributor') {
    userOrders = [...db.orders];
  }

  const enriched = userOrders.map(order => {
    const items = db.order_items.filter(oi => oi.order_id === order.id).map(oi => {
      const prod = db.products.find(p => p.id === oi.product_id);
      return {
        ...oi,
        product: prod ? { commodity_name: prod.commodity_name, variety: prod.variety, unit: prod.unit, image_url: prod.image_url } : null
      };
    });
    const delivery = db.deliveries.find(d => d.order_id === order.id);
    const buyer = db.users.find(u => u.id === order.buyer_id);
    const seller = db.users.find(u => u.id === order.seller_id);

    return {
      ...order,
      items,
      delivery: delivery || null,
      buyer: buyer ? { name: buyer.name, mobile: buyer.mobile } : null,
      seller: seller ? { name: seller.name, mobile: seller.mobile } : null
    };
  });

  return res.json({
    success: true,
    data: enriched
  });
};

/**
 * PATCH /api/v1/orders/:id/status
 */
const updateOrderStatus = (req, res) => {
  const { id } = req.params;
  const parseResult = updateOrderStatusSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      success: false,
      error: formatZodError(parseResult.error)
    });
  }

  const order = db.orders.find(o => o.id === id);
  if (!order) {
    return res.status(404).json({ success: false, error: 'Order not found' });
  }

  // Ownership/Role validation
  const isSeller = order.seller_id === req.user.id;
  const isBuyer = order.buyer_id === req.user.id;
  const isAdmin = req.user.role === 'admin';
  const isDistributor = req.user.role === 'distributor';

  if (!isSeller && !isBuyer && !isAdmin && !isDistributor) {
    return res.status(403).json({ success: false, error: 'Unauthorized to modify order status' });
  }

  const { status, cancellation_reason } = parseResult.data;

  // If order is cancelled, revert reserved stock
  if (status === 'cancelled' && order.status !== 'cancelled') {
    const items = db.order_items.filter(oi => oi.order_id === order.id);
    items.forEach(item => {
      const inv = db.inventory.find(i => i.product_id === item.product_id);
      if (inv) {
        inv.available_qty += item.quantity;
        inv.reserved_qty = Math.max(0, inv.reserved_qty - item.quantity);
        inv.updated_at = new Date().toISOString();
      }
      const prod = db.products.find(p => p.id === item.product_id);
      if (prod && inv) {
        prod.quantity = inv.available_qty;
      }
    });
    order.cancellation_reason = cancellation_reason || 'Cancelled by participant';
  }

  order.status = status;
  order.updated_at = new Date().toISOString();

  // If status is dispatched or delivered, update corresponding delivery
  const delivery = db.deliveries.find(d => d.order_id === order.id);
  if (delivery) {
    if (status === 'dispatched') {
      delivery.status = 'in_transit';
    } else if (status === 'delivered' || status === 'completed') {
      delivery.status = 'delivered';
    }
    delivery.updated_at = new Date().toISOString();
  }

  db.audit_logs.push({
    id: 'log-' + generateUuid(),
    actor_id: req.user.id,
    action: `ORDER_STATUS_CHANGED_${status.toUpperCase()}`,
    entity_type: 'order',
    entity_id: order.id,
    metadata: { new_status: status },
    timestamp: new Date().toISOString()
  });

  return res.json({
    success: true,
    message: `Order status transitioned to ${status}`,
    data: order
  });
};

/**
 * POST /api/v1/deliveries/:id/status - Distributor status update
 */
const updateDeliveryStatus = (req, res) => {
  const { id } = req.params;
  const { status, transporter_name } = req.body;

  const delivery = db.deliveries.find(d => d.id === id || d.order_id === id);
  if (!delivery) {
    return res.status(404).json({ success: false, error: 'Delivery record not found' });
  }

  if (status) delivery.status = status;
  if (transporter_name) delivery.transporter_name = transporter_name;
  if (req.user.role === 'distributor') delivery.distributor_id = req.user.id;
  delivery.updated_at = new Date().toISOString();

  // Sync to parent order
  const order = db.orders.find(o => o.id === delivery.order_id);
  if (order) {
    if (status === 'in_transit') order.status = 'dispatched';
    if (status === 'delivered') order.status = 'delivered';
    order.updated_at = new Date().toISOString();
  }

  return res.json({
    success: true,
    message: 'Delivery status updated',
    data: delivery
  });
};

module.exports = {
  placeOrder,
  getOrderById,
  getOrders,
  updateOrderStatus,
  updateDeliveryStatus
};
