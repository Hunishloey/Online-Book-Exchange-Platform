const Joi = require('joi');

const userValidationSchema = Joi.object({
  name: Joi.string().min(1).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  userType: Joi.number().valid(1, 2, 3).required(), // Customize as needed
  status: Joi.boolean().optional()
});

module.exports = { userValidationSchema };
