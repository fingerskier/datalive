const { fileURLToPath } = require('url')

module.exports = function(name) {
  const fs = require('fs').promises
  const touch = require('touch')
  const path = require('path')
  let filepath = ''
  let target = {}
  let thisn = {}

  try {
    filepath = path.resolve(path.join('./' + name + '.json'))
    thisn = require(filepath)
  } catch (error) {
    touch(filepath)
    thisn = {}
  }

  const handler = {
    get: function(obj, prop) {
      return (prop in obj)? obj[prop]: null;
    },

    set: function(obj, prop, value) {
      obj[prop] = value;

      fs.writeFile(filepath, JSON.stringify(obj))

      return true;
    }
  }

  return new Proxy(target, handler)
}