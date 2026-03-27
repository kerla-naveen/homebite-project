const asyncHandler = require('../../utils/asyncHandler');
const apiResponse = require('../../utils/apiResponse');
const orderService = require('./order.service');

// ─── Customer ─────────────────────────────────────────────────────────────────

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

// ─── Vendor ───────────────────────────────────────────────────────────────────

const getVendorOrders = asyncHandler(async (req, res) => {
  const result = await orderService.getVendorOrders(req.user.id, req.query);
  return apiResponse.success(res, result);
});

// CONFIRMED → ACCEPTED (explicit vendor acceptance)
const acceptOrder = asyncHandler(async (req, res) => {
  const order = await orderService.acceptOrder(req.user.id, req.params.id);
  return apiResponse.success(res, order, 'Order accepted');
});

// CONFIRMED or ACCEPTED → CANCELLED
const rejectOrder = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const order = await orderService.rejectOrder(req.user.id, req.params.id, reason);
  return apiResponse.success(res, order, 'Order rejected');
});

// ACCEPTED → PREPARING → READY_FOR_PICKUP → OUT_FOR_DELIVERY → DELIVERED
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await orderService.updateOrderStatus(req.user.id, req.params.id, status);
  return apiResponse.success(res, order, 'Order status updated');
});

module.exports = {
  placeOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getVendorOrders,
  acceptOrder,
  rejectOrder,
  updateOrderStatus,
};
