"use strict";

const joi = require('joi');

// the validation schema
const raspberryGPIOSchema = joi.object({
  name: joi.string().default("GPIO22"),
  type: joi.string().valid('input', 'output').default("input"),
  init: joi.number().valid([0, 1]).default(0),
  edge: joi.string().valid(['none', 'rising', 'falling', 'both']).default('both'),
  debounceTimeout: joi.number().default(0),
  gpio: joi.number()
    .valid(2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,30,31,32,33,34,35,36,37,38,39,40,41,42,45)
      .default(22)
}).unknown();


const raspberrySchema = joi.array().items(raspberryGPIOSchema);

module.exports = async function (app, raspberryObject) {
  // we need an array
  if (!(raspberryObject instanceof Array)) {
    raspberryObject = [{ }];
  }
  // validate the config object
  const validation = joi.validate(raspberryObject, raspberrySchema);
  if (validation.error) {
    const errors = [];
    validation.error.details.forEach( detail => {
      errors.push(detail.message);
    });
    // process failed
    throw new Error(`raspberry config validation error: ${errors.join(", ")}`);
  }

  return validation.value;
};
