const prisma = require('../../config/database');
const { paginate, paginatedResponse } = require('../../utils/paginate');

const getDashboardStats = async () => {
  const [totalUsers, totalVendors, pendingVendors, totalOrders, revenue] = await Promise.all([
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.vendor.count({ where: { status: 'APPROVED' } }),
    prisma.vendor.count({ where: { status: 'PENDING' } }),
    prisma.order.count(),
    prisma.payment.aggregate({
      where: { status: 'SUCCESS' },
      _sum: { amount: true },
    }),
  ]);

  return {
    totalUsers,
    totalVendors,
    pendingVendors,
    totalOrders,
    totalRevenue: Number(revenue._sum.amount || 0),
  };
};

const getPendingVendors = async (query) => {
  const { skip, take, page, limit } = paginate(query);
  const where = { status: 'PENDING' };

  const [vendors, total] = await Promise.all([
    prisma.vendor.findMany({
      where, skip, take,
      include: { user: { select: { id: true, name: true, email: true, phone: true } } },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.vendor.count({ where }),
  ]);

  return paginatedResponse(vendors, total, page, limit);
};

const getAllVendors = async (query) => {
  const { skip, take, page, limit } = paginate(query);
  const where = query.status ? { status: query.status } : {};

  const [vendors, total] = await Promise.all([
    prisma.vendor.findMany({
      where, skip, take,
      include: { user: { select: { name: true, email: true, phone: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.vendor.count({ where }),
  ]);

  return paginatedResponse(vendors, total, page, limit);
};

const getVendorById = async (id) => {
  const vendor = await prisma.vendor.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      foodItems: { where: { isDeleted: false } },
      _count: { select: { orders: true, reviews: true } },
    },
  });
  if (!vendor) {
    const err = new Error('Vendor not found');
    err.statusCode = 404;
    throw err;
  }
  return vendor;
};

const approveVendor = async (id) => {
  return prisma.vendor.update({
    where: { id },
    data: { status: 'APPROVED', approvedAt: new Date(), rejectionReason: null },
  });
};

const rejectVendor = async (id, reason) => {
  return prisma.vendor.update({
    where: { id },
    data: { status: 'REJECTED', rejectionReason: reason },
  });
};

const suspendVendor = async (id) => {
  return prisma.vendor.update({ where: { id }, data: { status: 'SUSPENDED', isAcceptingOrders: false } });
};

const getAllUsers = async (query) => {
  const { skip, take, page, limit } = paginate(query);
  const where = {
    role: { not: 'ADMIN' },
    ...(query.role && { role: query.role }),
    ...(query.search && {
      OR: [
        { name: { contains: query.search } },
        { email: { contains: query.search } },
      ],
    }),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where, skip, take,
      select: { id: true, name: true, email: true, phone: true, role: true, isBlocked: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ]);

  return paginatedResponse(users, total, page, limit);
};

const toggleBlockUser = async (id) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  return prisma.user.update({ where: { id }, data: { isBlocked: !user.isBlocked } });
};

const getAllOrders = async (query) => {
  const { skip, take, page, limit } = paginate(query);
  const where = { ...(query.status && { status: query.status }) };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where, skip, take,
      include: {
        customer: { select: { name: true, email: true } },
        vendor: { select: { businessName: true } },
        payment: { select: { status: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.order.count({ where }),
  ]);

  return paginatedResponse(orders, total, page, limit);
};

module.exports = {
  getDashboardStats, getPendingVendors, getAllVendors, getVendorById,
  approveVendor, rejectVendor, suspendVendor, getAllUsers, toggleBlockUser, getAllOrders,
};
