// Atelier Luxury Catalog & Static Data Assets

export const MOCK_PRODUCTS = [
  {
    id: 'oxford-shirt',
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
    sizes: ['38 (S)', '40 (M)', '42 (L)', '44 (XL)', '46 (XXL)'],
    inStock: true,
    stockCount: 8,
    fabric: '100% Egyptian Giza 87 Cotton',
    silhouette: 'Relaxed Tailored Fit',
    description: 'Woven on vintage shuttle looms from ultra-long-staple Egyptian cotton. Features Australian mother-of-pearl buttons, single-needle French seams, and a floating interlining collar designed to retain crisp structural memory over decades of wear.',
    careInstructions: 'Dry clean recommended or machine wash cold on delicate cycle. Press with warm steam while slightly damp.',
    images: [
      'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1000&q=80'
    ]
  },
  {
    id: 'embroidered-lawn-gown',
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
      { name: 'Champagne Ochre', hex: '#E3D7BF', image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1000&q=80' },
      { name: 'Ivory Dusk', hex: '#FAF9F6', image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1000&q=80' }
    ],
    sizes: ['XS (UK 6)', 'S (UK 8)', 'M (UK 10)', 'L (UK 12)', 'XL (UK 14)'],
    inStock: true,
    stockCount: 4,
    fabric: 'Pure Silk Blend Combed Lawn',
    silhouette: 'Fluid Architectural Anarkali',
    description: 'An ethereal collision of antique South Asian needlework and contemporary architectural draping. Finished with delicate hand-knotted tassel chords and raw silk inner hems.',
    careInstructions: 'Specialist dry clean only. Protect intricate embroidery from contact with sharp jewelry.',
    images: [
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1000&q=80'
    ]
  },
  {
    id: 'double-breasted-blazer',
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
      { name: 'Deep Olive', hex: '#4D5543', image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1000&q=80' },
      { name: 'Charcoal Black', hex: '#1C1B1B', image: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=1000&q=80' }
    ],
    sizes: ['38 Regular', '40 Regular', '42 Regular', '44 Long'],
    inStock: true,
    stockCount: 5,
    fabric: '100% Pure Heavy Irish Linen',
    silhouette: 'Neapolitan Soft Shoulder',
    description: 'Constructed completely unlined with hand-padded floating horsehair canvas lapels. Drapes with relaxed European nonchalance while maintaining a razor-sharp silhouette.',
    careInstructions: 'Professional eco dry clean only. Steam gently.',
    images: [
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=1000&q=80'
    ]
  },
  {
    id: 'boys-festive-kurta',
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
    sizes: ['3-4 Yrs', '5-6 Yrs', '7-8 Yrs', '9-10 Yrs', '11-12 Yrs'],
    inStock: true,
    stockCount: 12,
    fabric: '100% Organic Hand-Woven Mulmul Cotton',
    silhouette: 'Comfort Straight Fit with Side Slits',
    description: 'Featherlight heirloom ceremonial wear designed for unconstrained movement. Hand-tailored in our Lahore atelier with seamless inner linings to prevent skin irritation.',
    careInstructions: 'Hand wash cold with gentle organic detergent. Line dry in shade.',
    images: [
      'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=1000&q=80'
    ]
  },
  {
    id: 'cashmere-evening-wrap',
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
      { name: 'Nocturne Black', hex: '#111215', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=80' },
      { name: 'Carmine Rose', hex: '#7D2228', image: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=1000&q=80' }
    ],
    sizes: ['One Size (100cm x 200cm)'],
    inStock: true,
    stockCount: 3,
    fabric: '100% Authentic Ladakhi Pashmina Cashmere',
    silhouette: 'Generous Fluid Wrap',
    description: 'Each piece takes three months of artisanal needle embroidery in the Kashmir valley. Incomparably soft, gossamer-weight warmth with heritage floral needlepoint borders.',
    careInstructions: 'Professional cashmere dry clean only. Store in breathable muslin bag.',
    images: [
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=1000&q=80'
    ]
  },
  {
    id: 'japanese-selvedge-denim',
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
      { name: 'Deep Indigo', hex: '#16233B', image: 'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=1000&q=80' },
      { name: 'Overdyed Obsidian', hex: '#1A1A1A', image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1000&q=80' }
    ],
    sizes: ['30/32', '32/32', '34/32', '36/34'],
    inStock: true,
    stockCount: 7,
    fabric: '100% Cotton Shuttle-Loomed Japanese Denim',
    silhouette: 'Medium-Rise Tapered Leg',
    description: 'Woven slowly on antique Toyoda looms in Kojima, Okayama. Rigid unwashed raw denim engineered to mold and fade uniquely with the natural patina of the owner.',
    careInstructions: 'Wear for 6 months prior to first soak. Hand soak inside out in cold water, line dry.',
    images: [
      'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1000&q=80'
    ]
  }
];

export const FABRICS_DATABASE = [
  {
    id: 'mulberry-silk',
    name: '100% Raw Mulberry Silk',
    origin: 'Como, Italy',
    weight: '90 gsm',
    characteristics: 'Fluid drape, luminous micro-sheen, featherlight breathability',
    texture: 'Supple & Glossy',
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'irish-linen',
    name: 'Heavy Heritage Irish Flax Linen',
    origin: 'Belfast, Northern Ireland',
    weight: '340 gsm',
    characteristics: 'Textured slub weave, architectural structure, softens with age',
    texture: 'Crisp & Tactile',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'cashmere-wool',
    name: '130s Superfine Merino & Cashmere',
    origin: 'Biella, Italy',
    weight: '280 gsm',
    characteristics: 'Superb insulation, natural crease resistance, velvety finish',
    texture: 'Butter-Soft Warmth',
    image: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'silk-velvet',
    name: 'Artisan Resham Silk Velvet',
    origin: 'Lyon, France',
    weight: '310 gsm',
    characteristics: 'Deep light absorption, dramatic movement, sumptuous hand-feel',
    texture: 'Rich & Opulent',
    image: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=600&q=80'
  }
];

export const JOURNAL_DISPATCHES = [
  {
    id: 'memory-of-fibers',
    volume: 'Issue XIV • Essay',
    readTime: '6 Min Read',
    title: 'The Memory of Fibers: Why Vintage Shuttle Looms Define Modern Suiting',
    excerpt: 'An inquiry into the rhythmic cadence of wooden shuttle looms in Okayama and their enduring role in modern algorithmic pattern cutting.',
    author: 'Elena Rostova',
    date: 'Autumn 2026',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1000&q=80'
  },
  {
    id: 'floating-canvas-architecture',
    volume: 'Craft & Technique',
    readTime: '4 Min Read',
    title: 'The Architecture of the Floating Canvas',
    excerpt: 'Why natural horsehair interfacing creates garments that mold organically to the wearer’s anatomy over decades.',
    author: 'Master Tailor Tariq Al-Mansoor',
    date: 'Summer 2026',
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1000&q=80'
  },
  {
    id: 'julien-vane-interview',
    volume: 'Salon Dialogue',
    readTime: '8 Min Read',
    title: 'Bridging South Asian Zardozi with Algorithmic Silhouette Draping',
    excerpt: 'A rare discussion with Creative Director Julien Vane on harmonizing heritage needlecraft with real-time parametric AI rendering.',
    author: 'Sartorial Review',
    date: 'June 2026',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=80'
  }
];
