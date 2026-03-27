const router = require('express').Router();
const auth = require('../../middleware/auth');
const roleGuard = require('../../middleware/roleGuard');
const controller = require('./review.controller');

router.get('/food-item/:foodItemId', controller.byFoodItem);
router.get('/vendor/:vendorId', controller.byVendor);

router.post('/', auth, roleGuard('CUSTOMER'), controller.create);
router.delete('/:id', auth, roleGuard('CUSTOMER', 'ADMIN'), controller.remove);

module.exports = router;
