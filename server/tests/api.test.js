// Integration tests - require a reachable MongoDB (MONGO_TEST_URI or a local mongod).
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret_value_1234567890';
const MONGO_TEST_URI = process.env.MONGO_TEST_URI || 'mongodb://127.0.0.1:27017/nb-classic-scents-test';

const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../app');
const Category = require('../models/Category');
const Product = require('../models/Product');
const User = require('../models/User');
const Coupon = require('../models/Coupon');
const { categories, products, coupons } = require('../seed/catalogue');

let adminAgent;
let customerAgent;
let eclat;

before(async () => {
  await mongoose.connect(MONGO_TEST_URI);
  await mongoose.connection.dropDatabase();
  const cats = await Category.insertMany(categories);
  const catId = Object.fromEntries(cats.map((c) => [c.slug, c._id]));
  for (const { cats: slugs, ...p } of products) {
    // eslint-disable-next-line no-await-in-loop
    await Product.create({ ...p, categories: slugs.map((s) => catId[s]) });
  }
  await Coupon.insertMany(coupons);
  await User.create({ name: 'Admin', email: 'admin@test.com', password: 'AdminPass1', role: 'admin' });
  eclat = await Product.findOne({ slug: 'eclat' });

  adminAgent = request.agent(app);
  await adminAgent.post('/api/auth/login').send({ email: 'admin@test.com', password: 'AdminPass1' }).expect(200);
  customerAgent = request.agent(app);
});

