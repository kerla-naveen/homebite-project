const router = require('express').Router();
const auth = require('../../middleware/auth');
const roleGuard = require('../../middleware/roleGuard');
const controller = require('./order.controller');

router.use(auth);

// Customer
router.post('/', roleGuard('CUSTOMER'), controller.placeOrder);
router.get('/', roleGuard('CUSTOMER'), controller.getMyOrders);
router.patch('/:id/cancel', roleGuard('CUSTOMER'), controller.cancelOrder);

// Vendor
router.get('/vendor/incoming', roleGuard('VENDOR'), controller.getVendorOrders);
router.patch('/:id/status', roleGuard('VENDOR'), controller.updateOrderStatus);

// Shared (customer, vendor, admin all can view order detail)
router.get('/:id', roleGuard('CUSTOMER', 'VENDOR', 'ADMIN'), controller.getOrderById);

module.exports = router;
