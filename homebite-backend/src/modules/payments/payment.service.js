/**
 * Payment Service — Razorpay Integration Stub
 *
 * To go live: replace stub methods with actual Razorpay SDK calls.
 * All method signatures match what the controller expects — no other file needs to change.
 */
const crypto = require('crypto');
const prisma = require('../../config/database');

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

  // STUB: In production, call razorpay.orders.create({ amount, currency, receipt })
  const stubRazorpayOrderId = `rzp_order_stub_${Date.now()}`;
  const amount = Number(order.total) * 100; // Razorpay expects paise

  await prisma.payment.update({
    where: { orderId },
    data: { razorpayOrderId: stubRazorpayOrderId },
  });

  return {
    razorpayOrderId: stubRazorpayOrderId,
    amount,
    currency: 'INR',
    orderId,
    keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_stub',
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

  // STUB: In production, verify signature using:
  // const body = razorpayOrderId + '|' + razorpayPaymentId;
  // const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(body).digest('hex');
  // if (expectedSignature !== razorpaySignature) throw error;

  // For stub, we accept any non-empty signature
  const isValid = Boolean(razorpaySignature);

  const paymentStatus = isValid ? 'SUCCESS' : 'FAILED';
  const orderStatus = isValid ? 'CONFIRMED' : 'PAYMENT_FAILED';

  await prisma.$transaction([
    prisma.payment.update({
      where: { orderId },
      data: { razorpayOrderId, razorpayPaymentId, razorpaySignature, status: paymentStatus },
    }),
    prisma.order.update({ where: { id: orderId }, data: { status: orderStatus } }),
  ]);

  return { success: isValid, paymentStatus, orderStatus };
};

const handleWebhook = async (body, signature) => {
  // STUB: Verify Razorpay webhook signature and process events
  // In production, use razorpay.webhooks.validateWebhookSignature()
  console.log('[Razorpay Webhook Stub] Received event');
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
