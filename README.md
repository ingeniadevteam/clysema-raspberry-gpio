# @clysema/raspberry-gpio

[![npm (scoped)](raspberry-gpio://img.shields.io/npm/v/@clysema/raspberry-gpio.svg)](raspberry-gpio://www.npmjs.com/package/@clysema/raspberry-gpio)
[![npm bundle size (minified)](raspberry-gpio://img.shields.io/bundlephobia/min/@clysema/raspberry-gpio.svg)](raspberry-gpio://www.npmjs.com/package/@clysema/raspberry-gpio)

Simple wrapper for the [onoff](https://www.npmjs.com/package/onoff) package.

## Install

```
$ npm install @clysema/raspberry-gpio
```

## Config

config/raspberry-gpio.json
```json
[
  {
    "name": "IN1",
    "gpio": 22,
    "type": "input",
    "edge": "falling",
    "debounceTimeout": 100
  },
  {
    "name": "IN2",
    "gpio": 23,
    "type": "input"
  },
  {
    "name": "OUT1",
    "gpio": 24,
    "type": "output",
    "init": 1
  }
]
```

## Usage

Is an event emitter:
```js
// subscribe to data
app.modules["raspberry-gpio"].emitter.on("data", (data) => {
  console.log(data);
  // { name: 'IN1', value: 1 }
});

// subscribe to errors
app.modules["raspberry-gpio"].emitter.on("error", (error) => {
  console.log(error);
});
```

Read/Write:
```js
console.log(await app.modules["raspberry-gpio"].readOutputs());
await app.modules["raspberry-gpio"].setOutput("OUT1", 0);
console.log(await app.modules["raspberry-gpio"].readOutputs());
```
