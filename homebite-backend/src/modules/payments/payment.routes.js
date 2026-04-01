const router = require('express').Router();
const Joi = require('joi');
const auth = require('../../middleware/auth');
const roleGuard = require('../../middleware/roleGuard');
const validate = require('../../middleware/validate');
const controller = require('./payment.controller');

const createOrderSchema = Joi.object({
  orderId: Joi.string().required(),
});

const verifyPaymentSchema = Joi.object({
  orderId: Joi.string().required(),
  razorpayOrderId: Joi.string().required(),
  razorpayPaymentId: Joi.string().required(),
  razorpaySignature: Joi.string().required(),
});

router.post('/webhook', controller.handleWebhook);

router.use(auth);
router.post('/create-order', roleGuard('CUSTOMER'), validate(createOrderSchema), controller.createOrder);
router.post('/verify', roleGuard('CUSTOMER'), validate(verifyPaymentSchema), controller.verifyPayment);
router.get('/:orderId', roleGuard('CUSTOMER', 'ADMIN'), controller.getPaymentByOrder);

module.exports = router;
