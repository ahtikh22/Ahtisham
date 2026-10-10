import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import {
  User,
  Product,
  Category,
  Order,
  ProductReview,
  Address,
  Coupon,
  StoreSettings,
} from '../../src/types/index';

export interface StoredUser extends User {
  passwordHash: string;
}

export interface StoreData {
  users: StoredUser[];
  categories: Category[];
  products: Product[];
  orders: Order[];
  reviews: ProductReview[];
  addresses: Address[];
  wishlists: Record<string, string[]>; // userId -> array of productIds
  userCarts: Record<string, { productId: string; quantity: number }[]>; // userId -> cart items
  coupons: Coupon[];
  settings: StoreSettings;
}

const DATA_DIR = path.resolve(process.cwd(), 'server-data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

// Ensure directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial default settings
const defaultSettings: StoreSettings = {
  storeName: 'Ahti Shopping Store',
  supportEmail: 'support@ahtistore.pk',
  supportPhone: '+92 300 1234567',
  whatsappNumber: '+92 300 1234567',
  storeAddress: 'Shop # 14, Commercial Market, Blue Area, Islamabad, Pakistan',
  currency: 'PKR',
  standardShippingFee: 250,
  freeShippingThreshold: 5000,
  jazzcashNumber: '0300-1234567',
  jazzcashTitle: 'Ahti Shopping Store / Muhammad Ahtisham',
  jazzcashInstructions: 'Please send exact order amount via JazzCash App or *786# to the mobile number above. Keep your SMS receipt and enter the 12-digit Transaction ID (TID) below for manual verification.',
  easypaisaNumber: '0345-9876543',
  easypaisaTitle: 'Ahti Shopping Store / Muhammad Ahtisham',
  easypaisaInstructions: 'Transfer the payable amount using Easypaisa App or *786# to the phone number above. Submit the 11-digit TRX ID from the Easypaisa confirmation SMS/App.',
  bankName: 'Meezan Bank Limited',
  bankAccountTitle: 'Ahti Shopping Store Private Limited',
  bankAccountNumber: '01020304050607',
  bankIban: 'PK64MEZN0001020304050607',
  bankBranch: 'Blue Area Branch, Islamabad (Branch Code 0102)',
  bankInstructions: 'Transfer funds via online banking or ATM transfer to our Meezan Bank account. Enter the Bank reference/transaction number below.',
};

// Initial default categories
const defaultCategories: Category[] = [
  {
    id: 'cat-electronics',
    name: 'Electronics',
    slug: 'electronics',
    description: 'Smart gadgets, audio gear, smartwatches and lifestyle electronics',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    productCount: 3,
  },
  {
    id: 'cat-mobile-accessories',
    name: 'Mobile Accessories',
    slug: 'mobile-accessories',
    description: 'Fast chargers, durable cables, premium cases, and car mounts',
    imageUrl: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&auto=format&fit=crop&q=80',
    productCount: 3,
  },
  {
    id: 'cat-computers-laptops',
    name: 'Computers and Laptops',
    slug: 'computers-laptops',
    description: 'High-performance laptops, mechanical keyboards, gaming mice and accessories',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80',
    productCount: 2,
  },
  {
    id: 'cat-fashion',
    name: 'Fashion',
    slug: 'fashion',
    description: 'Trendsetting watches, leather wallets, apparel and sunglasses',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
    productCount: 2,
  },
  {
    id: 'cat-home-kitchen',
    name: 'Home and Kitchen',
    slug: 'home-kitchen',
    description: 'Modern home decor, stainless steel blenders, smart kitchen appliances',
    imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80',
    productCount: 2,
  },
  {
    id: 'cat-beauty-personal-care',
    name: 'Beauty and Personal Care',
    slug: 'beauty-personal-care',
    description: 'Grooming kits, hair dryers, organic skincare and wellness essentials',
    imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80',
    productCount: 2,
  },
  {
    id: 'cat-digital-accessories',
    name: 'Digital Accessories',
    slug: 'digital-accessories',
    description: 'USB hubs, wireless presentation remotes, high-speed SSDs and dongles',
    imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=80',
    productCount: 2,
  },
];

// Seed sample products with realistic PKR values and high-res verified Unsplash images
const defaultProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'AeroSound Pro Wireless ANC Headphones',
    slug: 'aerosound-pro-wireless-anc-headphones',
    sku: 'AHTI-EL-001',
    description: 'Experience deep bass and crystal clear acoustics with hybrid Active Noise Cancellation (up to 38dB). Features 40mm titanium drivers, plush memory foam earcups, 45-hour battery life, and Bluetooth 5.3 with multipoint pairing.',
    price: 8499,
    discountPrice: 6999,
    categoryId: 'cat-electronics',
    categoryName: 'Electronics',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 24,
    rating: 4.8,
    reviewCount: 38,
    isDemo: true,
    featured: true,
    isBestSeller: true,
    specifications: {
      'Driver Size': '40mm Dynamic Titanium',
      'Playtime': 'Up to 45 Hours (ANC Off)',
      'Connectivity': 'Bluetooth 5.3 + 3.5mm Aux',
      'Warranty': '1 Year Local Ahti Store Warranty'
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-2',
    name: 'VoltWave 65W GaN Fast Charger 3-Port',
    slug: 'voltwave-65w-gan-fast-charger',
    sku: 'AHTI-MA-002',
    description: 'Ultra-compact Gallium Nitride (GaN) wall adapter featuring dual USB-C Power Delivery ports and one QuickCharge 3.0 port. Rapidly charges MacBooks, iPhones, Samsung Galaxy, and iPads simultaneously with built-in surge protection.',
    price: 4200,
    discountPrice: 3450,
    categoryId: 'cat-mobile-accessories',
    categoryName: 'Mobile Accessories',
    images: [
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 45,
    rating: 4.9,
    reviewCount: 52,
    isDemo: true,
    featured: true,
    isNewArrival: true,
    specifications: {
      'Max Power': '65W Power Delivery',
      'Ports': '2x USB-C + 1x USB-A',
      'Technology': 'GaN III Fast Thermal Tech',
      'Plug Type': 'UK / Pakistan 3-pin standard'
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-3',
    name: 'ApexCraft Mechanical Keyboard RGB Wireless',
    slug: 'apexcraft-mechanical-keyboard-rgb',
    sku: 'AHTI-CL-003',
    description: 'Compact 75% layout mechanical gaming keyboard with hot-swappable pre-lubed Gateron Yellow switches, sound-dampening silicone foam, PBT dye-sublimated keycaps, and tri-mode connectivity (2.4GHz, Bluetooth 5.0, USB-C).',
    price: 13500,
    discountPrice: 11999,
    categoryId: 'cat-computers-laptops',
    categoryName: 'Computers and Laptops',
    images: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 12,
    rating: 4.7,
    reviewCount: 29,
    isDemo: true,
    featured: true,
    isBestSeller: true,
    specifications: {
      'Layout': '75% (84 Keys)',
      'Switches': 'Hot-Swappable Gateron Yellow (Linear)',
      'Backlight': 'Per-Key RGB with 18 Effects',
      'Battery': '4000mAh Rechargeable'
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-4',
    name: 'ChronoSteel Men Luxury Minimalist Watch',
    slug: 'chronosteel-luxury-minimalist-watch',
    sku: 'AHTI-FAS-004',
    description: 'Crafted from surgical-grade 316L stainless steel with sapphire crystal scratch-resistant glass, precision Japanese quartz movement, genuine top-grain calfskin leather strap, and 50m water resistance.',
    price: 9800,
    discountPrice: 7900,
    categoryId: 'cat-fashion',
    categoryName: 'Fashion',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 18,
    rating: 4.6,
    reviewCount: 22,
    isDemo: true,
    featured: false,
    isNewArrival: true,
    specifications: {
      'Case Diameter': '40mm',
      'Case Material': '316L Stainless Steel',
      'Strap': 'Genuine Italian Leather 20mm',
      'Water Resistance': '5 ATM / 50 Meters'
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-5',
    name: 'SmartBarista Precision Electric Coffee Grinder',
    slug: 'smartbarista-precision-electric-coffee-grinder',
    sku: 'AHTI-HK-005',
    description: 'Conical stainless steel burr grinder with 35 precise grind settings ranging from fine espresso to coarse French press. Anti-static technology prevents grounds from scattering, with digital timer display.',
    price: 15400,
    discountPrice: 13200,
    categoryId: 'cat-home-kitchen',
    categoryName: 'Home and Kitchen',
    images: [
      'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 15,
    rating: 4.9,
    reviewCount: 16,
    isDemo: true,
    featured: true,
    specifications: {
      'Burr Material': '40mm High-Carbon Conical Stainless Steel',
      'Grind Levels': '35 Micro-Adjustable Settings',
      'Hopper Capacity': '250g Coffee Beans',
      'Power': '165W Low RPM Motor'
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-6',
    name: 'HydroSonic Deep Sonic Facial Cleanser & Massager',
    slug: 'hydrosonic-deep-facial-cleanser',
    sku: 'AHTI-BC-006',
    description: 'Medical-grade hygienic silicone facial cleansing device delivering 8,000 T-Sonic pulsations per minute. Deeply lifts 99.5% of dirt, oil, and makeup residue while stimulating collagen production. IPX7 100% waterproof.',
    price: 4900,
    discountPrice: 3800,
    categoryId: 'cat-beauty-personal-care',
    categoryName: 'Beauty and Personal Care',
    images: [
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 30,
    rating: 4.7,
    reviewCount: 34,
    isDemo: true,
    featured: false,
    isNewArrival: true,
    specifications: {
      'Material': 'Ultra-Hygienic Food-Grade Silicone',
      'Speed Levels': '8 Intensity Modes',
      'Waterproof': 'IPX7 Certified',
      'Charging': 'Magnetic Wireless Dock'
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-7',
    name: 'HyperDrive 8-in-1 Aluminium USB-C Multiport Hub',
    slug: 'hyperdrive-8-in-1-usb-c-hub',
    sku: 'AHTI-DA-007',
    description: 'Expand your laptop connectivity with 4K@60Hz HDMI output, 100W Power Delivery pass-through, Gigabit Ethernet RJ45 port, SD/microSD dual card slots, and three high-speed USB 3.2 Gen 2 (10Gbps) ports. Precision milled aerospace aluminium.',
    price: 6800,
    discountPrice: 5600,
    categoryId: 'cat-digital-accessories',
    categoryName: 'Digital Accessories',
    images: [
      'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 40,
    rating: 4.8,
    reviewCount: 41,
    isDemo: true,
    featured: true,
    isBestSeller: true,
    specifications: {
      'Ports': 'HDMI 4K@60Hz, 100W PD, LAN 1Gbps, 3x USB 3.2, SD/TF',
      'Body': 'Anodized Space Grey Aluminium Alloy',
      'Compatibility': 'MacBook Pro/Air, Windows, iPad Pro, Android',
      'Cable Length': '15cm Braided Reinforced Cable'
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-8',
    name: 'MagCharge 10,000mAh Magnetic Power Bank 20W',
    slug: 'magcharge-10000mah-magnetic-power-bank',
    sku: 'AHTI-MA-008',
    description: 'Snap on and charge on the go with ultra-strong N52 neodymium magnets. Supports 15W wireless MagSafe fast charging and 20W bidirectional USB-C PD cable output. Foldable kickstand allows hands-free video viewing while charging.',
    price: 5200,
    discountPrice: 4299,
    categoryId: 'cat-mobile-accessories',
    categoryName: 'Mobile Accessories',
    images: [
      'https://images.unsplash.com/photo-1609592807693-518ce52d6a45?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 22,
    rating: 4.7,
    reviewCount: 31,
    isDemo: true,
    featured: false,
    isBestSeller: true,
    specifications: {
      'Capacity': '10,000mAh / 37Wh',
      'Wireless Output': '15W / 10W / 7.5W / 5W',
      'Wired Output': '20W PD Type-C',
      'Safety': 'Foreign Object Detection & Overheat Protection'
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-9',
    name: 'GlidePrecision Wireless Ergonomic Mouse',
    slug: 'glideprecision-wireless-ergonomic-mouse',
    sku: 'AHTI-CL-009',
    description: 'Natural 57-degree vertical handshake angle reduces forearm strain and wrist pressure during extended work hours. Features 4000 DPI high-precision sensor, whisper-quiet clicks, and up to 4 months battery on a single charge.',
    price: 6100,
    discountPrice: 4999,
    categoryId: 'cat-computers-laptops',
    categoryName: 'Computers and Laptops',
    images: [
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 14,
    rating: 4.6,
    reviewCount: 19,
    isDemo: true,
    featured: false,
    specifications: {
      'Ergonomic Angle': '57° Natural Handshake Grip',
      'DPI Range': '800 / 1200 / 1600 / 2400 / 4000 DPI',
      'Battery': 'Rechargeable Type-C (500mAh)',
      'Connection': 'Dual Mode (Bluetooth 5.2 + 2.4G USB Dongle)'
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-10',
    name: 'PureAir HEPA H13 Smart Air Purifier',
    slug: 'pureair-hepa-h13-smart-purifier',
    sku: 'AHTI-HK-010',
    description: 'Cleans air in rooms up to 450 sq ft every 30 minutes. 3-stage filtration captures 99.97% of airborne particles down to 0.3 microns, including pollen, pet dander, smog, and cooking odors. Features ultra-quiet 22dB Sleep Mode and real-time PM2.5 display.',
    price: 24500,
    discountPrice: 21900,
    categoryId: 'cat-home-kitchen',
    categoryName: 'Home and Kitchen',
    images: [
      'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 8,
    rating: 4.9,
    reviewCount: 27,
    isDemo: true,
    featured: true,
    specifications: {
      'Coverage Area': 'Up to 450 sq ft (CADR 220 m³/h)',
      'Filter': 'True HEPA H13 + Activated Carbon',
      'Noise Level': '22dB - 48dB',
      'Power Consumption': '35W Eco Mode'
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-11',
    name: 'Nomad RFID-Blocking Genuine Leather Wallet',
    slug: 'nomad-rfid-leather-wallet',
    sku: 'AHTI-FAS-011',
    description: 'Handcrafted from full-grain vintage pull-up leather that develops a rich, distinct patina over time. Embedded with high-frequency RFID-blocking lining to prevent digital pickpocketing. Holds up to 10 cards and flat cash notes.',
    price: 3600,
    discountPrice: 2850,
    categoryId: 'cat-fashion',
    categoryName: 'Fashion',
    images: [
      'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 35,
    rating: 4.8,
    reviewCount: 44,
    isDemo: true,
    featured: false,
    specifications: {
      'Material': '100% Genuine Full-Grain Cow Leather',
      'Protection': 'Military-Grade RFID Blocking 13.56 MHz',
      'Capacity': '8 Card Slots, 2 Currency Pockets',
      'Warranty': '2 Year Craftsmanship Guarantee'
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-12',
    name: 'SoundPulse Waterproof Portable Bluetooth Speaker',
    slug: 'soundpulse-waterproof-portable-speaker',
    sku: 'AHTI-EL-012',
    description: 'Rugged IPX7 waterproof speaker delivering 30W stereo audio with dual passive radiators for deep resonant bass. Built-in 5200mAh battery delivers 24 hours of non-stop playtime and doubles as an emergency power bank.',
    price: 9200,
    discountPrice: 7500,
    categoryId: 'cat-electronics',
    categoryName: 'Electronics',
    images: [
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 20,
    rating: 4.7,
    reviewCount: 36,
    isDemo: true,
    featured: true,
    isBestSeller: true,
    specifications: {
      'Output Power': '30W RMS Stereo',
      'Waterproof': 'IPX7 Submersible',
      'Playtime': '24 Hours at 50% Volume',
      'Bluetooth': 'v5.3 with TWS Dual Stereo Pairing'
    },
    createdAt: new Date().toISOString(),
  }
];

// Initial coupons
const defaultCoupons: Coupon[] = [
  {
    id: 'coup-1',
    code: 'WELCOME10',
    discountType: 'percentage',
    discountValue: 10,
    minOrderAmount: 1000,
    isActive: true,
  },
  {
    id: 'coup-2',
    code: 'AHTI500',
    discountType: 'fixed',
    discountValue: 500,
    minOrderAmount: 3000,
    isActive: true,
  },
  {
    id: 'coup-3',
    code: 'RAMADAN20',
    discountType: 'percentage',
    discountValue: 20,
    minOrderAmount: 5000,
    isActive: true,
  },
];

// Initial reviews
const defaultReviews: ProductReview[] = [
  {
    id: 'rev-1',
    productId: 'prod-1',
    userId: 'cust-demo-1',
    userName: 'Hamza Tariq',
    rating: 5,
    comment: 'Sound quality is superb, and noise cancellation works great even in noisy Lahore traffic. Highly recommended!',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'rev-2',
    productId: 'prod-1',
    userId: 'cust-demo-2',
    userName: 'Zainab Bibi',
    rating: 4,
    comment: 'Very comfortable cushions for long study hours. Battery lasts almost the entire week.',
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
  {
    id: 'rev-3',
    productId: 'prod-2',
    userId: 'cust-demo-1',
    userName: 'Hamza Tariq',
    rating: 5,
    comment: 'Charges my MacBook and Galaxy phone rapidly at the same time without getting too hot. Great GaN tech!',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'rev-4',
    productId: 'prod-3',
    userId: 'cust-demo-3',
    userName: 'Bilal Ahmed',
    rating: 5,
    comment: 'The mechanical switches feel silky smooth. Sound profile is creamy and satisfying.',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  }
];

class MemoryDatabase {
  private data: StoreData;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): StoreData {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const fileContent = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(fileContent);
        // Ensure admin account exists with requested initial credentials
        this.ensureAdminAccount(parsed);
        return parsed;
      }
    } catch (e) {
      console.error('Error reading store.json, reinitializing...', e);
    }

    const initialData: StoreData = {
      users: [],
      categories: defaultCategories,
      products: defaultProducts,
      orders: [],
      reviews: defaultReviews,
      addresses: [],
      wishlists: {},
      userCarts: {},
      coupons: defaultCoupons,
      settings: defaultSettings,
    };

    this.ensureAdminAccount(initialData);
    this.saveData(initialData);
    return initialData;
  }

  private ensureAdminAccount(data: StoreData) {
    const adminEmail = 'ahti01@gmail.com';
    const existingAdminIndex = data.users.findIndex(
      (u) => u.email.toLowerCase() === adminEmail.toLowerCase()
    );

    // Initial password hash for "ahtisham@1"
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync('ahtisham@1', salt);

    if (existingAdminIndex >= 0) {
      // Ensure role is admin
      data.users[existingAdminIndex].role = 'admin';
    } else {
      data.users.push({
        id: 'user-admin-1',
        fullName: 'Store Administrator (Ahti)',
        email: adminEmail,
        phone: '+92 300 1234567',
        country: 'Pakistan',
        role: 'admin',
        passwordHash: hash,
        createdAt: new Date().toISOString(),
      });
    }

    // Also add a sample customer account for instant demonstration
    const customerEmail = 'customer@example.com';
    if (!data.users.some((u) => u.email.toLowerCase() === customerEmail)) {
      const custHash = bcrypt.hashSync('customer123', 10);
      data.users.push({
        id: 'cust-demo-1',
        fullName: 'Hamza Tariq',
        email: customerEmail,
        phone: '+92 321 9876543',
        country: 'Pakistan',
        role: 'customer',
        passwordHash: custHash,
        createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
      });
    }
  }

  private saveData(dataToSave: StoreData = this.data) {
    try {
      const tempPath = `${DATA_FILE}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(dataToSave, null, 2), 'utf-8');
      fs.renameSync(tempPath, DATA_FILE);
    } catch (e) {
      console.error('Error saving store.json:', e);
    }
  }

  // --- Users & Profiles ---
  public getUsers(): StoredUser[] {
    return this.data.users;
  }

  public findUserByEmail(email: string): StoredUser | undefined {
    return this.data.users.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    );
  }

  public findUserById(id: string): StoredUser | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  public createUser(user: StoredUser): StoredUser {
    this.data.users.push(user);
    this.saveData();
    return user;
  }

  public updateUser(id: string, updates: Partial<StoredUser>): StoredUser | null {
    const idx = this.data.users.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    this.data.users[idx] = { ...this.data.users[idx], ...updates };
    this.saveData();
    return this.data.users[idx];
  }

  // --- Categories ---
  public getCategories(): Category[] {
    // calculate actual product count
    return this.data.categories.map((c) => ({
      ...c,
      productCount: this.data.products.filter((p) => p.categoryId === c.id).length,
    }));
  }

  public getCategoryById(id: string): Category | undefined {
    return this.data.categories.find((c) => c.id === id);
  }

  public addCategory(cat: Omit<Category, 'id'>): Category {
    const newCat: Category = {
      ...cat,
      id: `cat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      productCount: 0,
    };
    this.data.categories.push(newCat);
    this.saveData();
    return newCat;
  }

  public updateCategory(id: string, updates: Partial<Category>): Category | null {
    const idx = this.data.categories.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    this.data.categories[idx] = { ...this.data.categories[idx], ...updates };
    this.saveData();
    return this.data.categories[idx];
  }

  public deleteCategory(id: string): boolean {
    const idx = this.data.categories.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    this.data.categories.splice(idx, 1);
    this.saveData();
    return true;
  }

  // --- Products ---
  public getProducts(): Product[] {
    return this.data.products;
  }

  public getProductById(id: string): Product | undefined {
    return this.data.products.find((p) => p.id === id);
  }

  public addProduct(p: Omit<Product, 'id' | 'createdAt'>): Product {
    const cat = this.getCategoryById(p.categoryId);
    const newProduct: Product = {
      ...p,
      id: `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      categoryName: cat?.name || 'Uncategorized',
      createdAt: new Date().toISOString(),
      rating: p.rating || 5.0,
      reviewCount: p.reviewCount || 0,
    };
    this.data.products.unshift(newProduct);
    this.saveData();
    return newProduct;
  }

  public updateProduct(id: string, updates: Partial<Product>): Product | null {
    const idx = this.data.products.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    if (updates.categoryId) {
      const cat = this.getCategoryById(updates.categoryId);
      if (cat) updates.categoryName = cat.name;
    }
    this.data.products[idx] = { ...this.data.products[idx], ...updates };
    this.saveData();
    return this.data.products[idx];
  }

  public deleteProduct(id: string): boolean {
    const idx = this.data.products.findIndex((p) => p.id === id);
    if (idx === -1) return false;
    this.data.products.splice(idx, 1);
    this.saveData();
    return true;
  }

  // --- Orders ---
  public getOrders(): Order[] {
    return this.data.orders;
  }

  public getOrderById(id: string): Order | undefined {
    return this.data.orders.find((o) => o.id === id || o.orderNumber === id);
  }

  public getOrdersByUserId(userId: string): Order[] {
    return this.data.orders
      .filter((o) => o.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public createOrder(order: Order): Order {
    this.data.orders.unshift(order);
    this.saveData();
    return order;
  }

  public updateOrder(id: string, updates: Partial<Order>): Order | null {
    const idx = this.data.orders.findIndex((o) => o.id === id);
    if (idx === -1) return null;
    this.data.orders[idx] = {
      ...this.data.orders[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveData();
    return this.data.orders[idx];
  }

  // --- Reviews ---
  public getReviewsByProductId(productId: string): ProductReview[] {
    return this.data.reviews.filter((r) => r.productId === productId);
  }

  public addReview(review: Omit<ProductReview, 'id' | 'createdAt'>): ProductReview {
    const newReview: ProductReview = {
      ...review,
      id: `rev-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.data.reviews.push(newReview);

    // Recalculate product rating
    const prodReviews = this.getReviewsByProductId(review.productId);
    const avg =
      prodReviews.reduce((sum, r) => sum + r.rating, 0) / prodReviews.length;
    this.updateProduct(review.productId, {
      rating: parseFloat(avg.toFixed(1)),
      reviewCount: prodReviews.length,
    });

    this.saveData();
    return newReview;
  }

  // --- Addresses ---
  public getAddressesByUserId(userId: string): Address[] {
    return this.data.addresses.filter((a) => a.userId === userId);
  }

  public addAddress(addr: Omit<Address, 'id'>): Address {
    if (addr.isDefault) {
      this.data.addresses.forEach((a) => {
        if (a.userId === addr.userId) a.isDefault = false;
      });
    }
    const newAddr: Address = {
      ...addr,
      id: `addr-${Date.now()}`,
    };
    this.data.addresses.push(newAddr);
    this.saveData();
    return newAddr;
  }

  public deleteAddress(id: string, userId: string): boolean {
    const idx = this.data.addresses.findIndex(
      (a) => a.id === id && a.userId === userId
    );
    if (idx === -1) return false;
    this.data.addresses.splice(idx, 1);
    this.saveData();
    return true;
  }

  // --- Wishlist ---
  public getWishlist(userId: string): string[] {
    return this.data.wishlists[userId] || [];
  }

  public toggleWishlist(userId: string, productId: string): string[] {
    const current = this.data.wishlists[userId] || [];
    const exists = current.includes(productId);
    const updated = exists
      ? current.filter((id) => id !== productId)
      : [...current, productId];
    this.data.wishlists[userId] = updated;
    this.saveData();
    return updated;
  }

  // --- Carts ---
  public getUserCart(userId: string): { productId: string; quantity: number }[] {
    return this.data.userCarts[userId] || [];
  }

  public saveUserCart(
    userId: string,
    items: { productId: string; quantity: number }[]
  ) {
    this.data.userCarts[userId] = items;
    this.saveData();
  }

  // --- Coupons ---
  public getCoupons(): Coupon[] {
    return this.data.coupons;
  }

  public findCouponByCode(code: string): Coupon | undefined {
    return this.data.coupons.find(
      (c) => c.code.toUpperCase() === code.trim().toUpperCase() && c.isActive
    );
  }

  public addCoupon(c: Omit<Coupon, 'id'>): Coupon {
    const newCoupon: Coupon = {
      ...c,
      id: `coup-${Date.now()}`,
    };
    this.data.coupons.push(newCoupon);
    this.saveData();
    return newCoupon;
  }

  public updateCoupon(id: string, updates: Partial<Coupon>): Coupon | null {
    const idx = this.data.coupons.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    this.data.coupons[idx] = { ...this.data.coupons[idx], ...updates };
    this.saveData();
    return this.data.coupons[idx];
  }

  public deleteCoupon(id: string): boolean {
    const idx = this.data.coupons.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    this.data.coupons.splice(idx, 1);
    this.saveData();
    return true;
  }

  // --- Settings ---
  public getSettings(): StoreSettings {
    return this.data.settings;
  }

  public updateSettings(updates: Partial<StoreSettings>): StoreSettings {
    this.data.settings = { ...this.data.settings, ...updates };
    this.saveData();
    return this.data.settings;
  }
}

export const db = new MemoryDatabase();
