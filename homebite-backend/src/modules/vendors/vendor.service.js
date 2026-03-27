const prisma = require('../../config/database');
const { paginate, paginatedResponse } = require('../../utils/paginate');

const onboard = async (userId, data) => {
  const existing = await prisma.vendor.findUnique({ where: { userId } });
  if (existing) {
    const err = new Error('Vendor profile already exists');
    err.statusCode = 409;
    throw err;
  }

  return prisma.vendor.create({
    data: {
      userId,
      businessName: data.businessName,
      description: data.description,
      fssaiNumber: data.fssaiNumber,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      lat: data.lat,
      lng: data.lng,
      bankAccountNumber: data.bankAccountNumber,
      bankIfsc: data.bankIfsc,
      bankAccountName: data.bankAccountName,
      upiId: data.upiId,
    },
  });
};

const getMyProfile = async (userId) => {
  const vendor = await prisma.vendor.findUnique({
    where: { userId },
    include: { user: { select: { name: true, email: true, phone: true } } },
  });
  if (!vendor) {
    const err = new Error('Vendor profile not found');
    err.statusCode = 404;
    throw err;
  }
  return vendor;
};

const updateMyProfile = async (userId, data) => {
  const vendor = await prisma.vendor.findUnique({ where: { userId } });
  if (!vendor) {
    const err = new Error('Vendor profile not found');
    err.statusCode = 404;
    throw err;
  }

  return prisma.vendor.update({
    where: { userId },
    data: {
      businessName: data.businessName,
      description: data.description,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      isAcceptingOrders: data.isAcceptingOrders,
      upiId: data.upiId,
    },
  });
};

const listVendors = async (query) => {
  const { skip, take, page, limit } = paginate(query);
  const { city, search } = query;

  const where = {
    status: 'APPROVED',
    ...(city && { city: { contains: city } }),
    ...(search && {
      businessName: { contains: search },
    }),
  };

  const [vendors, total] = await Promise.all([
    prisma.vendor.findMany({
      where,
      skip,
      take,
      select: {
        id: true, businessName: true, description: true, logoUrl: true,
        bannerUrl: true, city: true, state: true, isAcceptingOrders: true,
        _count: { select: { foodItems: true, reviews: true } },
      },
      orderBy: { approvedAt: 'desc' },
    }),
    prisma.vendor.count({ where }),
  ]);

  return paginatedResponse(vendors, total, page, limit);
};

const getVendorById = async (id) => {
  const vendor = await prisma.vendor.findFirst({
    where: { id, status: 'APPROVED' },
    include: {
      foodItems: {
        where: { isAvailable: true, isDeleted: false },
        include: { category: { select: { id: true, name: true, slug: true } } },
        orderBy: { sortOrder: 'asc' },
      },
    },
  });
  if (!vendor) {
    const err = new Error('Vendor not found');
    err.statusCode = 404;
    throw err;
  }
  return vendor;
};

const getDashboardSummary = async (userId) => {
  const vendor = await prisma.vendor.findUnique({ where: { userId } });
  if (!vendor) {
    const err = new Error('Vendor profile not found');
    err.statusCode = 404;
    throw err;
  }

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [todayOrders, pendingOrders, monthRevenue, totalMenuItems, unavailableItems] = await Promise.all([
    prisma.order.count({
      where: { vendorId: vendor.id, createdAt: { gte: startOfToday } },
    }),
    prisma.order.count({
      where: { vendorId: vendor.id, status: { in: ['CONFIRMED', 'PREPARING'] } },
    }),
    prisma.payment.aggregate({
      where: {
        order: { vendorId: vendor.id, createdAt: { gte: startOfMonth } },
        status: 'SUCCESS',
      },
      _sum: { amount: true },
    }),
    prisma.foodItem.count({ where: { vendorId: vendor.id, isDeleted: false } }),
    prisma.foodItem.count({ where: { vendorId: vendor.id, isDeleted: false, isAvailable: false } }),
  ]);

  return {
    vendor: {
      id: vendor.id,
      businessName: vendor.businessName,
      status: vendor.status,
      isAcceptingOrders: vendor.isAcceptingOrders,
      logoUrl: vendor.logoUrl,
    },
    stats: {
      todayOrders,
      pendingOrders,
      monthRevenue: Number(monthRevenue._sum.amount || 0),
      totalMenuItems,
      unavailableItems,
    },
  };
};

const getEarningsSummary = async (userId) => {
  const vendor = await prisma.vendor.findUnique({ where: { userId } });
  if (!vendor) {
    const err = new Error('Vendor profile not found');
    err.statusCode = 404;
    throw err;
  }

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay()); // Sunday
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const deliveredWhere = { vendorId: vendor.id, status: 'DELIVERED' };

  const [
    totalOrders,
    deliveredOrders,
    cancelledOrders,
    activeOrders,
    allTimeEarnings,
    todayEarnings,
    weekEarnings,
    monthEarnings,
    topItems,
  ] = await Promise.all([
    prisma.order.count({ where: { vendorId: vendor.id } }),
    prisma.order.count({ where: deliveredWhere }),
    prisma.order.count({ where: { vendorId: vendor.id, status: 'CANCELLED' } }),
    prisma.order.count({
      where: {
        vendorId: vendor.id,
        status: { in: ['CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY'] },
      },
    }),
    prisma.payment.aggregate({
      where: { order: { vendorId: vendor.id }, status: 'SUCCESS' },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: { order: { vendorId: vendor.id, createdAt: { gte: startOfToday } }, status: 'SUCCESS' },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: { order: { vendorId: vendor.id, createdAt: { gte: startOfWeek } }, status: 'SUCCESS' },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: { order: { vendorId: vendor.id, createdAt: { gte: startOfMonth } }, status: 'SUCCESS' },
      _sum: { amount: true },
    }),
    // Top 5 food items by quantity sold across delivered orders
    prisma.orderItem.groupBy({
      by: ['foodItemId', 'name'],
      where: { order: { vendorId: vendor.id, status: 'DELIVERED' } },
      _sum: { quantity: true, total: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    }),
  ]);

  return {
    orders: {
      total: totalOrders,
      delivered: deliveredOrders,
      cancelled: cancelledOrders,
      active: activeOrders,
    },
    earnings: {
      allTime: Number(allTimeEarnings._sum.amount || 0),
      today: Number(todayEarnings._sum.amount || 0),
      thisWeek: Number(weekEarnings._sum.amount || 0),
      thisMonth: Number(monthEarnings._sum.amount || 0),
    },
    topItems: topItems.map((item) => ({
      foodItemId: item.foodItemId,
      name: item.name,
      totalOrdered: item._sum.quantity || 0,
      totalRevenue: Number(item._sum.total || 0),
    })),
  };
};

module.exports = { onboard, getMyProfile, updateMyProfile, listVendors, getVendorById, getDashboardSummary, getEarningsSummary };
