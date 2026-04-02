/**
 * Validation Middleware Factory
 * ------------------------------
 * Takes a Joi schema and a request property to validate ('body', 'query', 'params').
 * Returns middleware that validates the specified property and passes clean data forward.
 */

const AppError = require('../utils/AppError');

const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,   // collect all errors
      stripUnknown: true,  // remove fields not in schema
    });

    if (error) {
      const messages = error.details.map((d) => d.message).join('; ');
      return next(new AppError(`Validation error: ${messages}`, 400));
    }

    // Replace raw input with validated / sanitised values
    req[property] = value;
    next();
  };
};

module.exports = validate;
