const asyncHandler = require('../../utils/asyncHandler');
const apiResponse = require('../../utils/apiResponse');
const adminService = require('./admin.service');

const getDashboard = asyncHandler(async (req, res) => {
  const stats = await adminService.getDashboardStats();
  return apiResponse.success(res, stats);
});

const getPendingVendors = asyncHandler(async (req, res) => {
  const result = await adminService.getPendingVendors(req.query);
  return apiResponse.success(res, result);
});

const getAllVendors = asyncHandler(async (req, res) => {
  const result = await adminService.getAllVendors(req.query);
  return apiResponse.success(res, result);
});

const getVendorById = asyncHandler(async (req, res) => {
  const vendor = await adminService.getVendorById(req.params.id);
  return apiResponse.success(res, vendor);
});

const approveVendor = asyncHandler(async (req, res) => {
  const vendor = await adminService.approveVendor(req.params.id);
  return apiResponse.success(res, vendor, 'Vendor approved');
});

const rejectVendor = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const vendor = await adminService.rejectVendor(req.params.id, reason);
  return apiResponse.success(res, vendor, 'Vendor rejected');
});

const suspendVendor = asyncHandler(async (req, res) => {
  const vendor = await adminService.suspendVendor(req.params.id);
  return apiResponse.success(res, vendor, 'Vendor suspended');
});

const getAllUsers = asyncHandler(async (req, res) => {
  const result = await adminService.getAllUsers(req.query);
  return apiResponse.success(res, result);
});

const toggleBlockUser = asyncHandler(async (req, res) => {
  const user = await adminService.toggleBlockUser(req.params.id);
  return apiResponse.success(res, user, `User ${user.isBlocked ? 'blocked' : 'unblocked'}`);
});

const getAllOrders = asyncHandler(async (req, res) => {
  const result = await adminService.getAllOrders(req.query);
  return apiResponse.success(res, result);
});

module.exports = {
  getDashboard, getPendingVendors, getAllVendors, getVendorById,
  approveVendor, rejectVendor, suspendVendor, getAllUsers, toggleBlockUser, getAllOrders,
};
