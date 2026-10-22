import mongoose from 'mongoose';
import { Product } from './product.model.js';
import { Review } from './review.model.js';

// Clean in-memory cache initialized as empty
let memoryProductsCache = [];

const escapeRegex = (string) => {
  if (typeof string !== 'string') return '';
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export const queryProducts = async (filters = {}) => {
  if (mongoose.connection.readyState === 1) {
    try {
      const query = { isArchived: false };

      // Category filter (men, women, kids) - strict anchored exact match to prevent cross-category leak
      if (filters.category && filters.category !== 'all') {
        const cat = escapeRegex(filters.category.trim());
        query.category = new RegExp(`^${cat}$`, 'i');
      }

      // Fabric filter (escaped to prevent ReDoS)
      if (filters.fabric) {
        query.fabric = new RegExp(escapeRegex(filters.fabric), 'i');
      }

      // Price range
      if (filters.minPrice || filters.maxPrice) {
        query.price = {};
        if (filters.minPrice) query.price.$gte = Number(filters.minPrice);
        if (filters.maxPrice) query.price.$lte = Number(filters.maxPrice);
      }

      // Stock filter
      if (filters.inStock === 'true' || filters.inStock === true) {
        query.inStock = true;
      }

      // Text search (escaped to prevent ReDoS)
      if (filters.search && typeof filters.search === 'string') {
        const sanitizedSearch = escapeRegex(filters.search.trim());
        query.$or = [
          { name: new RegExp(sanitizedSearch, 'i') },
          { fabric: new RegExp(sanitizedSearch, 'i') },
          { description: new RegExp(sanitizedSearch, 'i') },
          { subtitle: new RegExp(sanitizedSearch, 'i') },
          { department: new RegExp(sanitizedSearch, 'i') },
        ];
      }

      // Sorting
      let sortOption = { createdAt: -1 };
      if (filters.sort === 'price-asc') sortOption = { price: 1 };
      if (filters.sort === 'price-desc') sortOption = { price: -1 };
      if (filters.sort === 'rating') sortOption = { rating: -1 };

      const products = await Product.find(query).sort(sortOption);
      return products;
    } catch (err) {
      console.warn('[QueryProducts DB Fallback]: Using memory products', err.message);
    }
  }

  // Memory fallback filtering
  let res = memoryProductsCache.filter((p) => !p.isArchived);
  if (filters.category && filters.category !== 'all') {
    const targetCat = filters.category.trim().toLowerCase();
    res = res.filter((p) => (p.category || '').trim().toLowerCase() === targetCat);
  }
  if (filters.maxPrice) {
    res = res.filter((p) => p.price <= Number(filters.maxPrice));
  }
  if (filters.inStock === 'true' || filters.inStock === true) {
    res = res.filter((p) => p.inStock);
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    res = res.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.fabric.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }
  return res;
};

export const getProductByIdOrSlug = async (identifier) => {
  if (mongoose.connection.readyState === 1) {
    try {
      let product = null;
      if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
        product = await Product.findById(identifier);
      }
      if (!product) {
        product = await Product.findOne({ slug: identifier, isArchived: false });
      }
      if (product) return product;
    } catch (err) {
      // fallback
    }
  }

  return (
    memoryProductsCache.find(
      (p) => (p._id && p._id.toString() === identifier) || p.slug === identifier || p.id === identifier
    ) || null
  );
};

