const Joi = require('@hapi/joi');
const jwt = require('jsonwebtoken');
const { schema } = require('./model');

// Validation
const registerValidation = data => {
    const schema = Joi.object({
        name: Joi.string().min(6).required(),
        email: Joi.string().min(6).required().email(),
        password: Joi.string().min(6).required()
    });

    return schema.validate(data);
};

const loginValidation = data => {
    const schema = Joi.object({
        email: Joi.string().min(6).required().email(),
        password: Joi.string().min(6).required()
    });

    return schema.validate(data);
};

const changePasswordValidation = data => {
    const schema = Joi.object({
        email: Joi.string().min(6).required().email(),
        oldPassword: Joi.string().min(6).required(),
        newPassword: Joi.string().min(6).required()
    });

    return schema.validate(data);
}

// Authentication
const AuthenticateToken  = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if(!token) return res.sendStatus(401);

    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
        if(err) res.sendStatus(403);
        req.user = user;
        next();
    });
};

module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
module.exports.changePasswordValidation = changePasswordValidation;
module.exports.AuthenticateToken = AuthenticateToken;