const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Product = require('../models/Product');
const User = require('../models/User');
const slugify = require('../utils/slugify');

const img = (id) => `/uploads/products/${id}.svg`;

const products = [
  {
    name: 'Solitaire Promise Ring',
    image: 'i1',
    category: 'rings',
    material: '18k Gold Vermeil, Cubic Zirconia',
    price: 8900,
    compareAtPrice: 10900,
    description:
      'A timeless solitaire crafted for life\'s most meaningful promises. Finished in warm 18k gold vermeil with a brilliant-cut centre stone that catches the light from every angle.',
    sizes: ['5', '6', '7', '8', '9'],
    stock: 14,
    featured: true,
    bestseller: true,
    isNewArrival: false,
  },
  {
    name: 'Halo Radiance Ring',
    image: 'i2',
    category: 'rings',
    material: '18k Gold Vermeil, Halo Set Stones',
    price: 10500,
    description:
      'A dazzling halo of hand-set stones surrounds a luminous centre gem, framed in a delicate champagne gold band for maximum sparkle.',
    sizes: ['5', '6', '7', '8', '9'],
    stock: 9,
    featured: true,
    bestseller: false,
    isNewArrival: true,
  },
  {
    name: 'Champagne Band Ring',
    image: 'i3',
    category: 'rings',
    material: 'Sterling Silver, Champagne Gold Plating',
    price: 5400,
    description:
      'A refined everyday band with a soft champagne gold finish - minimal, stackable and endlessly versatile.',
    sizes: ['5', '6', '7', '8', '9', '10'],
    stock: 22,
    featured: false,
    bestseller: true,
    isNewArrival: false,
  },
  {
    name: 'Vintage Halo Ring',
    image: 'i4',
    category: 'rings',
    material: '18k Gold Vermeil, Vintage Milgrain Detail',
    price: 11900,
    description:
      'Inspired by heirloom jewellery, this vintage-style halo ring features delicate milgrain edging and a warm antique gold tone.',
    sizes: ['6', '7', '8'],
    stock: 6,
    featured: false,
    bestseller: false,
    isNewArrival: true,
  },
  {
    name: 'Eternity Stack Ring',
    image: 'i5',
    category: 'rings',
    material: '18k Gold Vermeil',
    price: 6200,
    description:
      'A slender eternity band designed to be stacked and layered, symbolising continuity and everyday elegance.',
    sizes: ['5', '6', '7', '8', '9'],
    stock: 18,
    featured: false,
    bestseller: false,
    isNewArrival: false,
  },
  {
    name: 'Pendant Grace Necklace',
    image: 'i6',
    category: 'necklaces',
    material: '18k Gold Vermeil, Freshwater Pearl Accent',
    price: 9800,
    description:
      'A graceful pendant necklace featuring a single luminous stone suspended from a fine gold chain - effortless elegance for every day.',
    sizes: ['16"', '18"'],
    stock: 15,
    featured: true,
    bestseller: true,
    isNewArrival: false,
  },
  {
    name: 'Champagne Choker',
    image: 'i7',
    category: 'necklaces',
    material: 'Sterling Silver, Champagne Gold Plating',
    price: 7200,
    description:
      'A modern choker that sits gracefully at the collarbone, finished with a warm champagne gold glow.',
    sizes: ['14"', '15"'],
    stock: 11,
    featured: false,
    bestseller: false,
    isNewArrival: true,
  },
  {
    name: 'Layered Gold Necklace',
    image: 'i8',
    category: 'necklaces',
    material: '18k Gold Vermeil',
    price: 12400,
    description:
      'Two delicate chains layered to perfection, designed to be worn together or separately for a curated look.',
    sizes: ['16"', '18"', '20"'],
    stock: 8,
    featured: true,
    bestseller: false,
    isNewArrival: false,
  },
  {
    name: 'Heirloom Locket Necklace',
    image: 'i9',
    category: 'necklaces',
    material: '18k Gold Vermeil',
    price: 13900,
    description:
      'A modern take on the classic locket, crafted to hold treasured memories close to the heart.',
    sizes: ['18"'],
    stock: 5,
    featured: false,
    bestseller: false,
    isNewArrival: true,
  },
  {
    name: 'Delicate Chain Choker',
    image: 'i10',
    category: 'necklaces',
    material: 'Sterling Silver, Gold Plating',
    price: 5600,
    description:
      'An understated chain choker perfect for layering or wearing alone for a clean, elegant look.',
    sizes: ['13"', '14"'],
    stock: 20,
    featured: false,
    bestseller: true,
    isNewArrival: false,
  },
  {
    name: 'Teardrop Stud Earrings',
    image: 'i11',
    category: 'earrings',
    material: '18k Gold Vermeil, Cubic Zirconia',
    price: 4800,
    description:
      'Graceful teardrop studs that add a subtle sparkle to any occasion, from boardroom to black tie.',
    sizes: [],
    stock: 26,
    featured: true,
    bestseller: true,
    isNewArrival: false,
  },
  {
    name: 'Golden Hoop Earrings',
    image: 'i12',
    category: 'earrings',
    material: '18k Gold Vermeil',
    price: 6100,
    description:
      'Statement hoops with a polished champagne gold finish - lightweight, comfortable and endlessly chic.',
    sizes: [],
    stock: 17,
    featured: false,
    bestseller: true,
    isNewArrival: false,
  },
  {
    name: 'Classic Drop Earrings',
    image: 'i13',
    category: 'earrings',
    material: 'Sterling Silver, Gold Plating',
    price: 5300,
    description:
      'Elegant drop earrings that catch the light with every movement - a versatile addition to your everyday edit.',
    sizes: [],
    stock: 13,
    featured: false,
    bestseller: false,
    isNewArrival: true,
  },
  {
    name: 'Slim Hoop Earrings',
    image: 'i14',
    category: 'earrings',
    material: '18k Gold Vermeil',
    price: 3900,
    description:
      'Fine, featherlight hoops designed for everyday wear, offering a subtle golden glow from dawn to dusk.',
    sizes: [],
    stock: 24,
    featured: false,
    bestseller: false,
    isNewArrival: false,
  },
  {
    name: 'Chandelier Earrings',
    image: 'i15',
    category: 'earrings',
    material: '18k Gold Vermeil, Crystal Accents',
    price: 8700,
    description:
      'Statement chandelier earrings crafted for celebration - cascading detail with a refined, luminous finish.',
    sizes: [],
    stock: 7,
    featured: true,
    bestseller: false,
    isNewArrival: true,
  },
  {
    name: 'Tennis Sparkle Bracelet',
    image: 'i16',
    category: 'bracelets',
    material: '18k Gold Vermeil, Cubic Zirconia',
    price: 11200,
    description:
      'A continuous line of brilliant stones set in warm gold - the ultimate everyday sparkle for your wrist.',
    sizes: ['S', 'M', 'L'],
    stock: 10,
    featured: true,
    bestseller: true,
    isNewArrival: false,
  },
  {
    name: 'Champagne Bangle',
    image: 'i17',
    category: 'bracelets',
    material: '18k Gold Vermeil',
    price: 7400,
    description:
      'A sculptural bangle with a soft champagne gold sheen, designed to be worn solo or stacked for a bolder look.',
    sizes: ['S', 'M', 'L'],
    stock: 16,
    featured: false,
    bestseller: false,
    isNewArrival: false,
  },
  {
    name: 'Charm Chain Bracelet',
    image: 'i18',
    category: 'bracelets',
    material: 'Sterling Silver, Gold Plating',
    price: 4600,
    description:
      'A delicate chain bracelet adorned with dainty charms, designed to be personal and playful.',
    sizes: ['S', 'M'],
    stock: 19,
    featured: false,
    bestseller: false,
    isNewArrival: true,
  },
  {
    name: 'Minimal Cuff Bangle',
    image: 'i19',
    category: 'bracelets',
    material: '18k Gold Vermeil',
    price: 6800,
    description:
      'A sleek open cuff with clean lines, effortlessly elegant for both day and evening wear.',
    sizes: ['One Size'],
    stock: 12,
    featured: false,
    bestseller: true,
    isNewArrival: false,
  },
  {
    name: 'Layered Bead Bracelet',
    image: 'i20',
    category: 'bracelets',
    material: '18k Gold Vermeil, Freshwater Pearl',
    price: 5900,
    description:
      'Delicate gold beads and freshwater pearls come together in this soft, romantic layering bracelet.',
    sizes: ['S', 'M', 'L'],
    stock: 15,
    featured: false,
    bestseller: false,
    isNewArrival: false,
  },
];

