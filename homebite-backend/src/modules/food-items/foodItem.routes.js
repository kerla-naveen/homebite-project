const router = require('express').Router();
const auth = require('../../middleware/auth');
const roleGuard = require('../../middleware/roleGuard');
const upload = require('../../middleware/upload');
const controller = require('./foodItem.controller');

router.get('/', controller.list);
router.get('/my-items', auth, roleGuard('VENDOR'), controller.myItems);
router.get('/:id', controller.getById);

router.post('/', auth, roleGuard('VENDOR'), controller.create);
router.put('/:id', auth, roleGuard('VENDOR'), controller.update);
router.delete('/:id', auth, roleGuard('VENDOR'), controller.remove);
router.patch('/:id/toggle-availability', auth, roleGuard('VENDOR'), controller.toggleAvailability);
router.post('/:id/image', auth, roleGuard('VENDOR'), upload.single('image'), controller.uploadImage);

module.exports = router;
