const prisma = require('../../config/database');
const { paginate, paginatedResponse } = require('../../utils/paginate');
const {
  ORDER_STATUS,
  VENDOR_ALLOWED_STATUS_TRANSITIONS,
  VENDOR_REJECTABLE_STATUSES,
} = require('../../utils/constants');

const DELIVERY_FEE = 40;

// ─── Customer ─────────────────────────────────────────────────────────────────

const placeOrder = async (userId, { addressId, notes }) => {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: { foodItem: { include: { vendor: true } } },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    const err = new Error('Cart is empty');
    err.statusCode = 400;
    throw err;
  }

  const address = await prisma.address.findFirst({ where: { id: addressId, userId } });
  if (!address) {
    const err = new Error('Delivery address not found');
    err.statusCode = 404;
    throw err;
  }

  const vendorId = cart.vendorId;
  const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } });
  if (!vendor || vendor.status !== 'APPROVED') {
    const err = new Error('Vendor is not available');
    err.statusCode = 400;
    throw err;
  }

  if (!vendor.isAcceptingOrders) {
    const err = new Error('Vendor is not accepting orders right now');
    err.statusCode = 400;
    throw err;
  }

  const subtotal = cart.items.reduce((sum, item) => {
    const price = Number(item.foodItem.discountedPrice || item.foodItem.price);
    return sum + price * item.quantity;
  }, 0);

  const total = subtotal + DELIVERY_FEE;

  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        customerId: userId,
        vendorId,
        addressId,
        subtotal,
        deliveryFee: DELIVERY_FEE,
        total,
        notes,
        status: ORDER_STATUS.PENDING_PAYMENT,
        items: {
          create: cart.items.map((item) => ({
            foodItemId: item.foodItemId,
            name: item.foodItem.name,
            price: Number(item.foodItem.discountedPrice || item.foodItem.price),
            quantity: item.quantity,
            total: Number(item.foodItem.discountedPrice || item.foodItem.price) * item.quantity,
          })),
        },
        payment: {
          create: { amount: total, status: 'PENDING' },
        },
        delivery: {
          create: { status: 'NOT_INITIATED' },
        },
      },
      include: { items: true, payment: true },
    });

    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
    await tx.cart.update({ where: { id: cart.id }, data: { vendorId: null } });

    return newOrder;
  });

  return order;
};

const getMyOrders = async (userId, query) => {
  const { skip, take, page, limit } = paginate(query);
  const where = {
    customerId: userId,
    ...(query.status && { status: query.status }),
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where, skip, take,
      include: {
        vendor: { select: { id: true, businessName: true, logoUrl: true } },
        items: { include: { foodItem: { select: { name: true, imageUrl: true } } } },
        payment: { select: { status: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.order.count({ where }),
  ]);

  return paginatedResponse(orders, total, page, limit);
};

const getOrderById = async (userId, role, orderId) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      customer: { select: { id: true, name: true, phone: true } },
      vendor: { select: { id: true, businessName: true, logoUrl: true, userId: true } },
      address: true,
      items: { include: { foodItem: { select: { name: true, imageUrl: true } } } },
      payment: true,
      delivery: true,
    },
  });

  if (!order) {
    const err = new Error('Order not found');
    err.statusCode = 404;
    throw err;
  }

  if (role === 'CUSTOMER' && order.customerId !== userId) {
    const err = new Error('Forbidden');
    err.statusCode = 403;
    throw err;
  }

  if (role === 'VENDOR') {
    const vendor = await prisma.vendor.findUnique({ where: { userId } });
    if (!vendor || order.vendorId !== vendor.id) {
      const err = new Error('Forbidden');
      err.statusCode = 403;
      throw err;
    }
  }

  return order;
};

// Customer can cancel while order is pending payment or not yet being prepared
const cancelOrder = async (userId, orderId) => {
  const order = await prisma.order.findFirst({ where: { id: orderId, customerId: userId } });
  if (!order) {
    const err = new Error('Order not found');
    err.statusCode = 404;
    throw err;
  }

  const cancellableStatuses = [
    ORDER_STATUS.PENDING_PAYMENT,
    ORDER_STATUS.CONFIRMED,
    ORDER_STATUS.ACCEPTED,
  ];

  if (!cancellableStatuses.includes(order.status)) {
    const err = new Error('Order cannot be cancelled once preparation has started');
    err.statusCode = 400;
    throw err;
  }

  return prisma.order.update({
    where: { id: orderId },
    data: { status: ORDER_STATUS.CANCELLED, cancelReason: 'Cancelled by customer' },
  });
};

