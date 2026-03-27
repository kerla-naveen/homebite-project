const router = require('express').Router();
const Joi = require('joi');
const validate = require('../../middleware/validate');
const auth = require('../../middleware/auth');
const controller = require('./auth.controller');

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(60).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^[6-9]\d{9}$/).optional(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('CUSTOMER', 'VENDOR').default('CUSTOMER'),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
});

router.post('/register', validate(registerSchema), controller.register);
router.post('/login', validate(loginSchema), controller.login);
router.post('/refresh-token', controller.refreshToken);
router.post('/logout', auth, controller.logout);
router.get('/me', auth, controller.getMe);
router.post('/change-password', auth, validate(changePasswordSchema), controller.changePassword);

module.exports = router;
