// server/src/routes.js
const express = require('express');
const router = express.Router();

const { authenticateToken, authorizeRoles } = require('./middleware/auth');
const authController = require('./controllers/authController');
const productController = require('./controllers/productController');
const orderController = require('./controllers/orderController');
const adminController = require('./controllers/adminController');
const { db } = require('./db');

// --- AUTH ROUTES ---
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/me', authenticateToken, authController.getMe);

// --- CATEGORIES (Public / Authenticated) ---
router.get('/categories', (req, res) => {
  res.json({ success: true, data: db.categories.filter(c => c.active) });
});

// --- PRODUCT LISTINGS ROUTES ---
// GET /api/v1/products - Authenticated or Public preview
router.get('/products', productController.getProducts);
router.get('/products/:id', productController.getProductById);

// POST /api/v1/products - Farmer / FPO only
router.post('/products', authenticateToken, authorizeRoles('farmer', 'admin'), productController.createProduct);

// PATCH /api/v1/products/:id - Product Owner / Admin
router.patch('/products/:id', authenticateToken, productController.updateProduct);

// --- ORDER ROUTES ---
// POST /api/v1/orders - Buyer only
router.post('/orders', authenticateToken, authorizeRoles('buyer', 'admin'), orderController.placeOrder);

// GET /api/v1/orders - Retrieve user-relevant orders
router.get('/orders', authenticateToken, orderController.getOrders);

// GET /api/v1/orders/:id - Participant / Admin
router.get('/orders/:id', authenticateToken, orderController.getOrderById);

// PATCH /api/v1/orders/:id/status - Transition order status
router.patch('/orders/:id/status', authenticateToken, orderController.updateOrderStatus);

// POST /api/v1/deliveries/:id/status - Distributor delivery update
router.post('/deliveries/:id/status', authenticateToken, authorizeRoles('distributor', 'admin'), orderController.updateDeliveryStatus);

// POST /api/v1/payments/webhook - Gateway webhook simulated handler
router.post('/payments/webhook', (req, res) => {
  const { provider_reference, status } = req.body;
  const payment = db.payments.find(p => p.provider_reference === provider_reference);
  if (payment) {
    payment.status = status || 'paid';
    payment.paid_at = new Date().toISOString();
  }
  res.json({ success: true, message: 'Payment webhook event acknowledged' });
});

// --- ADMIN PANEL ROUTES ---
// GET /api/v1/admin/users - Administrator only
router.get('/admin/users', authenticateToken, authorizeRoles('admin'), adminController.getUsers);
router.patch('/admin/users/:id/verify', authenticateToken, authorizeRoles('admin'), adminController.verifyUser);
router.get('/admin/audit-logs', authenticateToken, authorizeRoles('admin'), adminController.getAuditLogs);
router.get('/admin/stats', authenticateToken, adminController.getPlatformStats);

module.exports = router;
