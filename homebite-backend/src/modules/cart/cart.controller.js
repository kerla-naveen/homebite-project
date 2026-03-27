const asyncHandler = require('../../utils/asyncHandler');
const apiResponse = require('../../utils/apiResponse');
const cartService = require('./cart.service');

const getCart = asyncHandler(async (req, res) => {
  const cart = await cartService.getCart(req.user.id);
  return apiResponse.success(res, cart);
});

const addItem = asyncHandler(async (req, res) => {
  const { foodItemId, quantity } = req.body;
  const item = await cartService.addItem(req.user.id, { foodItemId, quantity });
  return apiResponse.success(res, item, 'Item added to cart');
});

const updateItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const item = await cartService.updateItem(req.user.id, req.params.itemId, quantity);
  return apiResponse.success(res, item, 'Cart updated');
});

const removeItem = asyncHandler(async (req, res) => {
  await cartService.removeItem(req.user.id, req.params.itemId);
  return apiResponse.success(res, null, 'Item removed from cart');
});

const clearCart = asyncHandler(async (req, res) => {
  await cartService.clearCart(req.user.id);
  return apiResponse.success(res, null, 'Cart cleared');
});

module.exports = { getCart, addItem, updateItem, removeItem, clearCart };
