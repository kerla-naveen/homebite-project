const asyncHandler = require('../../utils/asyncHandler');
const apiResponse = require('../../utils/apiResponse');
const paymentService = require('./payment.service');

const createOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.body;
  const result = await paymentService.createOrder(req.user.id, orderId);
  return apiResponse.success(res, result, 'Payment order created');
});

const verifyPayment = asyncHandler(async (req, res) => {
  const result = await paymentService.verifyPayment(req.user.id, req.body);
  return apiResponse.success(res, result, result.success ? 'Payment verified' : 'Payment failed');
});

const handleWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  const result = await paymentService.handleWebhook(req.body, signature);
  return res.status(200).json(result);
});

const getPaymentByOrder = asyncHandler(async (req, res) => {
  const payment = await paymentService.getPaymentByOrder(req.user.id, req.user.role, req.params.orderId);
  return apiResponse.success(res, payment);
});

module.exports = { createOrder, verifyPayment, handleWebhook, getPaymentByOrder };
