const router = require('express').Router();
const auth = require('../../middleware/auth');
const roleGuard = require('../../middleware/roleGuard');
const controller = require('./payment.controller');

router.post('/webhook', controller.handleWebhook);

router.use(auth);
router.post('/create-order', roleGuard('CUSTOMER'), controller.createOrder);
router.post('/verify', roleGuard('CUSTOMER'), controller.verifyPayment);
router.get('/:orderId', roleGuard('CUSTOMER', 'ADMIN'), controller.getPaymentByOrder);

module.exports = router;
