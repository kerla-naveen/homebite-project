const asyncHandler = require('../../utils/asyncHandler');
const apiResponse = require('../../utils/apiResponse');
const authService = require('./auth.service');
const prisma = require('../../config/database');

const register = asyncHandler(async (req, res) => {
  const { name, email, phone, password, role } = req.body;
  const result = await authService.register({ name, email, phone, password, role });
  return apiResponse.created(res, result, 'Registration successful');
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login({ email, password });
  return apiResponse.success(res, result, 'Login successful');
});

const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return apiResponse.error(res, 'Refresh token required', 400);
  const tokens = await authService.refreshTokens(refreshToken);
  return apiResponse.success(res, tokens, 'Tokens refreshed');
});

const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user.id);
  return apiResponse.success(res, null, 'Logged out successfully');
});

const getMe = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true, name: true, email: true, phone: true,
      role: true, avatarUrl: true, isEmailVerified: true, createdAt: true,
      vendor: { select: { id: true, businessName: true, status: true, isAcceptingOrders: true } },
    },
  });
  return apiResponse.success(res, user);
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await authService.changePassword(req.user.id, { currentPassword, newPassword });
  return apiResponse.success(res, null, 'Password changed successfully');
});

module.exports = { register, login, refreshToken, logout, getMe, changePassword };
