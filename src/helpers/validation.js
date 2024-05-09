const Joi = require('joi');

function validate(username, password) {
    const schema = Joi.object({
        username: Joi.string()
        .min(3)
        .max(24)
        .required(),
        
        password: Joi.string()
        .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
        .required(),
    });

    return schema.validate({
        username: username,
        password: password,
    });
};

module.exports = validate;
