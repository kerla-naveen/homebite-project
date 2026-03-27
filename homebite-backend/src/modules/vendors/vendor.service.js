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

module.exports = { onboard, getMyProfile, updateMyProfile, listVendors, getVendorById };
