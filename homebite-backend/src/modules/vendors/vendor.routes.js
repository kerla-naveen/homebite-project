const router = require('express').Router();
const auth = require('../../middleware/auth');
const roleGuard = require('../../middleware/roleGuard');
const controller = require('./vendor.controller');

router.get('/', controller.listVendors);
router.get('/:id', controller.getVendorById);

router.post('/onboard', auth, roleGuard('VENDOR'), controller.onboard);
router.get('/profile/me', auth, roleGuard('VENDOR'), controller.getMyProfile);
router.put('/profile/me', auth, roleGuard('VENDOR'), controller.updateMyProfile);

module.exports = router;
