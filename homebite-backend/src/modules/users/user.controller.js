const asyncHandler = require('../../utils/asyncHandler');
const apiResponse = require('../../utils/apiResponse');
const userService = require('./user.service');

const getProfile = asyncHandler(async (req, res) => {
  const user = await userService.getProfile(req.user.id);
  return apiResponse.success(res, user);
});

const updateProfile = asyncHandler(async (req, res) => {
  const user = await userService.updateProfile(req.user.id, req.body);
  return apiResponse.success(res, user, 'Profile updated');
});

const addAddress = asyncHandler(async (req, res) => {
  const address = await userService.addAddress(req.user.id, req.body);
  return apiResponse.created(res, address, 'Address added');
});

const updateAddress = asyncHandler(async (req, res) => {
  const address = await userService.updateAddress(req.user.id, req.params.id, req.body);
  return apiResponse.success(res, address, 'Address updated');
});

const deleteAddress = asyncHandler(async (req, res) => {
  await userService.deleteAddress(req.user.id, req.params.id);
  return apiResponse.success(res, null, 'Address deleted');
});

const getAddresses = asyncHandler(async (req, res) => {
  const addresses = await userService.getAddresses(req.user.id);
  return apiResponse.success(res, addresses);
});

module.exports = { getProfile, updateProfile, addAddress, updateAddress, deleteAddress, getAddresses };
