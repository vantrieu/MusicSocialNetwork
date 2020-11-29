const Joi = require('@hapi/joi');

const validateBody = (schema) => {
    return (req, res, next) => {
        const validatorResult = schema.validate(req.body);
        if (validatorResult.error) {
            return res.status(400).json(validatorResult.error);
        } else {
            
            if (!req.value) req.value = {};
            if (!req.value['body']) req.value.body = {};
            req.value.body = validatorResult.value;
            //console.log(req.value.body);
            //req.value.params[name] = req.params[name];
            next();
        }
    }
}

const validateParam = (schema, name) => {
    return (req, res, next) => {
        const validatorResult = schema.validate({ param: req.params[name] });
        if (validatorResult.error) {
            return res.status(400).json(validatorResult.error);
        } else {
            if (!req.value) req.value = {};
            if (!req.value['params']) req.value.params = {};
            req.value.params[name] = req.params[name];
            next();
        }
    }
}

const schemas = {
    idSchema: Joi.object().keys({
        param: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
    }),

    accountSchema: Joi.object().keys({
        username: Joi.string().min(2).max(50).required(),
        password: Joi.string().min(8).max(30).required(),
        email: Joi.string().email().required(),
        phonenumber: Joi.string().regex(/^[0-9]{10}$/).required(),
        firstname: Joi.string().min(2).max(50).required(),
        lastname: Joi.string().min(2).max(50).required(),
        birthday: Joi.date().required(),
        gender: Joi.string()
    })
}

module.exports = {
    validateParam,
    schemas,
    validateBody
}