const seed = async () => {
  await connectDB();

  const destroy = process.argv.includes('--destroy');

  if (destroy) {
    await Product.deleteMany();
    console.log('All products removed.');
    await mongoose.connection.close();
    process.exit(0);
  }

  await Product.deleteMany();

  const docs = products.map((p) => ({
    name: p.name,
    slug: slugify(p.name),
    description: p.description,
    price: p.price,
    compareAtPrice: p.compareAtPrice || null,
    category: p.category,
    material: p.material,
    images: [img(p.image)],
    sizes: p.sizes,
    stock: p.stock,
    featured: p.featured,
    bestseller: p.bestseller,
    isNewArrival: p.isNewArrival,
  }));

  await Product.insertMany(docs);
  console.log(`Seeded ${docs.length} products.`);

  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@elegantjewellery.com').toLowerCase();
  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    await User.create({
      name: process.env.ADMIN_NAME || 'Elegant Admin',
      email: adminEmail,
      password: process.env.ADMIN_PASSWORD || 'ChangeMe123!',
      role: 'admin',
    });
    console.log(`Admin account created: ${adminEmail}`);
  } else if (existingAdmin.role !== 'admin') {
    existingAdmin.role = 'admin';
    await existingAdmin.save();
    console.log(`Existing user promoted to admin: ${adminEmail}`);
  } else {
    console.log(`Admin account already exists: ${adminEmail}`);
  }

  await mongoose.connection.close();
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
