const asyncHandler = require('../../utils/asyncHandler');
const apiResponse = require('../../utils/apiResponse');
const reviewService = require('./review.service');

const create = asyncHandler(async (req, res) => {
  const review = await reviewService.createReview(req.user.id, req.body);
  return apiResponse.created(res, review, 'Review submitted');
});

const byFoodItem = asyncHandler(async (req, res) => {
  const reviews = await reviewService.getReviewsByFoodItem(req.params.foodItemId);
  return apiResponse.success(res, reviews);
});

const byVendor = asyncHandler(async (req, res) => {
  const reviews = await reviewService.getReviewsByVendor(req.params.vendorId);
  return apiResponse.success(res, reviews);
});

const remove = asyncHandler(async (req, res) => {
  await reviewService.deleteReview(req.user.id, req.user.role, req.params.id);
  return apiResponse.success(res, null, 'Review deleted');
});

module.exports = { create, byFoodItem, byVendor, remove };
