module.exports = class {
  constructor(name) {
    function replacer(key, value) {
      return (typeof value === 'function')? value.toString(): value
    }
    function reviver(key, value) {
      if (value.startsWith('()=>') || (value.startsWith('function'))) {
        return eval(value)
      } else {
        return value
      }
    }

    const fs = require('fs')//.promises
    const path = require('path')

    let filepath = ''
    let target
    let defaultValue = {}

    try {
      filepath = path.resolve(path.join('./' + name + '.json'))
      target = require(filepath)
    } catch (error) {
      target = defaultValue
      fs.writeFileSync(filepath, JSON.stringify(target, reviver))
    }

    const handler = {
      get: function(obj, prop) {
        if ((typeof obj[prop] === 'object') && (obj[prop] !== null)) {
          return new Proxy(obj[prop], handler)
        } else {
          return obj[prop];
        }
      },

      set: function(obj, prop, value) {
        obj[prop] = value;

        fs.writeFileSync(filepath, JSON.stringify(target, replacer))

        return true;
      }
    }

    return new Proxy(target, handler)
  }
}