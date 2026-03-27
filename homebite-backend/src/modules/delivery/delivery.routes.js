const router = require('express').Router();
const auth = require('../../middleware/auth');
const roleGuard = require('../../middleware/roleGuard');
const controller = require('./delivery.controller');

router.post('/webhook', controller.handleWebhook);

router.use(auth);
router.post('/:orderId/create-shipment', roleGuard('VENDOR', 'ADMIN'), controller.createShipment);
router.get('/:orderId/track', roleGuard('CUSTOMER', 'VENDOR', 'ADMIN'), controller.trackShipment);

module.exports = router;
