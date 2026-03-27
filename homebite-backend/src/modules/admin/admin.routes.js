const router = require('express').Router();
const auth = require('../../middleware/auth');
const roleGuard = require('../../middleware/roleGuard');
const controller = require('./admin.controller');

router.use(auth, roleGuard('ADMIN'));

router.get('/dashboard', controller.getDashboard);

router.get('/vendors/pending', controller.getPendingVendors);
router.get('/vendors', controller.getAllVendors);
router.get('/vendors/:id', controller.getVendorById);
router.patch('/vendors/:id/approve', controller.approveVendor);
router.patch('/vendors/:id/reject', controller.rejectVendor);
router.patch('/vendors/:id/suspend', controller.suspendVendor);

router.get('/users', controller.getAllUsers);
router.patch('/users/:id/block', controller.toggleBlockUser);

router.get('/orders', controller.getAllOrders);

module.exports = router;