// ─── Vendor ───────────────────────────────────────────────────────────────────

const getVendorOrders = async (userId, query) => {
  const vendor = await prisma.vendor.findUnique({ where: { userId } });
  if (!vendor) {
    const err = new Error('Vendor not found');
    err.statusCode = 404;
    throw err;
  }

  const { skip, take, page, limit } = paginate(query);

  // Support comma-separated ?status=CONFIRMED,ACCEPTED for multi-status filter
  let statusFilter;
  if (query.status) {
    const statuses = query.status.split(',').map((s) => s.trim());
    statusFilter = statuses.length === 1 ? statuses[0] : { in: statuses };
  }

  const where = {
    vendorId: vendor.id,
    ...(statusFilter && { status: statusFilter }),
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where, skip, take,
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        address: true,
        items: true,
        payment: { select: { status: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.order.count({ where }),
  ]);

  return paginatedResponse(orders, total, page, limit);
};

// Dedicated accept: CONFIRMED → ACCEPTED
const acceptOrder = async (userId, orderId) => {
  const vendor = await prisma.vendor.findUnique({ where: { userId } });
  if (!vendor) {
    const err = new Error('Vendor not found');
    err.statusCode = 404;
    throw err;
  }

  const order = await prisma.order.findFirst({ where: { id: orderId, vendorId: vendor.id } });
  if (!order) {
    const err = new Error('Order not found');
    err.statusCode = 404;
    throw err;
  }

  if (order.status !== ORDER_STATUS.CONFIRMED) {
    const err = new Error('Only confirmed (paid) orders can be accepted');
    err.statusCode = 400;
    throw err;
  }

  return prisma.order.update({
    where: { id: orderId },
    data: { status: ORDER_STATUS.ACCEPTED },
    include: {
      customer: { select: { id: true, name: true, phone: true } },
      items: true,
    },
  });
};

// Dedicated reject: CONFIRMED or ACCEPTED → CANCELLED
const rejectOrder = async (userId, orderId, reason) => {
  const vendor = await prisma.vendor.findUnique({ where: { userId } });
  if (!vendor) {
    const err = new Error('Vendor not found');
    err.statusCode = 404;
    throw err;
  }

  const order = await prisma.order.findFirst({ where: { id: orderId, vendorId: vendor.id } });
  if (!order) {
    const err = new Error('Order not found');
    err.statusCode = 404;
    throw err;
  }

  if (!VENDOR_REJECTABLE_STATUSES.includes(order.status)) {
    const err = new Error(`Orders in status "${order.status}" cannot be rejected`);
    err.statusCode = 400;
    throw err;
  }

  return prisma.order.update({
    where: { id: orderId },
    data: { status: ORDER_STATUS.CANCELLED, cancelReason: reason || 'Rejected by vendor' },
  });
};

// Generic status advance: ACCEPTED → PREPARING → READY_FOR_PICKUP → OUT_FOR_DELIVERY → DELIVERED
const updateOrderStatus = async (userId, orderId, newStatus) => {
  const vendor = await prisma.vendor.findUnique({ where: { userId } });
  if (!vendor) {
    const err = new Error('Vendor not found');
    err.statusCode = 404;
    throw err;
  }

  const order = await prisma.order.findFirst({ where: { id: orderId, vendorId: vendor.id } });
  if (!order) {
    const err = new Error('Order not found');
    err.statusCode = 404;
    throw err;
  }

  const allowed = VENDOR_ALLOWED_STATUS_TRANSITIONS[order.status];
  if (!allowed || !allowed.includes(newStatus)) {
    const err = new Error(`Cannot transition from ${order.status} to ${newStatus}`);
    err.statusCode = 400;
    throw err;
  }

  return prisma.order.update({ where: { id: orderId }, data: { status: newStatus } });
};

module.exports = {
  placeOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getVendorOrders,
  acceptOrder,
  rejectOrder,
  updateOrderStatus,
};
