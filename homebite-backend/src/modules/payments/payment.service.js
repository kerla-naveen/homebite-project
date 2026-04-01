const crypto = require('crypto');
const prisma = require('../../config/database');
const razorpay = require('../../config/razorpay');

const createOrder = async (userId, orderId) => {
  const order = await prisma.order.findFirst({
    where: { id: orderId, customerId: userId },
    include: { payment: true },
  });

  if (!order) {
    const err = new Error('Order not found');
    err.statusCode = 404;
    throw err;
  }

  if (order.payment?.status === 'SUCCESS') {
    const err = new Error('Order is already paid');
    err.statusCode = 400;
    throw err;
  }

  if (!razorpay) {
    const err = new Error('Payment service not configured');
    err.statusCode = 503;
    throw err;
  }

  const amount = Math.round(Number(order.total) * 100); // Razorpay expects paise

  const rzpOrder = await razorpay.orders.create({
    amount,
    currency: 'INR',
    receipt: `rcpt_${orderId.slice(0, 35)}`, // max 40 chars
  });

  await prisma.payment.update({
    where: { orderId },
    data: { razorpayOrderId: rzpOrder.id },
  });

  return {
    razorpayOrderId: rzpOrder.id,
    amount: rzpOrder.amount,
    currency: rzpOrder.currency,
    orderId,
    keyId: process.env.RAZORPAY_KEY_ID,
  };
};

const verifyPayment = async (userId, { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature }) => {
  const order = await prisma.order.findFirst({
    where: { id: orderId, customerId: userId },
    include: { payment: true },
  });

  if (!order) {
    const err = new Error('Order not found');
    err.statusCode = 404;
    throw err;
  }

  if (order.payment?.status === 'SUCCESS') {
    const err = new Error('Order is already paid');
    err.statusCode = 400;
    throw err;
  }

  // Verify Razorpay payment signature
  const body = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  let isValid = false;
  try {
    isValid = crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(razorpaySignature)
    );
  } catch {
    isValid = false;
  }

  if (!isValid) {
    const err = new Error('Invalid payment signature');
    err.statusCode = 400;
    throw err;
  }

  await prisma.$transaction([
    prisma.payment.update({
      where: { orderId },
      data: { razorpayOrderId, razorpayPaymentId, razorpaySignature, status: 'SUCCESS' },
    }),
    prisma.order.update({ where: { id: orderId }, data: { status: 'CONFIRMED' } }),
  ]);

  return { success: true, paymentStatus: 'SUCCESS', orderStatus: 'CONFIRMED' };
};

const handleWebhook = async (rawBody, signature) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (webhookSecret) {
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    let isValid = false;
    try {
      isValid = crypto.timingSafeEqual(
        Buffer.from(expectedSignature),
        Buffer.from(signature || '')
      );
    } catch {
      isValid = false;
    }

    if (!isValid) {
      const err = new Error('Invalid webhook signature');
      err.statusCode = 400;
      throw err;
    }
  } else {
    console.warn('[Razorpay] RAZORPAY_WEBHOOK_SECRET not set — skipping signature verification (test mode only)');
  }

  const event = JSON.parse(rawBody);

  if (event.event === 'payment.captured') {
    const payment = event.payload.payment.entity;
    const dbPayment = await prisma.payment.findFirst({
      where: { razorpayOrderId: payment.order_id },
    });

    if (dbPayment && dbPayment.status !== 'SUCCESS') {
      await prisma.$transaction([
        prisma.payment.update({
          where: { id: dbPayment.id },
          data: { razorpayPaymentId: payment.id, status: 'SUCCESS' },
        }),
        prisma.order.update({
          where: { id: dbPayment.orderId },
          data: { status: 'CONFIRMED' },
        }),
      ]);
    }
  }

  return { received: true };
};

const getPaymentByOrder = async (userId, role, orderId) => {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { payment: true } });
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
  return order.payment;
};

module.exports = { createOrder, verifyPayment, handleWebhook, getPaymentByOrder };
