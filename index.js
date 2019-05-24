"use strict";

const Gpio = require('onoff').Gpio;
const events = require('events');
const validation =  require("./validation");

module.exports = async (app) => {
  let config, state, emitter;
  // get a validated config object
  try {
    config = await app.modules.jsonload(`${app.path}/config/raspberry-gpio.json`);
    app.config.http = await validation(app, config);
  } catch (e) {
    console.log(e);
    throw e;
  }

  // setup an event emitter
  emitter = new events.EventEmitter();

  // the state is a copy of the config plus "state" and "add" fields
  state = {};

  config.forEach( (io) => {
    // manage outputs
    app.modules.logger.log("debug", `setup BCM ${io.gpio} (${io.name}) as ${io.type}`);
    if (io.type === 'output') {
      state[io.name] = {
        gpio: app.modules.env.isDevelopment ? null : new Gpio(io.gpio, "out"),
        state: io.init
      };
      if (io.hasOwnProperty('init')) {
        // app.modules.logger.log("debug", `setup ${io.name} ${io.init}`);
        if (!app.modules.env.isDevelopment) {
          state[io.name].gpio.writeSync(io.init);
        }
      }
      // manage inputs
    } else if (io.type === 'input') {
      state[io.name] = {
        gpio: app.modules.env.isDevelopment ? null : new Gpio(
          io.gpio,
          "in",
          io.edge,
          io.debounceTimeout ? { debounceTimeout: io.debounceTimeout} : { debounceTimeout: 0 }
        )
      };

      if (!app.modules.env.isDevelopment) {
        // watch the gpio for changes
        state[io.name].gpio.watch( async (err, value) => {
          if (err) {
            app.modules.logger.log('error', `raspberry-gpio ${io.name} gpio ${io.gpio}`, err);
            emitter.emit("error", `raspberry-gpio ${io.name} gpio ${io.gpio}, ${err}`);
            return;
          }
          // check value
          if (value) {
            state[io.name].state = 1;
            app.modules.logger.log('debug', `${io.name} = 1`);
            emitter.emit("data", { name: io.name, value: 1 });
          } else {
            state[io.name].state = 0;
            app.modules.logger.log('debug', `${io.name} = 0`);
            emitter.emit("data", { name: io.name, value: 0 });
          }
        });
      }
    }
  });

  const read = async (type) => {
    const result = {};
    for (const i in config) {
      const item = config[i];
      if (config[i].type.indexOf(type) > -1 ) {
        if (state.hasOwnProperty(item.name)) {
          if (state[item.name].gpio) {
            result[item.name] = await state[item.name].gpio.readSync();
          }
        } else {
          app.modules.logger.log("error", `raspberry-gpio: ${item.name} does not exists`);
        }
      }
    }
    return result;
  }

  const readInputs = async () => {
    return await read("input");
  }

  const readOutputs = async () => {
    return await read("output");
  }

  const setOutput = async (output, value) => {
    if (state[output].gpio) {
      // set a gpio output
      await state[output].gpio.writeSync(value);
    }
  }

  return {
    readInputs,
    readOutputs,
    setOutput
  }

};
