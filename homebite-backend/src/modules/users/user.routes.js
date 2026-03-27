const router = require('express').Router();
const auth = require('../../middleware/auth');
const controller = require('./user.controller');

router.use(auth);

router.get('/me', controller.getProfile);
router.put('/me', controller.updateProfile);
router.get('/me/addresses', controller.getAddresses);
router.post('/me/address', controller.addAddress);
router.put('/me/address/:id', controller.updateAddress);
router.delete('/me/address/:id', controller.deleteAddress);

module.exports = router;
