/**
 * Delivery Service — Shiprocket Integration Stub
 *
 * To go live: replace stub methods with Shiprocket REST API calls.
 * Auth token for Shiprocket is obtained via POST /auth/local (email + password).
 */
const prisma = require('../../config/database');

const createShipment = async (orderId) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { delivery: true, address: true, items: true, customer: true, vendor: true },
  });

  if (!order) {
    const err = new Error('Order not found');
    err.statusCode = 404;
    throw err;
  }

  // STUB: Call Shiprocket POST /orders/create/adhoc
  const stubAwb = `AWB${Date.now()}`;
  const estimatedDelivery = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // +3 days

  await prisma.delivery.update({
    where: { orderId },
    data: {
      shiprocketOrderId: `sr_order_stub_${Date.now()}`,
      shiprocketShipmentId: `sr_ship_stub_${Date.now()}`,
      awbCode: stubAwb,
      courierName: 'Delhivery (Stub)',
      trackingUrl: `https://www.delhivery.com/track/package/${stubAwb}`,
      status: 'PICKUP_SCHEDULED',
      estimatedDelivery,
    },
  });

  await prisma.order.update({ where: { id: orderId }, data: { status: 'OUT_FOR_DELIVERY' } });

  return { awbCode: stubAwb, estimatedDelivery, courierName: 'Delhivery (Stub)' };
};

const trackShipment = async (orderId) => {
  const delivery = await prisma.delivery.findUnique({ where: { orderId } });
  if (!delivery) {
    const err = new Error('Delivery not found');
    err.statusCode = 404;
    throw err;
  }

  // STUB: Call Shiprocket GET /courier/track/awb/{awb_code}
  return {
    awbCode: delivery.awbCode,
    courierName: delivery.courierName,
    trackingUrl: delivery.trackingUrl,
    status: delivery.status,
    estimatedDelivery: delivery.estimatedDelivery,
    deliveredAt: delivery.deliveredAt,
    // Stub tracking events
    events: [
      { timestamp: new Date().toISOString(), description: 'Shipment picked up', location: 'Origin Hub' },
      { timestamp: new Date().toISOString(), description: 'In transit', location: 'Hub City' },
    ],
  };
};

const handleWebhook = async (body) => {
  // STUB: Parse Shiprocket webhook and update delivery status
  console.log('[Shiprocket Webhook Stub] Received event:', body?.event);
  return { received: true };
};

module.exports = { createShipment, trackShipment, handleWebhook };
