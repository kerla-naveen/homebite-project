const asyncHandler = require('../../utils/asyncHandler');
const apiResponse = require('../../utils/apiResponse');
const foodItemService = require('./foodItem.service');

const create = asyncHandler(async (req, res) => {
  const item = await foodItemService.createFoodItem(req.user.id, req.body);
  return apiResponse.created(res, item, 'Food item created');
});

const list = asyncHandler(async (req, res) => {
  const result = await foodItemService.listFoodItems(req.query);
  return apiResponse.success(res, result);
});

const getById = asyncHandler(async (req, res) => {
  const item = await foodItemService.getFoodItemById(req.params.id);
  return apiResponse.success(res, item);
});

const update = asyncHandler(async (req, res) => {
  const item = await foodItemService.updateFoodItem(req.user.id, req.params.id, req.body);
  return apiResponse.success(res, item, 'Food item updated');
});

const remove = asyncHandler(async (req, res) => {
  await foodItemService.deleteFoodItem(req.user.id, req.params.id);
  return apiResponse.success(res, null, 'Food item deleted');
});

const toggleAvailability = asyncHandler(async (req, res) => {
  const item = await foodItemService.toggleAvailability(req.user.id, req.params.id);
  return apiResponse.success(res, item, `Item is now ${item.isAvailable ? 'available' : 'unavailable'}`);
});

const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) return apiResponse.error(res, 'No file uploaded', 400);
  const imageUrl = `/uploads/${req.file.filename}`;
  const item = await foodItemService.updateImage(req.user.id, req.params.id, imageUrl);
  return apiResponse.success(res, item, 'Image uploaded');
});

const myItems = asyncHandler(async (req, res) => {
  const items = await foodItemService.getVendorFoodItems(req.user.id);
  return apiResponse.success(res, items);
});

module.exports = { create, list, getById, update, remove, toggleAvailability, uploadImage, myItems };
