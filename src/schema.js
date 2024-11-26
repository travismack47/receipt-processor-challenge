const Joi = require('joi');
const sanitizeHtml = require('sanitize-html');

const cleanString = (value, helpers) => {
  const clean = sanitizeHtml(value);
  if (clean !== value) {
    return helpers.error('string.invalid', { value });
  }
  return clean;
};

const receiptSchema = Joi.object({
  retailer: Joi.string().custom(cleanString).required(),
  purchaseDate: Joi.string().isoDate().required(),
  purchaseTime: Joi.string()
    .pattern(/^([0-1]\d|2[0-3]):([0-5]\d)$/)
    .required(),
  total: Joi.number().required(),
  items: Joi.array()
    .items(
      Joi.object({
        shortDescription: Joi.string().custom(cleanString).required(),
        price: Joi.number().required(),
      })
    )
    .min(1)
    .required(),
});

module.exports = receiptSchema;
