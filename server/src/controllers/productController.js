const formatZodError = (err) => (err && Array.isArray(err.issues) ? err.issues.map(e => e.message).join(', ') : (err && Array.isArray(err.errors) ? err.errors.map(e => e.message).join(', ') : (err && err.message) || 'Validation failed'));
// server/src/controllers/productController.js
const { z } = require('zod');
const { db, generateUuid } = require('../db');

const createProductSchema = z.object({
  category_id: z.string().optional(),
  commodity_name: z.string().min(2, 'Commodity name is required'),
  variety: z.string().optional(),
  description: z.string().optional(),
  quantity: z.number().positive('Quantity must be greater than 0'),
  unit: z.string().min(1, 'Unit is required'),
  price: z.number().nonnegative('Price must be non-negative'),
  grade: z.string().optional(),
  harvest_date: z.string().optional(),
  pickup_location: z.string().min(3, 'Pickup location is required'),
  image_url: z.string().optional()
});

const updateProductSchema = z.object({
  commodity_name: z.string().optional(),
  variety: z.string().optional(),
  description: z.string().optional(),
  price: z.number().nonnegative().optional(),
  grade: z.string().optional(),
  pickup_location: z.string().optional(),
  image_url: z.string().optional(),
  status: z.enum(['active', 'inactive', 'archived']).optional()
});

/**
 * GET /api/v1/products - Search & filter listings with pagination
 */
const getProducts = (req, res) => {
  const {
    q,
    category,
    minPrice,
    maxPrice,
    location,
    page = 1,
    limit = 10,
    sellerId
  } = req.query;

  let results = db.products.filter(p => p.status === 'active' || sellerId);

  // If filtered by specific seller
  if (sellerId) {
    results = results.filter(p => p.seller_id === sellerId);
  }

  // Text search on commodity name or variety
  if (q) {
    const term = q.toLowerCase();
    results = results.filter(p =>
      p.commodity_name.toLowerCase().includes(term) ||
      (p.variety && p.variety.toLowerCase().includes(term)) ||
      (p.description && p.description.toLowerCase().includes(term))
    );
  }

  // Category filter
  if (category) {
    results = results.filter(p => p.category_id === category);
  }

  // Location filter
  if (location) {
    const loc = location.toLowerCase();
    results = results.filter(p => p.pickup_location.toLowerCase().includes(loc));
  }

  // Price bounds
  if (minPrice) {
    results = results.filter(p => p.price >= parseFloat(minPrice));
  }
  if (maxPrice) {
    results = results.filter(p => p.price <= parseFloat(maxPrice));
  }

  const total = results.length;
  const currentPage = parseInt(page, 10) || 1;
  const perPage = parseInt(limit, 10) || 10;
  const startIndex = (currentPage - 1) * perPage;
  const paginated = results.slice(startIndex, startIndex + perPage);

  // Join inventory & seller details
  const enriched = paginated.map(p => {
    const inv = db.inventory.find(i => i.product_id === p.id);
    const seller = db.users.find(u => u.id === p.seller_id);
    const farm = db.farmer_profiles.find(fp => fp.user_id === p.seller_id);
    const cat = db.categories.find(c => c.id === p.category_id);

    return {
      ...p,
      inventory: inv ? { available_qty: inv.available_qty, reserved_qty: inv.reserved_qty } : { available_qty: p.quantity, reserved_qty: 0 },
      seller: seller ? { name: seller.name, mobile: seller.mobile, verification_status: seller.verification_status } : null,
      farm_name: farm ? farm.farm_name : null,
      category_name: cat ? cat.name : null
    };
  });

  return res.json({
    success: true,
    data: enriched,
    pagination: {
      total,
      page: currentPage,
      limit: perPage,
      totalPages: Math.ceil(total / perPage)
    }
  });
};

/**
 * GET /api/v1/products/:id
 */
const getProductById = (req, res) => {
  const { id } = req.params;
  const product = db.products.find(p => p.id === id);
  if (!product) {
    return res.status(404).json({ success: false, error: 'Product listing not found' });
  }

  const inv = db.inventory.find(i => i.product_id === product.id);
  const seller = db.users.find(u => u.id === product.seller_id);
  const farm = db.farmer_profiles.find(fp => fp.user_id === product.seller_id);
  const cat = db.categories.find(c => c.id === product.category_id);

  return res.json({
    success: true,
    data: {
      ...product,
      inventory: inv || { available_qty: product.quantity, reserved_qty: 0 },
      seller: seller ? { name: seller.name, email: seller.email, mobile: seller.mobile } : null,
      farm_name: farm ? farm.farm_name : null,
      category_name: cat ? cat.name : null
    }
  });
};

/**
 * POST /api/v1/products - Farmer / FPO create listing
 */
const createProduct = (req, res) => {
  const parseResult = createProductSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      success: false,
      error: formatZodError(parseResult.error)
    });
  }

  const pData = parseResult.data;
  const productId = 'p-' + generateUuid();

  const newProduct = {
    id: productId,
    seller_id: req.user.id,
    category_id: pData.category_id || 'cat-1',
    commodity_name: pData.commodity_name,
    variety: pData.variety || '',
    description: pData.description || '',
    quantity: pData.quantity,
    unit: pData.unit,
    price: pData.price,
    grade: pData.grade || 'Standard Quality',
    harvest_date: pData.harvest_date || new Date().toISOString(),
    pickup_location: pData.pickup_location,
    image_url: pData.image_url || 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=800&q=80',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  db.products.unshift(newProduct);

  // Initialize inventory link atomically
  db.inventory.push({
    product_id: productId,
    available_qty: pData.quantity,
    reserved_qty: 0,
    updated_at: new Date().toISOString()
  });

  // Audit log
  db.audit_logs.push({
    id: 'log-' + generateUuid(),
    actor_id: req.user.id,
    action: 'CREATE_PRODUCT_LISTING',
    entity_type: 'product',
    entity_id: productId,
    metadata: { commodity: newProduct.commodity_name, qty: newProduct.quantity },
    timestamp: new Date().toISOString()
  });

  return res.status(201).json({
    success: true,
    message: 'Crop listing created and inventory synced successfully',
    data: newProduct
  });
};

/**
 * PATCH /api/v1/products/:id - Owner / Admin update
 */
const updateProduct = (req, res) => {
  const { id } = req.params;
  const product = db.products.find(p => p.id === id);

  if (!product) {
    return res.status(404).json({ success: false, error: 'Product not found' });
  }

  // Authorization check: Owner or Admin
  if (product.seller_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Unauthorized: Only product owner or administrator can modify this listing'
    });
  }

  const parseResult = updateProductSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      success: false,
      error: formatZodError(parseResult.error)
    });
  }

  Object.assign(product, parseResult.data, { updated_at: new Date().toISOString() });

  db.audit_logs.push({
    id: 'log-' + generateUuid(),
    actor_id: req.user.id,
    action: 'UPDATE_PRODUCT_LISTING',
    entity_type: 'product',
    entity_id: product.id,
    metadata: parseResult.data,
    timestamp: new Date().toISOString()
  });

  return res.json({
    success: true,
    message: 'Product listing updated successfully',
    data: product
  });
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct
};
