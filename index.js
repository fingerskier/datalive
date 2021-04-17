module.exports = class {
  constructor(name) {
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
      fs.writeFileSync(filepath, JSON.stringify(target))
    }

    const handler = {
      get: function(obj, prop) {
        if (typeof obj[prop] === 'object' && obj[prop] !== null) {
          return new Proxy(obj[prop], {})
        } else {
          return obj[prop];
        }
      },
      
      set: function(obj, prop, value) {
        obj[prop] = value;

        fs.writeFileSync(filepath, JSON.stringify(obj))

        return true;
      }
    }

    return new Proxy(target, handler)
  }
}