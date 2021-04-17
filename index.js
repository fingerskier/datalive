const { fileURLToPath } = require('url')

module.exports = class {
  config(name) {
    const fs = require('fs').promises
    const touch = require('touch')
    const path = require('path')
    this.filepath = ''
    this.target = {}
    this.thisn = {}

    try {
      this.filepath = path.resolve(path.join('./' + name + '.json'))
      this.thisn = require(this.filepath)
    } catch (error) {
      touch(this.filepath)
      this.thisn = {}
    }
    
    const handler = {
      get: function(obj, prop) {
        return (prop in obj)? obj[prop]: null;
      },
      
      set: function(obj, prop, value) {
        obj[prop] = value;
        
        fs.writeFile(this.filepath, JSON.stringify(obj))
        
        return true;
      }
    }

    return new Proxy(this.target, handler)
  }
}