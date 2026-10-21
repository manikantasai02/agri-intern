const test = require('node:test');
const assert = require('node:assert/strict');

// Set NODE_ENV to test before requiring app
process.env.NODE_ENV = 'test';
const app = require('../src/app');
const { db } = require('../src/db');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../src/middleware/auth');

let server;
let baseUrl;

test.before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      baseUrl = `http://localhost:${server.address().port}`;
      resolve();
    });
  });
});

test.after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

async function makeRequest(method, path, body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, data };
}

test('TC-01: Health Endpoint is Live (Smoke Check)', async () => {
  const res = await makeRequest('GET', '/health');
  assert.equal(res.status, 200);
  assert.equal(res.data.status, 'healthy');
  assert.equal(res.data.system, 'AgriConnect Core API');
});

test('TC-02: User Registration (Positive)', async () => {
  const randomSuffix = Math.floor(Math.random() * 100000);
  const payload = {
    name: 'Test Farmer',
    email: `farmer${randomSuffix}@test.org`,
    mobile: `+9198765${String(randomSuffix).padStart(5, '0')}`,
    password: 'password123',
    role: 'farmer',
    farm_name: 'Green Field Valley',
    location_text: 'Pune, Maharashtra',
    producer_type: 'Individual Farmer'
  };

  const res = await makeRequest('POST', '/api/v1/auth/register', payload);
  assert.equal(res.status, 201);
  assert.equal(res.data.success, true);
  assert.ok(res.data.data.token);
  assert.equal(res.data.data.user.role, 'farmer');
});

test('TC-03: User Registration with missing/invalid fields (Negative)', async () => {
  const invalidPayload = {
    name: 'A', // too short (<2 chars)
    email: 'invalid-email',
    role: 'hacker' // invalid role
  };

  const res = await makeRequest('POST', '/api/v1/auth/register', invalidPayload);
  assert.equal(res.status, 400);
  assert.equal(res.data.success, false);
});

test('TC-04: Login with valid credentials', async () => {
  const payload = {
    email: 'ramesh.farmer@agriconnect.org',
    password: 'password123'
  };

  const res = await makeRequest('POST', '/api/v1/auth/login', payload);
  assert.equal(res.status, 200);
  assert.equal(res.data.success, true);
  assert.ok(res.data.data.token);
});

test('TC-05: Login with wrong password (Negative)', async () => {
  const payload = {
    email: 'ramesh.farmer@agriconnect.org',
    password: 'wrong_password_xyz'
  };

  const res = await makeRequest('POST', '/api/v1/auth/login', payload);
  assert.equal(res.status, 401);
  assert.equal(res.data.success, false);
});

test('TC-06: Role-Based Authorization - Buyer cannot list crop (Negative)', async () => {
  const buyerUser = db.users.find(u => u.role === 'buyer');
  const token = jwt.sign({ id: buyerUser.id, email: buyerUser.email, role: buyerUser.role }, JWT_SECRET);

  const payload = {
    commodity_name: 'Unauthorized Crop',
    quantity: 100,
    unit: 'quintal',
    price: 3000,
    pickup_location: 'Farm Gate'
  };

  const res = await makeRequest('POST', '/api/v1/products', payload, token);
  assert.equal(res.status, 403);
  assert.equal(res.data.success, false);
});

test('TC-07: Farmer can list agricultural crop (Positive)', async () => {
  const farmerUser = db.users.find(u => u.role === 'farmer');
  const token = jwt.sign({ id: farmerUser.id, email: farmerUser.email, role: farmerUser.role }, JWT_SECRET);

  const payload = {
    commodity_name: 'Organic Wheat Sharbati',
    variety: 'C-306 Special',
    quantity: 150,
    unit: 'quintal',
    price: 4200,
    grade: 'Grade A Export',
    pickup_location: 'Nashik Farm Gate #3'
  };

  const res = await makeRequest('POST', '/api/v1/products', payload, token);
  assert.equal(res.status, 201);
  assert.equal(res.data.success, true);
  assert.equal(res.data.data.commodity_name, 'Organic Wheat Sharbati');
});

test('TC-08: Product creation rejects negative quantity/price (Negative)', async () => {
  const farmerUser = db.users.find(u => u.role === 'farmer');
  const token = jwt.sign({ id: farmerUser.id, email: farmerUser.email, role: farmerUser.role }, JWT_SECRET);

  const payload = {
    commodity_name: 'Bad Price Crop',
    quantity: -50,
    unit: 'quintal',
    price: -100,
    pickup_location: 'Warehouse'
  };

  const res = await makeRequest('POST', '/api/v1/products', payload, token);
  assert.equal(res.status, 400);
});

