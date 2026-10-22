import {
  getAllCategoriesService,
  createCategoryService,
  deleteCategoryService,
} from './category.service.js';

export const getCategories = async (req, res, next) => {
  try {
    const categories = await getAllCategoriesService();
    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const category = await createCategoryService(req.body);
    res.status(201).json({
      success: true,
      data: category,
      message: 'Category created successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    await deleteCategoryService(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Category deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
