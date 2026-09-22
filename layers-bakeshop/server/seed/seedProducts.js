import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import User from '../models/User.js';
import { slugify } from '../utils/slugify.js';

dotenv.config();

const img = (name) => `/images/products/${name}.svg`;

const categories = ['Cakes', 'Cupcakes', 'Brownies', 'Cookies', 'Donuts', 'Desserts', 'Sundaes', 'Beverages'];

const products = [
  // Cakes
  {
    name: 'Classic Red Velvet Cake',
    description: 'Layers of velvety cocoa sponge with cream cheese frosting — our most requested celebration cake.',
    ingredients: ['Flour', 'Cocoa', 'Buttermilk', 'Cream Cheese', 'Butter', 'Sugar'],
    category: 'Cakes',
    price: 2500,
    sizes: [{ label: '6"', price: 2500 }, { label: '8"', price: 3400 }, { label: '10"', price: 4600 }],
    images: [img('cake-1')],
    stock: 18,
    rating: 4.9,
    numReviews: 214,
    isFeatured: true,
    isBestseller: true,
  },
  {
    name: 'Belgian Chocolate Fudge Cake',
    description: 'Rich, dense chocolate sponge soaked in fudge ganache, finished with a glossy chocolate glaze.',
    ingredients: ['Belgian Chocolate', 'Flour', 'Butter', 'Eggs', 'Fresh Cream'],
    category: 'Cakes',
    price: 2800,
    sizes: [{ label: '6"', price: 2800 }, { label: '8"', price: 3800 }, { label: '10"', price: 5100 }],
    images: [img('cake-2')],
    stock: 15,
    rating: 4.8,
    numReviews: 176,
    isFeatured: true,
  },
  {
    name: 'Vanilla Bean Layer Cake',
    description: 'Madagascar vanilla bean sponge with silky Swiss meringue buttercream — light, fragrant, and elegant.',
    ingredients: ['Vanilla Bean', 'Flour', 'Butter', 'Eggs', 'Sugar'],
    category: 'Cakes',
    price: 2400,
    sizes: [{ label: '6"', price: 2400 }, { label: '8"', price: 3200 }],
    images: [img('cake-3')],
    stock: 12,
    rating: 4.7,
    numReviews: 98,
    isNewArrival: true,
  },
  // Cupcakes
  {
    name: 'Salted Caramel Cupcake',
    description: 'Buttery vanilla cupcake filled with salted caramel, topped with caramel buttercream swirl.',
    ingredients: ['Flour', 'Butter', 'Caramel', 'Sea Salt', 'Sugar'],
    category: 'Cupcakes',
    price: 350,
    images: [img('cupcake-1')],
    stock: 40,
    rating: 4.8,
    numReviews: 132,
    isBestseller: true,
  },
  {
    name: 'Red Velvet Cupcake',
    description: 'A single-serve classic — cocoa sponge, cream cheese frosting, a crumble of red velvet on top.',
    ingredients: ['Flour', 'Cocoa', 'Cream Cheese', 'Buttermilk'],
    category: 'Cupcakes',
    price: 320,
    images: [img('cupcake-2')],
    stock: 45,
    rating: 4.7,
    numReviews: 121,
  },
  {
    name: 'Lotus Biscoff Cupcake',
    description: 'Biscoff-infused sponge topped with cookie-butter frosting and a crushed Lotus biscuit.',
    ingredients: ['Flour', 'Lotus Biscoff Spread', 'Butter', 'Sugar'],
    category: 'Cupcakes',
    price: 380,
    images: [img('cupcake-3')],
    stock: 30,
    rating: 4.9,
    numReviews: 87,
    isNewArrival: true,
    isLimitedEdition: true,
  },
  // Brownies
  {
    name: 'Fudge Walnut Brownie',
    description: 'Dense, fudgy brownie loaded with toasted walnuts — baked in small batches every morning.',
    ingredients: ['Dark Chocolate', 'Butter', 'Walnuts', 'Eggs', 'Flour'],
    category: 'Brownies',
    price: 400,
    images: [img('brownie-1')],
    stock: 35,
    rating: 4.8,
    numReviews: 156,
    isBestseller: true,
  },
  {
    name: 'Nutella Swirl Brownie',
    description: 'Classic fudge brownie swirled with Nutella and a molten chocolate center.',
    ingredients: ['Dark Chocolate', 'Nutella', 'Butter', 'Eggs'],
    category: 'Brownies',
    price: 450,
    images: [img('brownie-2')],
    stock: 28,
    rating: 4.9,
    numReviews: 143,
    isFeatured: true,
  },
  {
    name: 'Classic Chocolate Brownie',
    description: 'No-frills, all-fudge chocolate brownie — the one that started it all.',
    ingredients: ['Dark Chocolate', 'Butter', 'Eggs', 'Flour'],
    category: 'Brownies',
    price: 380,
    images: [img('brownie-3')],
    stock: 32,
    rating: 4.6,
    numReviews: 90,
  },
  // Cookies
  {
    name: 'Double Chocolate Chip Cookie',
    description: 'Chewy cocoa cookie loaded with two kinds of chocolate chips.',
    ingredients: ['Flour', 'Cocoa', 'Chocolate Chips', 'Butter'],
    category: 'Cookies',
    price: 250,
    images: [img('cookie-1')],
    stock: 50,
    rating: 4.7,
    numReviews: 112,
  },
  {
    name: 'Oatmeal Raisin Cookie',
    description: 'A soft, chewy classic with rolled oats, plump raisins and warm cinnamon.',
    ingredients: ['Oats', 'Raisins', 'Cinnamon', 'Butter', 'Flour'],
    category: 'Cookies',
    price: 220,
    images: [img('cookie-2')],
    stock: 40,
    rating: 4.5,
    numReviews: 64,
  },
  {
    name: 'Butter Pecan Cookie',
    description: 'Brown-butter cookie dough studded with toasted pecans.',
    ingredients: ['Butter', 'Pecans', 'Brown Sugar', 'Flour'],
    category: 'Cookies',
    price: 240,
    images: [img('cookie-3')],
    stock: 38,
    rating: 4.6,
    numReviews: 71,
    isNewArrival: true,
  },
  // Donuts
  {
    name: 'Glazed Ring Donut',
    description: 'Light, airy yeast donut finished with our signature vanilla glaze.',
    ingredients: ['Flour', 'Yeast', 'Sugar Glaze', 'Milk'],
    category: 'Donuts',
    price: 200,
    images: [img('donut-1')],
    stock: 60,
    rating: 4.6,
    numReviews: 98,
  },
  {
    name: 'Chocolate Sprinkle Donut',
    description: 'Classic ring donut dipped in chocolate glaze and finished with rainbow sprinkles.',
    ingredients: ['Flour', 'Chocolate', 'Sprinkles', 'Milk'],
    category: 'Donuts',
    price: 220,
    images: [img('donut-2')],
    stock: 55,
    rating: 4.7,
    numReviews: 105,
    isBestseller: true,
  },
  {
    name: 'Pistachio Cream Donut',
    description: 'Filled donut with silky pistachio cream and a dusting of crushed pistachio.',
    ingredients: ['Flour', 'Pistachio', 'Cream', 'Sugar'],
    category: 'Donuts',
    price: 260,
    images: [img('donut-3')],
    stock: 24,
    rating: 4.8,
    numReviews: 52,
    isLimitedEdition: true,
  },
  // Desserts
  {
    name: 'Tiramisu Cup',
    description: 'Espresso-soaked ladyfingers layered with mascarpone cream and cocoa dust, in a single-serve cup.',
    ingredients: ['Mascarpone', 'Espresso', 'Ladyfingers', 'Cocoa'],
    category: 'Desserts',
    price: 550,
    images: [img('dessert-1')],
    stock: 20,
    rating: 4.9,
    numReviews: 88,
    isFeatured: true,
  },
  {
    name: 'Chocolate Mousse',
    description: 'Airy dark chocolate mousse, set in a glass, topped with chocolate shavings.',
    ingredients: ['Dark Chocolate', 'Fresh Cream', 'Eggs'],
    category: 'Desserts',
    price: 500,
    images: [img('dessert-2')],
    stock: 22,
    rating: 4.7,
    numReviews: 66,
  },
  {
    name: 'Baklava Cheesecake Jar',
    description: 'No-bake cheesecake layered with honeyed baklava crumble and pistachio.',
    ingredients: ['Cream Cheese', 'Phyllo', 'Honey', 'Pistachio'],
    category: 'Desserts',
    price: 600,
    images: [img('dessert-3')],
    stock: 16,
    rating: 4.8,
    numReviews: 41,
    isNewArrival: true,
    isLimitedEdition: true,
  },
  // Sundaes
  {
    name: 'Classic Hot Fudge Sundae',
    description: 'Vanilla bean ice cream, warm fudge sauce, whipped cream and a cherry on top.',
    ingredients: ['Vanilla Ice Cream', 'Chocolate Fudge', 'Whipped Cream', 'Cherry'],
    category: 'Sundaes',
    price: 480,
    images: [img('sundae-1')],
    stock: 25,
    rating: 4.8,
    numReviews: 74,
  },
  {
    name: 'Caramel Pecan Sundae',
    description: 'Layers of caramel ice cream, toasted pecans and salted caramel drizzle.',
    ingredients: ['Caramel Ice Cream', 'Pecans', 'Caramel Sauce'],
    category: 'Sundaes',
    price: 520,
    images: [img('sundae-2')],
    stock: 20,
    rating: 4.7,
    numReviews: 55,
    isBestseller: true,
  },
  {
    name: 'Berry Bliss Sundae',
    description: 'Strawberry and vanilla ice cream with fresh berry compote and whipped cream.',
    ingredients: ['Strawberry Ice Cream', 'Vanilla Ice Cream', 'Berry Compote'],
    category: 'Sundaes',
    price: 500,
    images: [img('sundae-3')],
    stock: 18,
    rating: 4.6,
    numReviews: 39,
  },
  // Beverages
  {
    name: 'Iced Caramel Latte',
    description: 'Double espresso, cold milk and house-made caramel syrup over ice.',
    ingredients: ['Espresso', 'Milk', 'Caramel Syrup'],
    category: 'Beverages',
    price: 450,
    images: [img('beverage-1')],
    stock: 50,
    rating: 4.6,
    numReviews: 60,
  },
  {
    name: 'Belgian Hot Chocolate',
    description: 'Rich, velvety hot chocolate made with real Belgian chocolate and steamed milk.',
    ingredients: ['Belgian Chocolate', 'Milk', 'Cream'],
    category: 'Beverages',
    price: 400,
    images: [img('beverage-2')],
    stock: 45,
    rating: 4.8,
    numReviews: 77,
    isFeatured: true,
  },
  {
    name: 'Classic Cold Brew',
    description: 'Slow-steeped cold brew coffee, smooth and naturally sweet, served over ice.',
    ingredients: ['Coffee', 'Filtered Water'],
    category: 'Beverages',
    price: 380,
    images: [img('beverage-3')],
    stock: 48,
    rating: 4.5,
    numReviews: 48,
  },
];

async function seed() {
  await connectDB();

  const destroy = process.argv.includes('--destroy');

  if (destroy) {
    await Product.deleteMany();
    await Category.deleteMany();
    console.log('Destroyed all products and categories.');
    await mongoose.connection.close();
    return;
  }

  await Product.deleteMany();
  await Category.deleteMany();

  await Category.insertMany(categories.map((name) => ({ name, slug: slugify(name) })));

  const withSlugs = products.map((p) => ({ ...p, slug: slugify(p.name) }));
  await Product.insertMany(withSlugs);
  console.log(`Seeded ${withSlugs.length} products across ${categories.length} categories.`);

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@layersbakeshop.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@12345';

  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    await User.create({
      name: 'Layers Admin',
      email: adminEmail,
      phone: '+92 300 0000000',
      password: adminPassword,
      role: 'admin',
    });
    console.log(`Created admin account: ${adminEmail} / ${adminPassword}`);
  } else {
    console.log(`Admin account already exists: ${adminEmail}`);
  }

  await mongoose.connection.close();
}

seed().catch((error) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});
