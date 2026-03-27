const router = require('express').Router();
const auth = require('../../middleware/auth');
const roleGuard = require('../../middleware/roleGuard');
const controller = require('./vendor.controller');

// Public
router.get('/', controller.listVendors);

// Vendor-only — declared before /:id so they are not caught as a param
router.post('/onboard', auth, roleGuard('VENDOR'), controller.onboard);
router.get('/profile/me', auth, roleGuard('VENDOR'), controller.getMyProfile);
router.put('/profile/me', auth, roleGuard('VENDOR'), controller.updateMyProfile);
router.get('/dashboard/overview', auth, roleGuard('VENDOR'), controller.getDashboard);
router.get('/dashboard/earnings', auth, roleGuard('VENDOR'), controller.getEarnings);

// Public — parameterised last
router.get('/:id', controller.getVendorById);

module.exports = router;
