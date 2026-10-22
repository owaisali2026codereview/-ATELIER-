import {
  queryProducts,
  getProductByIdOrSlug,
  getProductReviewsService,
  addProductReviewService,
} from './product.service.js';
import { Product } from './product.model.js';

export const getProducts = async (req, res, next) => {
  try {
    const products = await queryProducts(req.query);
    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

export const getProduct = async (req, res, next) => {
  try {
    const product = await getProductByIdOrSlug(req.params.idOrSlug);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Luxury archival garment not found in catalog.',
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const getCategorySummary = async (req, res, next) => {
  try {
    const menCount = await Product.countDocuments({ category: 'men', isArchived: false });
    const womenCount = await Product.countDocuments({ category: 'women', isArchived: false });
    const kidsCount = await Product.countDocuments({ category: 'kids', isArchived: false });

    res.status(200).json({
      success: true,
      data: {
        men: { count: menCount, name: "Men's Sartorial" },
        women: { count: womenCount, name: "Women's Couture" },
        kids: { count: kidsCount, name: 'Miniature Archive' },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getProductReviews = async (req, res, next) => {
  try {
    const reviews = await getProductReviewsService(req.params.idOrSlug);
    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

export const createProductReview = async (req, res, next) => {
  try {
    const review = await addProductReviewService(
      req.params.idOrSlug,
      req.body,
      req.user || null
    );

    res.status(201).json({
      success: true,
      data: review,
      message: 'Your critique has been archived in the atelier reviews registry.',
    });
  } catch (error) {
    next(error);
  }
};
