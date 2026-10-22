import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

import { Product } from '../features/products/product.model.js';
import { User } from '../features/auth/user.model.js';
import { CustomRequest } from '../features/custom-studio/customRequest.model.js';
import { Order } from '../features/orders/order.model.js';
import { Category } from '../features/categories/category.model.js';
import { Coupon } from '../features/coupons/coupon.model.js';
import { Setting } from '../features/settings/setting.model.js';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const MOCK_CATEGORIES_SEED = [
  {
    name: 'Men',
    slug: 'men',
    subcategories: ['Shirts', 'Kurtas', 'Trousers', 'Blazers', 'Formal Wear'],
    description: "Men's Sartorial and Archival Luxury Garments",
    isActive: true,
  },
  {
    name: 'Women',
    slug: 'women',
    subcategories: ['Dresses', 'Kurtis', 'Sarees', 'Shawls', 'Couture Gowns'],
    description: "Women's Couture, Pret-a-Porter and Bridal Ensembles",
    isActive: true,
  },
  {
    name: 'Kids',
    slug: 'kids',
    subcategories: ['Boys Festive', 'Girls Festive', 'Mulmul Sets', 'Ceremonial'],
    description: 'Miniature Archive of Heirloom Childrenswear',
    isActive: true,
  },
];

const MOCK_PRODUCTS_SEED = [
  // ================= MEN'S COLLECTION =================
  {
    slug: 'oxford-shirt',
    name: 'Archival Crisp Cotton Oxford Shirt',
    subtitle: '140gsm Giza 87 • Mother of Pearl Hardware',
    category: 'men',
    department: "Men's Sartorial",
    price: 6500,
    originalPrice: 7800,
    isSale: false,
    badge: 'Bespoke Option',
    rating: 4.9,
    reviewCount: 38,
    colors: [
      { name: 'Pure White', hex: '#FFFFFF', image: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1000&q=80' },
      { name: 'Midnight Navy', hex: '#1E293B', image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1000&q=80' },
      { name: 'Sky Mist', hex: '#CBD5E1', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1000&q=80' }
    ],
    sizes: [
      { size: '38 (S)', stockCount: 8, inStock: true },
      { size: '40 (M)', stockCount: 12, inStock: true },
      { size: '42 (L)', stockCount: 10, inStock: true },
      { size: '44 (XL)', stockCount: 4, inStock: true }
    ],
    inStock: true,
    stockCount: 34,
    fabric: '100% Egyptian Giza 87 Cotton',
    silhouette: 'Relaxed Tailored Fit',
    description: 'Woven on vintage shuttle looms from ultra-long-staple Egyptian cotton. Features Australian mother-of-pearl buttons, single-needle French seams, and a floating interlining collar.',
    careInstructions: 'Dry clean recommended or machine wash cold on delicate cycle. Press with warm steam while slightly damp.',
    images: [
      'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1000&q=80'
    ]
  },
  {
    slug: 'double-breasted-blazer',
    name: 'Unstructured Fluted Linen Blazer',
    subtitle: '380gsm Irish Flax • Floating Canvas Construction',
    category: 'men',
    department: "Men's Sartorial",
    price: 24500,
    originalPrice: 28000,
    isSale: false,
    badge: 'Limited Run',
    rating: 4.8,
    reviewCount: 22,
    colors: [
      { name: 'Raw Ecru', hex: '#EDE8DF', image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=80' },
      { name: 'Deep Olive', hex: '#4D5543', image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1000&q=80' }
    ],
    sizes: [
      { size: '38 Regular', stockCount: 3, inStock: true },
      { size: '40 Regular', stockCount: 6, inStock: true },
      { size: '42 Regular', stockCount: 4, inStock: true }
    ],
    inStock: true,
    stockCount: 13,
    fabric: '100% Pure Heavy Irish Linen',
    silhouette: 'Neapolitan Soft Shoulder',
    description: 'Constructed completely unlined with hand-padded floating horsehair canvas lapels. Drapes with relaxed European nonchalance while maintaining a razor-sharp silhouette.',
    careInstructions: 'Professional eco dry clean only. Steam gently.',
    images: [
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1000&q=80'
    ]
  },
  {
    slug: 'japanese-selvedge-denim',
    name: '14oz Kurabo Mill Raw Selvedge Trouser',
    subtitle: 'Natural Plant Indigo • Chainstitched Hem',
    category: 'men',
    department: "Men's Sartorial",
    price: 9200,
    originalPrice: 11000,
    isSale: false,
    badge: 'Kurabo Mill',
    rating: 4.8,
    reviewCount: 52,
    colors: [
      { name: 'Deep Indigo', hex: '#16233B', image: 'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=1000&q=80' }
    ],
    sizes: [
      { size: '30/32', stockCount: 3, inStock: true },
      { size: '32/32', stockCount: 6, inStock: true },
      { size: '34/32', stockCount: 4, inStock: true }
    ],
    inStock: true,
    stockCount: 13,
    fabric: '100% Cotton Shuttle-Loomed Japanese Denim',
    silhouette: 'Medium-Rise Tapered Leg',
    description: 'Woven slowly on antique Toyoda looms in Kojima, Okayama. Rigid unwashed raw denim engineered to mold and fade uniquely with the natural patina of the owner.',
    careInstructions: 'Wear for 6 months prior to first soak. Hand soak inside out in cold water, line dry.',
    images: [
      'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=1000&q=80'
    ]
  },
  {
    slug: 'raw-silk-mens-kurta',
    name: 'Hand-Spun Raw Silk Festive Kurta',
    subtitle: '100% Organic Raw Silk • Mother-of-Pearl Fastenings',
    category: 'men',
    department: "Men's Sartorial",
    price: 11500,
    originalPrice: 13500,
    isSale: false,
    badge: 'Festive Classic',
    rating: 4.9,
    reviewCount: 18,
    colors: [
      { name: 'Almond Beige', hex: '#D2B48C', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1000&q=80' }
    ],
    sizes: [
      { size: 'S (38)', stockCount: 5, inStock: true },
      { size: 'M (40)', stockCount: 8, inStock: true },
      { size: 'L (42)', stockCount: 6, inStock: true }
    ],
    inStock: true,
    stockCount: 19,
    fabric: 'Pure Hand-Loomed Raw Silk',
    silhouette: 'Traditional Straight Cut with Side Slits',
    description: 'Exquisite raw silk crafted for celebratory gatherings. Retains natural luster and crisp breathable structure.',
    careInstructions: 'Dry clean recommended.',
    images: [
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1000&q=80'
    ]
  },

  // ================= WOMEN'S COLLECTION =================
  {
    slug: 'embroidered-lawn-gown',
    name: 'Resham Embroidered Silk-Lawn Gown',
    subtitle: '80s Combed Lawn Yarn • Hand-Loomed Resham',
    category: 'women',
    department: "Women's Couture",
    price: 18500,
    originalPrice: 21000,
    isSale: false,
    badge: 'New Arrival',
    rating: 5.0,
    reviewCount: 64,
    colors: [
      { name: 'Sage Olive', hex: '#7A8A70', image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=1000&q=80' },
      { name: 'Champagne Ochre', hex: '#E3D7BF', image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1000&q=80' }
    ],
    sizes: [
      { size: 'XS (UK 6)', stockCount: 2, inStock: true },
      { size: 'S (UK 8)', stockCount: 4, inStock: true },
      { size: 'M (UK 10)', stockCount: 5, inStock: true },
      { size: 'L (UK 12)', stockCount: 3, inStock: true }
    ],
    inStock: true,
    stockCount: 14,
    fabric: 'Pure Silk Blend Combed Lawn',
    silhouette: 'Fluid Architectural Anarkali',
    description: 'An ethereal collision of antique South Asian needlework and contemporary architectural draping. Finished with delicate hand-knotted tassel chords and raw silk inner hems.',
    careInstructions: 'Specialist dry clean only. Protect intricate embroidery from contact with sharp jewelry.',
    images: [
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1000&q=80'
    ]
  },
  {
    slug: 'cashmere-evening-wrap',
    name: 'Hand-Woven Pashmina Cashmere Shawl',
    subtitle: 'Grade A Changthangi Wool • Needlework Border',
    category: 'women',
    department: "Women's Couture",
    price: 32000,
    originalPrice: 38000,
    isSale: true,
    badge: 'Rare Artifact',
    rating: 5.0,
    reviewCount: 19,
    colors: [
      { name: 'Nocturne Black', hex: '#111215', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=80' }
    ],
    sizes: [
      { size: 'One Size (100cm x 200cm)', stockCount: 5, inStock: true }
    ],
    inStock: true,
    stockCount: 5,
    fabric: '100% Authentic Ladakhi Pashmina Cashmere',
    silhouette: 'Generous Fluid Wrap',
    description: 'Each piece takes three months of artisanal needle embroidery in the Kashmir valley. Incomparably soft, gossamer-weight warmth with heritage floral needlepoint borders.',
    careInstructions: 'Professional cashmere dry clean only. Store in breathable muslin bag.',
    images: [
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=80'
    ]
  },
  {
    slug: 'chikankari-angrakha',
    name: 'Heritage Lucknowi Chikankari Angrakha',
    subtitle: 'Pure Georgette • Hand-Embroidered Murri & Phanda',
    category: 'women',
    department: "Women's Couture",
    price: 21500,
    originalPrice: 25000,
    isSale: false,
    badge: 'Artisanal Gem',
    rating: 4.9,
    reviewCount: 29,
    colors: [
      { name: 'Ivory Dusk', hex: '#FAF9F6', image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1000&q=80' }
    ],
    sizes: [
      { size: 'S', stockCount: 4, inStock: true },
      { size: 'M', stockCount: 6, inStock: true },
      { size: 'L', stockCount: 3, inStock: true }
    ],
    inStock: true,
    stockCount: 13,
    fabric: 'Pure Silk Georgette with Cotton Embroidery',
    silhouette: 'Cross-Bodice Angrakha Drape',
    description: 'Master artisans hand-stitch traditional Lucknowi shadow-work with 32 distinct heritage stitch techniques.',
    careInstructions: 'Dry clean only.',
    images: [
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1000&q=80'
    ]
  },

  // ================= KIDS' COLLECTION =================
  {
    slug: 'boys-festive-kurta',
    name: 'Heirloom Mulmul Cotton Kurta Set',
    subtitle: 'Hand-Rolled Hem • Brushed Brass Buttons',
    category: 'kids',
    department: 'Miniature Archive',
    price: 4800,
    originalPrice: 5500,
    isSale: false,
    badge: 'Occasion',
    rating: 4.9,
    reviewCount: 41,
    colors: [
      { name: 'Ivory Almond', hex: '#F4EDE4', image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=1000&q=80' },
      { name: 'Pale Sage', hex: '#A3B19B', image: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=1000&q=80' }
    ],
    sizes: [
      { size: '3-4 Yrs', stockCount: 4, inStock: true },
      { size: '5-6 Yrs', stockCount: 5, inStock: true },
      { size: '7-8 Yrs', stockCount: 3, inStock: true },
      { size: '9-10 Yrs', stockCount: 6, inStock: true }
    ],
    inStock: true,
    stockCount: 18,
    fabric: '100% Organic Hand-Woven Mulmul Cotton',
    silhouette: 'Comfort Straight Fit with Side Slits',
    description: 'Featherlight heirloom ceremonial wear designed for unconstrained movement. Hand-tailored in our atelier with seamless inner linings to prevent skin irritation.',
    careInstructions: 'Hand wash cold with gentle organic detergent. Line dry in shade.',
    images: [
      'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=1000&q=80'
    ]
  },
  {
    slug: 'girls-embroidered-lehenga',
    name: 'Miniature Zardozi Silk Lehenga Choli',
    subtitle: 'Hand-Crafted Resham • Pure Organza Dupatta',
    category: 'kids',
    department: 'Miniature Archive',
    price: 8500,
    originalPrice: 10500,
    isSale: false,
    badge: 'Festive Delight',
    rating: 5.0,
    reviewCount: 14,
    colors: [
      { name: 'Peony Blush', hex: '#E8B4B8', image: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=1000&q=80' }
    ],
    sizes: [
      { size: '4-5 Yrs', stockCount: 3, inStock: true },
      { size: '6-7 Yrs', stockCount: 4, inStock: true },
      { size: '8-9 Yrs', stockCount: 5, inStock: true }
    ],
    inStock: true,
    stockCount: 12,
    fabric: 'Pure Raw Silk with Soft Cotton Underskirt',
    silhouette: 'Flared Ceremonial Lehenga',
    description: 'Exquisite celebratory outfit for young ladies, lined with hypoallergenic ultra-soft cotton voile.',
    careInstructions: 'Specialist dry clean only.',
    images: [
      'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=1000&q=80'
    ]
  },
  {
    slug: 'velvet-kids-waistcoat',
    name: 'Embroidered Royal Velvet Waistcoat',
    subtitle: 'Fine Silk Velvet • Antique Metallic Buttons',
    category: 'kids',
    department: 'Miniature Archive',
    price: 5200,
    originalPrice: 6200,
    isSale: false,
    badge: 'Winter Festive',
    rating: 4.8,
    reviewCount: 9,
    colors: [
      { name: 'Imperial Maroon', hex: '#58181F', image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=1000&q=80' }
    ],
    sizes: [
      { size: '4-6 Yrs', stockCount: 6, inStock: true },
      { size: '7-9 Yrs', stockCount: 5, inStock: true }
    ],
    inStock: true,
    stockCount: 11,
    fabric: 'Silk Micro-Velvet',
    silhouette: 'Tailored Waistcoat with Mandarin Collar',
    description: 'Regal winter ceremonial layer crafted with precision stitching and tailored fit.',
    careInstructions: 'Dry clean only.',
    images: [
      'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=1000&q=80'
    ]
  }
];

const MOCK_COUPONS_SEED = [
  {
    code: 'WELCOME10',
    discountType: 'percentage',
    discountValue: 10,
    minOrderAmount: 5000,
    usageLimit: 500,
    isActive: true,
  },
  {
    code: 'AURASTORE20',
    discountType: 'percentage',
    discountValue: 20,
    minOrderAmount: 15000,
    usageLimit: 200,
    isActive: true,
  },
  {
    code: 'AURA500',
    discountType: 'fixed',
    discountValue: 500,
    minOrderAmount: 3000,
    usageLimit: 300,
    isActive: true,
  },
];

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is missing.');
    }

    console.log(`Connecting to MongoDB at: ${mongoUri.split('@')[1] || mongoUri}...`);
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 15000 });

    console.log(`Connected! Target Database: "${mongoose.connection.name}"`);

    console.log('Clearing existing records...');
    await Product.deleteMany({});
    await User.deleteMany({});
    await Category.deleteMany({});
    await Coupon.deleteMany({});
    await Setting.deleteMany({});
    await CustomRequest.deleteMany({});
    await Order.deleteMany({});

    console.log('1. Seeding Categories (Men, Women, Kids)...');
    await Category.insertMany(MOCK_CATEGORIES_SEED);

    console.log('2. Seeding Luxury Garment Catalog (Men, Women, Kids)...');
    const insertedProducts = await Product.insertMany(MOCK_PRODUCTS_SEED);

    console.log('3. Seeding Coupons (WELCOME10, AURASTORE20, AURA500)...');
    await Coupon.insertMany(MOCK_COUPONS_SEED);

    console.log('4. Seeding Store Settings (AuraStore)...');
    await Setting.create({
      siteName: 'AuraStore - Luxury Fashion & Haute Couture',
      contactEmail: process.env.ADMIN_EMAIL || 'owais@gmail.com',
      contactPhone: '0300-1234567',
      stripeEnabled: true,
      jazzCashEnabled: true,
      easyPaisaEnabled: true,
      currency: 'PKR',
      freeShippingThreshold: 10000,
    });

    console.log('5. Seeding Administrative and Customer Users...');
    // Master Super Admin (from .env)
    const superAdmin = await User.create({
      firstName: process.env.ADMIN_NAME || 'Owais',
      lastName: 'Admin',
      email: (process.env.ADMIN_EMAIL || 'owais@gmail.com').toLowerCase(),
      password: process.env.ADMIN_PASSWORD || 'owais@123',
      role: 'super_admin',
      vipTier: 'Gold Needle',
      phone: '03001234567',
    });

    // Master Tailor Admin
    const tailorAdmin = await User.create({
      firstName: 'Giuliano',
      lastName: 'Bellini',
      email: 'giuliano.tailoring@aurastore.com',
      password: 'TailorMaster2026!',
      role: 'tailor_admin',
      vipTier: 'Gold Needle',
      phone: '03009988776',
    });

    // Verified Patron Client
    const patronUser = await User.create({
      firstName: 'Hamza',
      lastName: 'Malik',
      email: 'hamza.malik@example.com',
      password: 'PatronPass123!',
      role: 'customer',
      vipTier: 'Gold Needle',
      phone: '03001234567',
      addresses: [
        {
          isDefault: true,
          label: 'Primary Residence',
          street: 'House 14, Sector F-7/2',
          city: 'Islamabad',
          postalCode: '44000',
          country: 'Pakistan',
        },
      ],
      measurementsProfile: {
        bustChest: 40,
        naturalWaist: 32,
        hips: 39,
        shoulderWidth: 18,
        height: "6'0\"",
        unit: 'in',
      },
    });

    console.log('6. Seeding Initial Orders...');
    const firstProduct = insertedProducts[0];
    const secondProduct = insertedProducts[4];

    await Order.create({
      orderNumber: `AURA-${Date.now().toString().slice(-6)}`,
      user: patronUser._id,
      items: [
        {
          product: firstProduct._id,
          name: firstProduct.name,
          price: firstProduct.price,
          size: '40 (M)',
          color: 'Pure White',
          image: firstProduct.images[0],
          quantity: 1,
        },
        {
          product: secondProduct._id,
          name: secondProduct.name,
          price: secondProduct.price,
          size: 'S (UK 8)',
          color: 'Sage Olive',
          image: secondProduct.images[0],
          quantity: 1,
        },
      ],
      shippingAddress: {
        firstName: patronUser.firstName,
        lastName: patronUser.lastName,
        email: patronUser.email,
        phone: patronUser.phone,
        address: 'House 14, Sector F-7/2',
        city: 'Islamabad',
        postalCode: '44000',
        country: 'Pakistan',
      },
      shippingMethod: 'express',
      shippingCost: 0,
      discountAmount: 0,
      subtotal: firstProduct.price + secondProduct.price,
      totalAmount: firstProduct.price + secondProduct.price,
      paymentMethod: 'cod',
      paymentStatus: 'paid',
      fulfillmentStatus: 'pressing',
    });

    console.log('7. Seeding AI Studio Custom Design Commission...');
    await CustomRequest.create({
      referenceCode: 'AURA-DSN-78401',
      user: patronUser._id,
      guestEmail: patronUser.email,
      phone: patronUser.phone,
      parameters: {
        audience: 'men',
        category: "Men's Sartorial",
        silhouette: 'Double-Breasted Heritage Cut',
        neckline: 'Peak Lapel',
        sleeves: 'Surgeon Cuffs',
        fabric: {
          id: 'irish-linen',
          name: '100% Pure Heavy Irish Linen',
          mill: 'Belfast Mill',
          composition: '380 gsm',
        },
        prompt: 'Custom tailored double-breasted summer blazer in raw ecru linen with floating canvas.',
        appliedChips: ['+ Hand-Stitched Pick Lapels', '+ Genuine Horn Buttons'],
        budgetTier: 'ultra-luxury',
        deliveryUrgency: 'priority',
        customNotes: 'Please cut with soft Neapolitan shoulder and unlined interior.',
      },
      aiConcepts: [
        {
          id: 'concept-1',
          title: 'Aura Sovereign Blueprint — Bespoke Ecru Blazer',
          description: 'Relaxed Neapolitan drapery in raw Irish linen with floating horsehair canvas.',
          badge: 'Master Tailor Recommendation',
          imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80',
        },
      ],
      selectedConceptId: 'concept-1',
      tailorStatus: 'feasibility_review',
      tailorNotes: 'Under review by Master Tailor. Fabric reserved.',
      officialQuoteAmount: 26500,
    });

    console.log('========================================================');
    console.log('✅ DATABASE "aurastore" SEEDED & CONFIGURED SUCCESSFULLY!');
    console.log('========================================================');
    console.log('Database Name: aurastore');
    console.log('Collections Created:');
    console.log('  - users (Admin & Customers)');
    console.log('  - products (Men, Women, Kids garments)');
    console.log('  - categories (Men, Women, Kids)');
    console.log('  - coupons (WELCOME10, AURASTORE20, AURA500)');
    console.log('  - settings (AuraStore configuration)');
    console.log('  - orders (Customer orders & metrics)');
    console.log('  - customrequests (AI Studio dossiers)');
    console.log('--------------------------------------------------------');
    console.log('Master Admin Credentials:');
    console.log(`  Email:    ${superAdmin.email}`);
    console.log(`  Password: ${process.env.ADMIN_PASSWORD || 'owais@123'}`);
    console.log('Customer Patron Credentials:');
    console.log(`  Email:    ${patronUser.email}`);
    console.log('  Password: PatronPass123!');
    console.log('========================================================');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    process.exit(1);
  }
};

seedDatabase();