export const createProductInDb = async (productData) => {
  const name = productData.name?.trim() || 'Custom Luxury Garment';
  const category = (productData.category || 'men').toLowerCase();
  let baseSlug = (productData.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-')).replace(/^-+|-+$/g, '') || 'garment';
  let slug = baseSlug;

  const images = Array.isArray(productData.images) && productData.images.length > 0
    ? productData.images
    : [productData.image || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80'];

  const colors = Array.isArray(productData.colors) && productData.colors.length > 0
    ? productData.colors
    : [{ name: 'Pure White', hex: '#FFFFFF', image: images[0] }];

  const sizes = Array.isArray(productData.sizes) && productData.sizes.length > 0
    ? productData.sizes
    : [
        { size: 'S', stockCount: productData.stockCount || 10, inStock: true },
        { size: 'M', stockCount: productData.stockCount || 10, inStock: true },
        { size: 'L', stockCount: productData.stockCount || 10, inStock: true },
      ];

  const doc = {
    ...productData,
    name,
    slug,
    category,
    department: productData.department || `${category.charAt(0).toUpperCase() + category.slice(1)}'s Collection`,
    price: Number(productData.price) || 5000,
    stockCount: Number(productData.stockCount || productData.stock) || 15,
    inStock: (productData.stockCount || productData.stock || 1) > 0,
    fabric: productData.fabric || '100% Breathable Combed Cotton',
    description: productData.description || 'Artisanal bespoke clothing tailored with precision.',
    images,
    colors,
    sizes,
    badge: productData.badge || 'New Arrival',
  };

  if (mongoose.connection.readyState === 1) {
    try {
      const existing = await Product.findOne({ slug });
      if (existing) {
        slug = `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`;
        doc.slug = slug;
      }
      const created = await Product.create(doc);
      memoryProductsCache.unshift(created.toObject());
      return created;
    } catch (err) {
      console.warn('[CreateProduct DB Error]: Saving to memory fallback:', err.message);
    }
  }

  const memoryDoc = { ...doc, _id: `prod_${Date.now()}` };
  memoryProductsCache.unshift(memoryDoc);
  return memoryDoc;
};

export const updateProductInDb = async (id, updateData) => {
  if (updateData.price) updateData.price = Number(updateData.price);
  if (updateData.stockCount !== undefined) {
    updateData.stockCount = Number(updateData.stockCount);
    updateData.inStock = updateData.stockCount > 0;
  }
  if (updateData.stock !== undefined) {
    updateData.stockCount = Number(updateData.stock);
    updateData.inStock = updateData.stockCount > 0;
  }
  if (updateData.category) {
    updateData.category = updateData.category.toLowerCase();
  }
  if (updateData.image) {
    updateData.images = [updateData.image];
  }

  if (mongoose.connection.readyState === 1) {
    try {
      let updated = null;
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        updated = await Product.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
      }
      if (!updated) {
        updated = await Product.findOneAndUpdate({ slug: id }, updateData, { new: true, runValidators: true });
      }
      if (updated) {
        const idx = memoryProductsCache.findIndex((p) => p._id?.toString() === id || p.slug === id);
        if (idx !== -1) memoryProductsCache[idx] = updated.toObject();
        return updated;
      }
    } catch (err) {
      console.warn('[UpdateProduct DB Error]:', err.message);
    }
  }

  const idx = memoryProductsCache.findIndex((p) => p._id?.toString() === id || p.slug === id || p.id === id);
  if (idx !== -1) {
    memoryProductsCache[idx] = { ...memoryProductsCache[idx], ...updateData };
    return memoryProductsCache[idx];
  }

  throw new Error('Garment not found.');
};

export const deleteProductInDb = async (id) => {
  if (mongoose.connection.readyState === 1) {
    try {
      let deleted = null;
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        deleted = await Product.findByIdAndDelete(id);
      }
      if (!deleted) {
        deleted = await Product.findOneAndDelete({ slug: id });
      }
      if (deleted) {
        memoryProductsCache = memoryProductsCache.filter((p) => p._id?.toString() !== id && p.slug !== id);
        return deleted;
      }
    } catch (err) {
      console.warn('[DeleteProduct DB Error]:', err.message);
    }
  }

  memoryProductsCache = memoryProductsCache.filter((p) => p._id?.toString() !== id && p.slug !== id && p.id !== id);
  return { message: 'Deleted' };
};

let memoryReviewsCache = [
  {
    _id: 'rev-seed-1',
    productId: '1',
    author: 'Tariq Mansoor',
    rating: 5,
    title: 'Exquisite Drapery & Perfect Silhouette',
    comment: 'The craftsmanship on the seams and lapel roll is unmatched. You can immediately feel the density and breathability of the pure wool yarn.',
    isVerifiedPurchase: true,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    _id: 'rev-seed-2',
    productId: '2',
    author: 'Zara S.',
    rating: 5,
    title: 'Heirloom Quality Silk Gown',
    comment: 'Ordered for an evening gala in Lahore. The gold thread embroidery caught the light gorgeously without being overwhelming.',
    isVerifiedPurchase: true,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
];

export const getProductReviewsService = async (idOrSlug) => {
  let targetProduct = await getProductByIdOrSlug(idOrSlug);
  const prodId = targetProduct?._id?.toString() || idOrSlug.toString();

  if (mongoose.connection.readyState === 1 && targetProduct?._id) {
    try {
      const reviews = await Review.find({ product: targetProduct._id }).sort({ createdAt: -1 });
      if (reviews && reviews.length > 0) return reviews;
    } catch (err) {
      console.warn('[GetReviews DB Fallback]:', err.message);
    }
  }

  // Memory fallback
  const matches = memoryReviewsCache.filter(
    (r) => r.productId === prodId || (targetProduct && r.productId === targetProduct.id?.toString()) || r.productId === idOrSlug.toString()
  );
  return matches.length > 0 ? matches : memoryReviewsCache.slice(0, 2);
};

export const addProductReviewService = async (idOrSlug, reviewData, user) => {
  let targetProduct = await getProductByIdOrSlug(idOrSlug);
  const prodId = targetProduct?._id || idOrSlug;

  const authorName = reviewData.author?.trim() ||
    (user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Honored Patron');

  const rating = Math.max(1, Math.min(5, Number(reviewData.rating) || 5));
  const comment = (reviewData.comment || '').trim();
  if (!comment) throw new Error('Critique commentary is required.');

  const payload = {
    product: prodId,
    user: user?._id || null,
    author: authorName,
    rating,
    title: reviewData.title?.trim() || '',
    comment,
    isVerifiedPurchase: true,
    createdAt: new Date(),
  };

  if (mongoose.connection.readyState === 1 && targetProduct?._id) {
    try {
      const newReview = await Review.create(payload);

      // Recalculate average rating & review count for product
      const allReviews = await Review.find({ product: targetProduct._id });
      const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      await Product.findByIdAndUpdate(targetProduct._id, {
        rating: Math.round(avg * 10) / 10,
        reviewCount: allReviews.length,
      });

      return newReview;
    } catch (err) {
      console.warn('[AddReview DB Fallback]:', err.message);
    }
  }

  // Memory fallback
  const newRev = {
    _id: `rev-${Date.now()}`,
    productId: prodId.toString(),
    ...payload,
  };
  memoryReviewsCache.unshift(newRev);
  return newRev;
};
