const asyncHandler = require('../../utils/asyncHandler');
const apiResponse = require('../../utils/apiResponse');
const categoryService = require('./category.service');

const list = asyncHandler(async (req, res) => {
  const categories = await categoryService.listCategories();
  return apiResponse.success(res, categories);
});

const create = asyncHandler(async (req, res) => {
  const category = await categoryService.createCategory(req.body);
  return apiResponse.created(res, category);
});

const update = asyncHandler(async (req, res) => {
  const category = await categoryService.updateCategory(req.params.id, req.body);
  return apiResponse.success(res, category, 'Category updated');
});

const remove = asyncHandler(async (req, res) => {
  await categoryService.deleteCategory(req.params.id);
  return apiResponse.success(res, null, 'Category deactivated');
});

module.exports = { list, create, update, remove };
