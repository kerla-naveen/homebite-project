const asyncHandler = require('../../utils/asyncHandler');
const apiResponse = require('../../utils/apiResponse');
const vendorService = require('./vendor.service');

const onboard = asyncHandler(async (req, res) => {
  const vendor = await vendorService.onboard(req.user.id, req.body);
  return apiResponse.created(res, vendor, 'Vendor onboarding submitted. Awaiting admin approval.');
});

const getMyProfile = asyncHandler(async (req, res) => {
  const vendor = await vendorService.getMyProfile(req.user.id);
  return apiResponse.success(res, vendor);
});

const updateMyProfile = asyncHandler(async (req, res) => {
  const vendor = await vendorService.updateMyProfile(req.user.id, req.body);
  return apiResponse.success(res, vendor, 'Profile updated');
});

const listVendors = asyncHandler(async (req, res) => {
  const result = await vendorService.listVendors(req.query);
  return apiResponse.success(res, result);
});

const getVendorById = asyncHandler(async (req, res) => {
  const vendor = await vendorService.getVendorById(req.params.id);
  return apiResponse.success(res, vendor);
});

const getDashboard = asyncHandler(async (req, res) => {
  const summary = await vendorService.getDashboardSummary(req.user.id);
  return apiResponse.success(res, summary);
});

const getEarnings = asyncHandler(async (req, res) => {
  const summary = await vendorService.getEarningsSummary(req.user.id);
  return apiResponse.success(res, summary);
});

module.exports = { onboard, getMyProfile, updateMyProfile, listVendors, getVendorById, getDashboard, getEarnings };
