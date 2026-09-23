/* eslint-disable no-console */
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Category = require('../models/Category');
const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');
const Review = require('../models/Review');
const Coupon = require('../models/Coupon');
const Wishlist = require('../models/Wishlist');
const Cart = require('../models/Cart');
const { categories, products, coupons } = require('./catalogue');

const args = process.argv.slice(2);
const DESTROY = args.includes('--destroy');
const DEMO = args.includes('--demo');

const seedCatalogue = async () => {
  await Promise.all([Category.deleteMany({}), Product.deleteMany({}), Review.deleteMany({}), Coupon.deleteMany({})]);
  const createdCats = await Category.insertMany(categories);
  const catId = Object.fromEntries(createdCats.map((c) => [c.slug, c._id]));

  const created = [];
  for (const { cats, ...p } of products) {
    // eslint-disable-next-line no-await-in-loop
    created.push(await Product.create({ ...p, categories: cats.map((s) => catId[s]) }));
  }
  await Coupon.insertMany(coupons);
  console.log(`Seeded ${createdCats.length} categories, ${created.length} fragrances, ${coupons.length} discount codes.`);
  return created;
};

const seedAdmin = async () => {
  const { ADMIN_NAME = 'NB Admin', ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.warn('ADMIN_EMAIL / ADMIN_PASSWORD not set - skipping admin account.');
    return;
  }
  const existing = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });
  if (existing) {
    existing.role = 'admin';
    existing.isActive = true;
    await existing.save();
    console.log(`Admin account ready: ${ADMIN_EMAIL} (existing account promoted)`);
  } else {
    await User.create({ name: ADMIN_NAME, email: ADMIN_EMAIL, password: ADMIN_PASSWORD, role: 'admin' });
    console.log(`Admin account created: ${ADMIN_EMAIL}`);
  }
};

// Optional sample customers, orders and reviews so the analytics dashboard has data to show.
const seedDemo = async (catalogue) => {
  const demoEmails = ['sara.ahmed@example.com', 'omar.khan@example.com', 'hania.malik@example.com', 'bilal.raza@example.com', 'zara.siddiqui@example.com'];
  const names = ['Sara Ahmed', 'Omar Khan', 'Hania Malik', 'Bilal Raza', 'Zara Siddiqui'];
  const cities = ['Lahore', 'Karachi', 'Islamabad', 'Lahore', 'Karachi'];
  await User.deleteMany({ email: { $in: demoEmails } });
  const customers = [];
  for (let i = 0; i < demoEmails.length; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    customers.push(
      await User.create({
        name: names[i],
        email: demoEmails[i],
        password: 'DemoPass123',
        phone: `+92 300 55${String(10000 + i * 137).slice(-5)}`,
        addresses: [{ label: 'Home', fullName: names[i], phone: '+92 300 5550000', address: `${12 + i} Gulberg Avenue`, city: cities[i], postalCode: '54000', country: 'Pakistan', isDefault: true }],
      })
    );
  }
  await Order.deleteMany({ 'customerInfo.email': { $in: demoEmails } });

  const statuses = ['Delivered', 'Delivered', 'Shipped', 'Processing', 'Confirmed', 'Pending', 'Delivered', 'Cancelled'];
  const methods = ['Cash on Delivery', 'Card Payment', 'Online Payment'];
  let n = 0;
  for (let day = 28; day >= 0; day -= 1) {
    const perDay = (day * 7) % 3;
    for (let k = 0; k < perDay; k += 1) {
      n += 1;
      const customer = customers[n % customers.length];
      const product = catalogue[(n * 5) % catalogue.length];
      const variant = product.variants[n % product.variants.length];
      const quantity = 1 + (n % 2);
      const price = Product.applyDiscount(variant.price, product.discountPercent);
      const status = statuses[n % statuses.length];
      const method = methods[n % methods.length];
      const itemsPrice = price * quantity;
      const shippingPrice = itemsPrice >= 20000 ? 0 : 450;
      const createdAt = new Date(Date.now() - day * 86400000 - k * 3600000);
      // eslint-disable-next-line no-await-in-loop
      await Order.create({
        user: customer._id,
        orderItems: [{ product: product._id, variantId: variant._id, name: product.name, image: product.images[0], size: variant.size, price, quantity }],
        customerInfo: { name: customer.name, email: customer.email, phone: customer.phone },
        shippingAddress: { address: customer.addresses[0].address, city: customer.addresses[0].city, postalCode: '54000', country: 'Pakistan' },
        paymentMethod: method,
        paymentStatus: status === 'Cancelled' ? 'Refunded' : method === 'Card Payment' || status === 'Delivered' ? 'Paid' : method === 'Online Payment' ? 'Awaiting Transfer' : 'Pending',
        paymentDetails: method === 'Card Payment' ? { brand: 'Visa', last4: '4242', provider: 'Card', reference: `AUTH-DEMO${n}` } : {},
        itemsPrice,
        shippingPrice,
        totalPrice: itemsPrice + shippingPrice,
        status,
        statusHistory: [{ status: 'Pending', note: 'Order placed', at: createdAt }, ...(status !== 'Pending' ? [{ status, note: '', at: createdAt }] : [])],
        createdAt,
        updatedAt: createdAt,
      });
      if (status !== 'Cancelled') {
        // eslint-disable-next-line no-await-in-loop
        await Product.updateOne({ _id: product._id }, { $inc: { soldCount: quantity } });
      }
    }
  }

  const comments = [
    ['Truly a signature', 'I get stopped every time I wear it. Elegant, never loud, and it lasts all day on me.', 5],
    ['Beautifully made', 'The bottle is heavy and gorgeous and the scent is even better. It feels like a far more expensive house.', 5],
    ['My new everyday scent', 'Soft, refined and very long-lasting. The dry-down is my favourite part.', 4],
    ['Worth every rupee', 'Packaging, delivery and the fragrance itself were all perfect. Will be back for the 100 ml.', 5],
  ];
  for (const product of catalogue.slice(0, 8)) {
    const count = 2 + (product.name.length % 3);
    for (let i = 0; i < count; i += 1) {
      const [title, comment, rating] = comments[(i + product.name.length) % comments.length];
      // eslint-disable-next-line no-await-in-loop
      await Review.create({ product: product._id, user: customers[i]._id, name: customers[i].name, rating, title, comment, verifiedPurchase: i % 2 === 0 });
    }
    // eslint-disable-next-line no-await-in-loop
    await Review.recalculate(product._id);
  }
  console.log(`Seeded demo data: ${customers.length} customers (password DemoPass123), ${n} orders, sample reviews.`);
};

const run = async () => {
  await connectDB();
  try {
    if (DESTROY) {
      await Promise.all([Category, Product, Review, Coupon, Order, Wishlist, Cart].map((m) => m.deleteMany({})));
      console.log('Catalogue, orders, reviews, carts and wishlists removed (user accounts kept).');
    } else {
      const catalogue = await seedCatalogue();
      await seedAdmin();
      if (DEMO) await seedDemo(catalogue);
    }
  } catch (err) {
    console.error(`Seeding failed: ${err.message}`);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

run();
