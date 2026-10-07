// One-time recovery script: copies documents out of the old shared "test"
// database (where both Elegant Jewellery and NB Classic Scents used to land
// by accident) into their own separate databases - elegant_jewellery and
// nb_classic_scents - based on each document's actual shape. Nothing is ever
// deleted from "test"; it stays untouched as a backup.
//
// Usage (run from server/ with dependencies already installed):
//   MONGO_URI="<your real Atlas connection string>" node scripts/splitSharedDatabase.js --dry-run
//   MONGO_URI="<your real Atlas connection string>" node scripts/splitSharedDatabase.js
//
// Always run with --dry-run first and read the output before running for
// real. Users are intentionally never auto-split - the script only lists
// their emails so you can move the right ones by hand in Atlas's
// Browse Collections (too risky to guess which login belongs to which site).

const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI;
if (!uri) {
  console.error('Set MONGO_URI to your real Atlas connection string first, e.g.:');
  console.error('  MONGO_URI="mongodb+srv://..." node scripts/splitSharedDatabase.js --dry-run');
  process.exit(1);
}

const dryRun = process.argv.includes('--dry-run');

const JEWELLERY_CATEGORIES = ['earrings', 'rings', 'necklaces', 'bracelets'];

function isJewelleryProduct(doc) {
  return JEWELLERY_CATEGORIES.includes(doc.category) || typeof doc.material === 'string';
}

function isPerfumeProduct(doc) {
  return Boolean(doc.gender || doc.fragranceFamily || doc.collectionName) ||
    (Array.isArray(doc.sizes) && doc.sizes.length > 0 && typeof doc.sizes[0] === 'object');
}

function isJewelleryOrder(doc) {
  return Array.isArray(doc.orderItems) && doc.orderItems.some((item) => item.quantity !== undefined);
}

function isPerfumeOrder(doc) {
  return Array.isArray(doc.orderItems) && doc.orderItems.some((item) => item.qty !== undefined);
}

async function main() {
  const client = new MongoClient(uri);
  await client.connect();

  const source = client.db('test');
  const jewelleryDb = client.db('elegant_jewellery');
  const perfumeDb = client.db('nb_classic_scents');

  console.log(dryRun ? '--- DRY RUN: nothing will be written ---' : '--- LIVE RUN: copying documents ---');

  const products = await source.collection('products').find({}).toArray();
  const jewelleryProducts = products.filter(isJewelleryProduct);
  const perfumeProducts = products.filter(isPerfumeProduct);
  const unclassifiedProducts = products.filter((d) => !isJewelleryProduct(d) && !isPerfumeProduct(d));

  console.log(`\nProducts in "test": ${products.length}`);
  console.log(`  -> jewellery:     ${jewelleryProducts.length}`);
  console.log(`  -> perfume:       ${perfumeProducts.length}`);
  console.log(`  -> unclassified:  ${unclassifiedProducts.length}`);
  if (unclassifiedProducts.length) {
    console.log('  Unclassified samples:', unclassifiedProducts.slice(0, 5).map((d) => ({ _id: d._id, name: d.name })));
  }

  const orders = await source.collection('orders').find({}).toArray();
  const jewelleryOrders = orders.filter(isJewelleryOrder);
  const perfumeOrders = orders.filter(isPerfumeOrder);
  const unclassifiedOrders = orders.filter((d) => !isJewelleryOrder(d) && !isPerfumeOrder(d));

  console.log(`\nOrders in "test": ${orders.length}`);
  console.log(`  -> jewellery:     ${jewelleryOrders.length}`);
  console.log(`  -> perfume:       ${perfumeOrders.length}`);
  console.log(`  -> unclassified:  ${unclassifiedOrders.length}`);

  const users = await source.collection('users').find({}).toArray();
  console.log(`\nUsers in "test": ${users.length} (never auto-split - move these by hand)`);
  users.forEach((u) => console.log(`  - ${u.email}  (role: ${u.role})`));

  if (dryRun) {
    console.log('\nDry run complete - nothing was written.');
    console.log('If the product/order counts above look right, re-run without --dry-run.');
    await client.close();
    return;
  }

  const insert = async (db, collection, docs, label) => {
    if (!docs.length) return;
    try {
      await db.collection(collection).insertMany(docs, { ordered: false });
      console.log(`Copied ${docs.length} ${label} into ${db.databaseName}.${collection}`);
    } catch (err) {
      console.error(`Error copying ${label} (duplicates from a previous run are safe to ignore):`, err.message);
    }
  };

  await insert(jewelleryDb, 'products', jewelleryProducts, 'jewellery products');
  await insert(perfumeDb, 'products', perfumeProducts, 'perfume products');
  await insert(jewelleryDb, 'orders', jewelleryOrders, 'jewellery orders');
  await insert(perfumeDb, 'orders', perfumeOrders, 'perfume orders');

  console.log('\nDone. The original "test" database was not modified or deleted.');
  console.log('Move users by hand in Atlas Browse Collections using the emails listed above.');

  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
