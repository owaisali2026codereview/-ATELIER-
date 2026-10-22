import mongoose from 'mongoose';
import { Category } from './category.model.js';
import { Product } from '../products/product.model.js';

let memoryCategories = [
  {
    _id: 'cat-1',
    name: 'Men',
    slug: 'men',
    subcategories: ['Shirts', 'Kurtas', 'Trousers', 'Blazers', 'Formal Suiting'],
    description: 'Precision bespoke tailoring and ready-to-wear menswear.',
    isActive: true,
  },
  {
    _id: 'cat-2',
    name: 'Women',
    slug: 'women',
    subcategories: ['Dresses', 'Kurtis', 'Sarees', 'Shawls', 'Bridal Couture'],
    description: 'Couture drapery, resham embroidery, and luxury silks.',
    isActive: true,
  },
  {
    _id: 'cat-3',
    name: 'Kids',
    slug: 'kids',
    subcategories: ['Boys Ceremonial', 'Girls Festive', 'Organic Cotton Casuals'],
    description: 'Heritage miniature tailoring crafted for young icons.',
    isActive: true,
  },
];

export const getAllCategoriesService = async () => {
  let categories = memoryCategories;

  if (mongoose.connection.readyState === 1) {
    try {
      const dbCategories = await Category.find({ isActive: true }).sort({ name: 1 });
      if (dbCategories && dbCategories.length > 0) {
        categories = dbCategories;
      }
    } catch (e) {
      console.warn('[Categories DB Fallback]:', e.message);
    }
  }

  // Count products for each category
  const results = await Promise.all(
    categories.map(async (cat) => {
      let productCount = 0;
      if (mongoose.connection.readyState === 1) {
        try {
          productCount = await Product.countDocuments({
            category: new RegExp(`^${cat.slug || cat.name}$`, 'i'),
            isArchived: false,
          });
        } catch (e) {
          // ignore
        }
      }
      const raw = cat.toObject ? cat.toObject() : { ...cat };
      return {
        ...raw,
        productsCount: productCount,
      };
    })
  );

  return results;
};

export const createCategoryService = async (categoryData) => {
  const name = (categoryData.name || '').trim();
  if (!name) throw new Error('Category name is required.');

  const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');

  let subcategories = [];
  if (Array.isArray(categoryData.subcategories)) {
    subcategories = categoryData.subcategories;
  } else if (typeof categoryData.subcategories === 'string') {
    subcategories = categoryData.subcategories
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }

  const payload = {
    name,
    slug,
    subcategories,
    description: categoryData.description || '',
    isActive: true,
  };

  if (mongoose.connection.readyState === 1) {
    try {
      const existing = await Category.findOne({ slug });
      if (existing) throw new Error(`Category "${name}" already exists.`);
      return await Category.create(payload);
    } catch (e) {
      console.warn('[Categories DB create fallback]:', e.message);
    }
  }

  const exists = memoryCategories.find((c) => c.slug === slug);
  if (exists) throw new Error(`Category "${name}" already exists.`);

  const newCat = {
    _id: `cat-${Date.now()}`,
    ...payload,
  };
  memoryCategories.push(newCat);
  return newCat;
};

export const deleteCategoryService = async (id) => {
  if (mongoose.connection.readyState === 1) {
    try {
      await Category.findByIdAndDelete(id);
    } catch (e) {
      console.warn('[Categories DB delete fallback]:', e.message);
    }
  }
  memoryCategories = memoryCategories.filter((c) => c._id.toString() !== id.toString());
  return true;
};
