const asyncHandler = require('../../utils/asyncHandler');
const apiResponse = require('../../utils/apiResponse');
const orderService = require('./order.service');

const placeOrder = asyncHandler(async (req, res) => {
  const { addressId, notes } = req.body;
  const order = await orderService.placeOrder(req.user.id, { addressId, notes });
  return apiResponse.created(res, order, 'Order placed successfully');
});

const getMyOrders = asyncHandler(async (req, res) => {
  const result = await orderService.getMyOrders(req.user.id, req.query);
  return apiResponse.success(res, result);
});

const getOrderById = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderById(req.user.id, req.user.role, req.params.id);
  return apiResponse.success(res, order);
});

const cancelOrder = asyncHandler(async (req, res) => {
  const order = await orderService.cancelOrder(req.user.id, req.params.id);
  return apiResponse.success(res, order, 'Order cancelled');
});

const getVendorOrders = asyncHandler(async (req, res) => {
  const result = await orderService.getVendorOrders(req.user.id, req.query);
  return apiResponse.success(res, result);
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await orderService.updateOrderStatus(req.user.id, req.params.id, status);
  return apiResponse.success(res, order, 'Order status updated');
});

module.exports = { placeOrder, getMyOrders, getOrderById, cancelOrder, getVendorOrders, updateOrderStatus };
