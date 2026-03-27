const prisma = require('../../config/database');
const { paginate, paginatedResponse } = require('../../utils/paginate');

const getVendorFromUser = async (userId) => {
  const vendor = await prisma.vendor.findUnique({ where: { userId } });
  if (!vendor) {
    const err = new Error('Vendor profile not found');
    err.statusCode = 404;
    throw err;
  }
  if (vendor.status !== 'APPROVED') {
    const err = new Error('Vendor account is not approved yet');
    err.statusCode = 403;
    throw err;
  }
  return vendor;
};

const createFoodItem = async (userId, data) => {
  const vendor = await getVendorFromUser(userId);
  return prisma.foodItem.create({
    data: { ...data, vendorId: vendor.id },
    include: { category: true },
  });
};

const listFoodItems = async (query) => {
  const { skip, take, page, limit } = paginate(query);
  const { vendorId, categoryId, dietaryTag, search, minPrice, maxPrice } = query;

  const where = {
    isDeleted: false,
    isAvailable: true,
    ...(vendorId && { vendorId }),
    ...(categoryId && { categoryId }),
    ...(dietaryTag && { dietaryTag }),
    ...(search && { name: { contains: search } }),
    ...((minPrice || maxPrice) && {
      price: {
        ...(minPrice && { gte: parseFloat(minPrice) }),
        ...(maxPrice && { lte: parseFloat(maxPrice) }),
      },
    }),
  };

  const [items, total] = await Promise.all([
    prisma.foodItem.findMany({
      where, skip, take,
      include: {
        vendor: { select: { id: true, businessName: true, city: true } },
        category: { select: { id: true, name: true } },
      },
      orderBy: { sortOrder: 'asc' },
    }),
    prisma.foodItem.count({ where }),
  ]);

  return paginatedResponse(items, total, page, limit);
};

const getFoodItemById = async (id) => {
  const item = await prisma.foodItem.findFirst({
    where: { id, isDeleted: false },
    include: {
      vendor: { select: { id: true, businessName: true, city: true, status: true } },
      category: true,
      reviews: {
        where: { isDeleted: false },
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { customer: { select: { name: true, avatarUrl: true } } },
      },
    },
  });
  if (!item) {
    const err = new Error('Food item not found');
    err.statusCode = 404;
    throw err;
  }
  return item;
};

const updateFoodItem = async (userId, id, data) => {
  const vendor = await getVendorFromUser(userId);
  const item = await prisma.foodItem.findFirst({ where: { id, vendorId: vendor.id, isDeleted: false } });
  if (!item) {
    const err = new Error('Food item not found');
    err.statusCode = 404;
    throw err;
  }
  return prisma.foodItem.update({ where: { id }, data, include: { category: true } });
};

const deleteFoodItem = async (userId, id) => {
  const vendor = await getVendorFromUser(userId);
  const item = await prisma.foodItem.findFirst({ where: { id, vendorId: vendor.id } });
  if (!item) {
    const err = new Error('Food item not found');
    err.statusCode = 404;
    throw err;
  }
  await prisma.foodItem.update({ where: { id }, data: { isDeleted: true } });
};

const toggleAvailability = async (userId, id) => {
  const vendor = await getVendorFromUser(userId);
  const item = await prisma.foodItem.findFirst({ where: { id, vendorId: vendor.id, isDeleted: false } });
  if (!item) {
    const err = new Error('Food item not found');
    err.statusCode = 404;
    throw err;
  }
  return prisma.foodItem.update({ where: { id }, data: { isAvailable: !item.isAvailable } });
};

const updateImage = async (userId, id, imageUrl) => {
  const vendor = await getVendorFromUser(userId);
  const item = await prisma.foodItem.findFirst({ where: { id, vendorId: vendor.id } });
  if (!item) {
    const err = new Error('Food item not found');
    err.statusCode = 404;
    throw err;
  }
  return prisma.foodItem.update({ where: { id }, data: { imageUrl } });
};

const getVendorFoodItems = async (userId) => {
  const vendor = await prisma.vendor.findUnique({ where: { userId } });
  if (!vendor) {
    const err = new Error('Vendor profile not found');
    err.statusCode = 404;
    throw err;
  }
  return prisma.foodItem.findMany({
    where: { vendorId: vendor.id, isDeleted: false },
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  });
};

module.exports = {
  createFoodItem, listFoodItems, getFoodItemById, updateFoodItem,
  deleteFoodItem, toggleAvailability, updateImage, getVendorFoodItems,
};
