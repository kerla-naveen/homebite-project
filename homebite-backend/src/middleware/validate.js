const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    const errors = error.details.map((d) => d.message.replace(/"/g, ''));
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }
  next();
};

module.exports = validate;
