const router = require('express').Router();
const auth = require('../../middleware/auth');
const roleGuard = require('../../middleware/roleGuard');
const controller = require('./category.controller');

router.get('/', controller.list);
router.post('/', auth, roleGuard('ADMIN'), controller.create);
router.put('/:id', auth, roleGuard('ADMIN'), controller.update);
router.delete('/:id', auth, roleGuard('ADMIN'), controller.remove);

module.exports = router;