after(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

test('registration enforces a strong password and sets an httpOnly cookie', async () => {
  await customerAgent.post('/api/auth/register').send({ name: 'Ayesha', email: 'ayesha@test.com', password: 'short' }).expect(400);
  const res = await customerAgent.post('/api/auth/register').send({ name: 'Ayesha', email: 'ayesha@test.com', password: 'Perfume2026' }).expect(201);
  assert.match(res.headers['set-cookie'][0], /token=.*HttpOnly/i);
  assert.equal(res.body.user.email, 'ayesha@test.com');
  assert.equal(res.body.user.password, undefined);
  const stored = await User.findOne({ email: 'ayesha@test.com' }).select('+password');
  assert.notEqual(stored.password, 'Perfume2026');
  assert.match(stored.password, /^\$2[aby]\$12\$/);
  const me = await customerAgent.get('/api/auth/me').expect(200);
  assert.equal(me.body.user.name, 'Ayesha');
});

test('products can be filtered by category, searched, and sorted by price', async () => {
  const oud = await request(app).get('/api/products?category=oud').expect(200);
  assert.ok(oud.body.total >= 3);
  assert.ok(oud.body.products.every((p) => p.categories.some((c) => c.slug === 'oud')));
  const search = await request(app).get('/api/products?search=jasmine').expect(200);
  assert.ok(search.body.products.some((p) => p.slug === 'eclat'));
  const sorted = await request(app).get('/api/products?sort=price-asc&limit=50').expect(200);
  const prices = sorted.body.products.map((p) => p.price);
  assert.deepEqual(prices, [...prices].sort((a, b) => a - b));
  const one = await request(app).get('/api/products/eclat').expect(200);
  assert.equal(one.body.product.variants.length, 3);
  assert.deepEqual(one.body.product.notes.top.slice(0, 1), ['Bergamot']);
});

test('cart quote applies discount codes and free shipping', async () => {
  const v = eclat.variants[0];
  const quote = await request(app)
    .post('/api/cart/quote')
    .send({ items: [{ product: eclat._id, variantId: v._id, quantity: 1 }], couponCode: 'welcome10' })
    .expect(200);
  assert.equal(quote.body.subtotal, v.price);
  assert.equal(quote.body.discount, Math.round(v.price * 0.1));
  assert.equal(quote.body.shipping, 450);
  const bad = await request(app).post('/api/cart/quote').send({ items: [{ product: eclat._id, variantId: v._id, quantity: 1 }], couponCode: 'SIGNATURE15' }).expect(200);
  assert.match(bad.body.couponError, /minimum order/);
  const big = await request(app).post('/api/cart/quote').send({ items: [{ product: eclat._id, variantId: eclat.variants[2]._id, quantity: 1 }] }).expect(200);
  assert.equal(big.body.shipping, 0);
});

test('placing an order reserves stock, and cancelling restores it', async () => {
  const v = eclat.variants[1];
  const before = v.stock;
  const res = await customerAgent
    .post('/api/orders')
    .send({
      items: [{ product: eclat._id, variantId: v._id, quantity: 2 }],
      customerInfo: { name: 'Ayesha', email: 'ayesha@test.com', phone: '03001234567' },
      shippingAddress: { address: '1 Mall Road', city: 'Lahore', postalCode: '54000', country: 'Pakistan' },
      paymentMethod: 'Cash on Delivery',
      saveAddress: true,
    })
    .expect(201);
  assert.match(res.body.order.orderNumber, /^NB-/);
  assert.equal(res.body.order.totalPrice, v.price * 2 + 0);
  let fresh = await Product.findById(eclat._id);
  assert.equal(fresh.variants.id(v._id).stock, before - 2);

  const addresses = await customerAgent.get('/api/users/addresses').expect(200);
  assert.equal(addresses.body.addresses.length, 1);

  const mine = await customerAgent.get('/api/orders/my-orders').expect(200);
  assert.equal(mine.body.orders.length, 1);

  await customerAgent.put(`/api/orders/${res.body.order._id}/cancel`).expect(200);
  fresh = await Product.findById(eclat._id);
  assert.equal(fresh.variants.id(v._id).stock, before);
});

test('orders cannot exceed stock and card payments are validated', async () => {
  const safran = await Product.findOne({ slug: 'safran-noir' });
  const soldOut = safran.variants.find((v) => v.stock === 0);
  const base = {
    customerInfo: { name: 'Guest', email: 'guest@test.com', phone: '03000000000' },
    shippingAddress: { address: '2 Clifton', city: 'Karachi', postalCode: '75600', country: 'Pakistan' },
  };
  await request(app).post('/api/orders').send({ ...base, items: [{ product: safran._id, variantId: soldOut._id, quantity: 1 }] }).expect(400);

  const v = eclat.variants[0];
  const declined = await request(app)
    .post('/api/orders')
    .send({ ...base, items: [{ product: eclat._id, variantId: v._id, quantity: 1 }], paymentMethod: 'Card Payment', card: { number: '4242424242424241', expiry: '12/40', cvc: '123', name: 'Guest' } })
    .expect(402);
  assert.match(declined.body.message, /valid card number/);

  const paid = await request(app)
    .post('/api/orders')
    .send({ ...base, items: [{ product: eclat._id, variantId: v._id, quantity: 1 }], paymentMethod: 'Card Payment', card: { number: '4242 4242 4242 4242', expiry: '12/40', cvc: '123', name: 'Guest' } })
    .expect(201);
  assert.equal(paid.body.order.paymentStatus, 'Paid');
  assert.equal(paid.body.order.paymentDetails.last4, '4242');
  assert.equal(JSON.stringify(paid.body.order).includes('4242424242424242'), false);

  // Guests can view their order only with the matching email.
  await request(app).get(`/api/orders/${paid.body.order._id}`).expect(404);
  await request(app).get(`/api/orders/${paid.body.order._id}?email=guest@test.com`).expect(200);
});

test('admin routes are protected and return analytics', async () => {
  await customerAgent.get('/api/admin/stats').expect(403);
  await request(app).get('/api/admin/stats').expect(401);
  const stats = await adminAgent.get('/api/admin/stats').expect(200);
  assert.ok(stats.body.stats.totalOrders >= 1);
  assert.ok(stats.body.stats.bestsellers.length >= 1);
  assert.ok(stats.body.stats.inventory.lowStockCount >= 1);
  const orders = await adminAgent.get('/api/orders').expect(200);
  const target = orders.body.orders.find((o) => o.status === 'Pending');
  const updated = await adminAgent.put(`/api/orders/${target._id}/status`).send({ status: 'Shipped', trackingNumber: 'TCS123' }).expect(200);
  assert.equal(updated.body.order.status, 'Shipped');
  assert.equal(updated.body.order.statusHistory.at(-1).status, 'Shipped');
  const customers = await adminAgent.get('/api/admin/customers?search=ayesha').expect(200);
  assert.equal(customers.body.customers[0].orderCount, 1);
});

test('admin can create, edit and delete a product with fragrance notes', async () => {
  const cats = await request(app).get('/api/categories').expect(200);
  const created = await adminAgent
    .post('/api/products')
    .send({
      name: 'Test Musc',
      description: 'A test fragrance',
      fragranceFamily: 'Musk',
      categories: [cats.body.categories[0]._id],
      notes: { top: ['Aldehydes'], heart: ['Rose'], base: ['Musk'] },
      variants: [{ size: '50 ml', price: 10000, stock: 4 }],
      discountPercent: 20,
    })
    .expect(201);
  assert.equal(created.body.product.slug, 'test-musc');
  assert.equal(created.body.product.price, 8000);
  const id = created.body.product._id;
  await customerAgent.put(`/api/products/${id}`).send({ name: 'Hack' }).expect(403);
  const edited = await adminAgent.put(`/api/products/${id}`).send({ discountPercent: 0 }).expect(200);
  assert.equal(edited.body.product.price, 10000);
  await adminAgent.delete(`/api/products/${id}`).expect(200);
  await request(app).get(`/api/products/${id}`).expect(404);
});

test('wishlist toggles and reviews update product rating', async () => {
  const add = await customerAgent.post(`/api/wishlist/${eclat._id}`).expect(200);
  assert.equal(add.body.added, true);
  const list = await customerAgent.get('/api/wishlist').expect(200);
  assert.equal(list.body.products[0].slug, 'eclat');
  await customerAgent.post(`/api/products/${eclat._id}/reviews`).send({ rating: 5, title: 'Lovely', comment: 'Beautiful scent' }).expect(201);
  await customerAgent.post(`/api/products/${eclat._id}/reviews`).send({ rating: 4, comment: 'Again' }).expect(400);
  const product = await request(app).get('/api/products/eclat').expect(200);
  assert.equal(product.body.product.rating, 5);
  assert.equal(product.body.product.numReviews, 1);
});

test('password reset issues a single-use token and invalidates old sessions', async () => {
  const agent = request.agent(app);
  await agent.post('/api/auth/register').send({ name: 'Reset', email: 'reset@test.com', password: 'OldPass123' }).expect(201);
  const forgot = await request(app).post('/api/auth/forgot-password').send({ email: 'reset@test.com' }).expect(200);
  assert.ok(forgot.body.devResetToken);
  await new Promise((r) => setTimeout(r, 1100));
  await request(app).put(`/api/auth/reset-password/${forgot.body.devResetToken}`).send({ password: 'NewPass456' }).expect(200);
  await request(app).put(`/api/auth/reset-password/${forgot.body.devResetToken}`).send({ password: 'NewPass789' }).expect(400);
  await agent.get('/api/auth/me').expect(401);
  await request(app).post('/api/auth/login').send({ email: 'reset@test.com', password: 'NewPass456' }).expect(200);
});
