const prisma = require('../../config/database');

const getProfile = async (userId) => {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true, name: true, email: true, phone: true,
      role: true, avatarUrl: true, isEmailVerified: true, createdAt: true,
      addresses: true,
    },
  });
};

const updateProfile = async (userId, data) => {
  const { name, phone, avatarUrl } = data;
  return prisma.user.update({
    where: { id: userId },
    data: { name, phone, avatarUrl },
    select: { id: true, name: true, email: true, phone: true, avatarUrl: true },
  });
};

const addAddress = async (userId, addressData) => {
  const { label, line1, line2, city, state, pincode, lat, lng, isDefault } = addressData;

  if (isDefault) {
    await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
  }

  return prisma.address.create({
    data: { userId, label, line1, line2, city, state, pincode, lat, lng, isDefault: isDefault || false },
  });
};

const updateAddress = async (userId, addressId, addressData) => {
  const address = await prisma.address.findFirst({ where: { id: addressId, userId } });
  if (!address) {
    const err = new Error('Address not found');
    err.statusCode = 404;
    throw err;
  }

  if (addressData.isDefault) {
    await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
  }

  return prisma.address.update({ where: { id: addressId }, data: addressData });
};

const deleteAddress = async (userId, addressId) => {
  const address = await prisma.address.findFirst({ where: { id: addressId, userId } });
  if (!address) {
    const err = new Error('Address not found');
    err.statusCode = 404;
    throw err;
  }
  await prisma.address.delete({ where: { id: addressId } });
};

const getAddresses = async (userId) => {
  return prisma.address.findMany({ where: { userId }, orderBy: { isDefault: 'desc' } });
};

module.exports = { getProfile, updateProfile, addAddress, updateAddress, deleteAddress, getAddresses };
