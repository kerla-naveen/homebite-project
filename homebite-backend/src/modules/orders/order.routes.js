const router = require('express').Router();
const Joi = require('joi');
const auth = require('../../middleware/auth');
const roleGuard = require('../../middleware/roleGuard');
const validate = require('../../middleware/validate');
const controller = require('./order.controller');

router.use(auth);

// ─── Customer ─────────────────────────────────────────────────────────────────

const placeOrderSchema = Joi.object({
  addressId: Joi.string().required(),
  notes: Joi.string().max(300).optional().allow(''),
});

router.post('/', roleGuard('CUSTOMER'), validate(placeOrderSchema), controller.placeOrder);
router.get('/', roleGuard('CUSTOMER'), controller.getMyOrders);
router.patch('/:id/cancel', roleGuard('CUSTOMER'), controller.cancelOrder);

// ─── Vendor ───────────────────────────────────────────────────────────────────

const rejectSchema = Joi.object({
  reason: Joi.string().max(200).optional().allow(''),
});

const statusSchema = Joi.object({
  status: Joi.string()
    .valid('PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED')
    .required(),
});

// List vendor's orders — supports ?status=CONFIRMED,ACCEPTED for new orders
router.get('/vendor/incoming', roleGuard('VENDOR'), controller.getVendorOrders);

// Accept: CONFIRMED → ACCEPTED (explicit vendor acknowledgment)
router.patch('/:id/accept', roleGuard('VENDOR'), controller.acceptOrder);

// Reject: CONFIRMED or ACCEPTED → CANCELLED
router.patch('/:id/reject', roleGuard('VENDOR'), validate(rejectSchema), controller.rejectOrder);

// Advance: ACCEPTED → PREPARING → READY_FOR_PICKUP → OUT_FOR_DELIVERY → DELIVERED
router.patch('/:id/status', roleGuard('VENDOR'), validate(statusSchema), controller.updateOrderStatus);

// ─── Shared ───────────────────────────────────────────────────────────────────

// Parameterised last — accessible by CUSTOMER, VENDOR, ADMIN
router.get('/:id', roleGuard('CUSTOMER', 'VENDOR', 'ADMIN'), controller.getOrderById);

module.exports = router;