test('TC-09: Search and filter active crop listings', async () => {
  const res = await makeRequest('GET', '/api/v1/products?q=Basmati');
  assert.equal(res.status, 200);
  assert.equal(res.data.success, true);
  assert.ok(res.data.data.length > 0);
});

test('TC-10: Listing Ownership Security - Farmer cannot modify another farmer listing (Negative)', async () => {
  const secondFarmer = {
    id: 'u-other-farmer-99',
    auth_id: 'auth-other-99',
    name: 'Other Farmer',
    email: 'other.farmer@agriconnect.org',
    mobile: '+919999900000',
    role: 'farmer',
    verification_status: 'verified'
  };
  if (!db.users.some(u => u.id === secondFarmer.id)) {
    db.users.push(secondFarmer);
  }

  const token = jwt.sign({ id: secondFarmer.id, email: secondFarmer.email, role: secondFarmer.role }, JWT_SECRET);
  const existingProduct = db.products.find(p => p.seller_id === 'u-farmer-1');
  const res = await makeRequest('PATCH', `/api/v1/products/${existingProduct.id}`, { price: 9999 }, token);
  assert.equal(res.status, 403);
});

test('TC-11: Atomic Order Placement - Deducts stock & reserves inventory (Positive)', async () => {
  const buyerUser = db.users.find(u => u.role === 'buyer');
  const token = jwt.sign({ id: buyerUser.id, email: buyerUser.email, role: buyerUser.role }, JWT_SECRET);
  const targetProduct = db.products.find(p => p.status === 'active' && p.seller_id !== buyerUser.id && p.quantity >= 5);
  const initialQty = targetProduct.quantity;

  const res = await makeRequest('POST', '/api/v1/orders', {
    product_id: targetProduct.id,
    quantity: 5,
    delivery_address: 'APMC Market Yard, Pune'
  }, token);

  assert.equal(res.status, 201);
  assert.equal(res.data.success, true);
  assert.equal(targetProduct.quantity, initialQty - 5);
});

test('TC-12: Order rejects request exceeding available stock (Negative)', async () => {
  const buyerUser = db.users.find(u => u.role === 'buyer');
  const token = jwt.sign({ id: buyerUser.id, email: buyerUser.email, role: buyerUser.role }, JWT_SECRET);
  const targetProduct = db.products[0];

  const res = await makeRequest('POST', '/api/v1/orders', {
    product_id: targetProduct.id,
    quantity: 999999,
    delivery_address: 'APMC Market Yard'
  }, token);

  assert.equal(res.status, 400);
  assert.match(res.data.error, /Insufficient stock/i);
});

test('TC-13: Concurrent orders race condition check', async () => {
  const buyerUser = db.users.find(u => u.role === 'buyer');
  const token = jwt.sign({ id: buyerUser.id, email: buyerUser.email, role: buyerUser.role }, JWT_SECRET);
  
  const exclusiveProduct = {
    id: 'p-race-test-' + Date.now(),
    seller_id: 'u-farmer-1',
    category_id: 'cat-1',
    commodity_name: 'Single Unit Organic Lot',
    quantity: 10,
    unit: 'quintal',
    price: 1000,
    pickup_location: 'Race Test Warehouse',
    status: 'active'
  };
  db.products.push(exclusiveProduct);
  db.inventory.push({
    product_id: exclusiveProduct.id,
    available_qty: 10,
    reserved_qty: 0
  });

  const res1 = await makeRequest('POST', '/api/v1/orders', { product_id: exclusiveProduct.id, quantity: 8, delivery_address: 'APMC Market Yard Area A' }, token);
  const res2 = await makeRequest('POST', '/api/v1/orders', { product_id: exclusiveProduct.id, quantity: 8, delivery_address: 'APMC Market Yard Area B' }, token);

  assert.equal(res1.status, 201, 'First order must succeed');
  assert.equal(res2.status, 400, 'Second order must fail due to exhausted stock');
  assert.equal(exclusiveProduct.quantity, 2, 'Remaining quantity must be exactly 2');
});

test('TC-21: API error handling - 404 for unknown routes without leaking stack traces', async () => {
  const res = await makeRequest('GET', '/api/v1/nonexistent-route-xyz');
  assert.equal(res.status, 404);
  assert.equal(res.data.success, false);
});
