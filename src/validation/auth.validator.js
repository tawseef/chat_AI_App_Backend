const Joi = require("joi");

// Joi Schema for Login
const loginBodyValidaton = Joi.object().keys({
    email: Joi.string().required(),
    password: Joi.string().required()
});

// Joi Schema for Signup
const signUpBodyValidation = Joi.object().keys({
    name: Joi.string().required(),
    email: Joi.string().required(),
    password: Joi.string().required()
});

module.exports = { loginBodyValidaton, signUpBodyValidation };
