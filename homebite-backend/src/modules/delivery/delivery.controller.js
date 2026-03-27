const asyncHandler = require('../../utils/asyncHandler');
const apiResponse = require('../../utils/apiResponse');
const deliveryService = require('./delivery.service');

const createShipment = asyncHandler(async (req, res) => {
  const result = await deliveryService.createShipment(req.params.orderId);
  return apiResponse.success(res, result, 'Shipment created');
});

const trackShipment = asyncHandler(async (req, res) => {
  const tracking = await deliveryService.trackShipment(req.params.orderId);
  return apiResponse.success(res, tracking);
});

const handleWebhook = asyncHandler(async (req, res) => {
  const result = await deliveryService.handleWebhook(req.body);
  return res.status(200).json(result);
});

module.exports = { createShipment, trackShipment, handleWebhook };
