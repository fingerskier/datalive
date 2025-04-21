import fs from 'fs'
import os from 'os'
import path from 'path'
import { v4 as uuid } from 'uuid'


/**
 * @description Checks if a string looks like a stringified function
 * @param {string} str 
 * @returns {boolean}
 */
const looksLikeFn = str =>
  /^\s*(?:function\b|\(?[\w$,\s]*\)?\s*=>)/.test(str)


/**
 * @description Utility fx for stringifying functions
 * @param {string} key 
 * @param {*} value 
 * @returns {string}
 */
export function replacer(key, value) {
  let result = value
  if (typeof value === 'function') result = value.toString()
  return result
}


/**
 * @description Utility fx for parsing functions
 * @param {string} key 
 * @param {*} value 
 * @returns {*}
 */
export function reviver(key, value) {
  if (typeof value === 'string' && looksLikeFn(value)) {
    try {
      // parentheses make both arrow‑ and traditional functions legal as an expression
      return eval(`(${value})`);
    } catch (e) {
      console.error('Error reviving function:', e);
    }
  }
  return value
}


/**
 * @description Live POJO with JSON file copy
 * @class DataLive
 */

export default class DataLive {
  /**
   * @description Create a new LiveJSON instance
   * @param {string} _filepath - The path to the JSON file, if none then will create a temporary file;  if it lacks a .json extension then that will be added
   * @param {Object} config - The config object: {target={}, defaultValue={}, resetFileOnFail=true}
   */
  constructor(_filepath, config={}) {
    const defaultValue = config.defaultValue || {}
    const resetFileOnFail = config.resetFileOnFail || true
    const watch = config.watch || true
    
    this.filepath = _filepath || null
    this.target = config.target || {}
    this.verbose = config.verbose || true
    
    if (!this.filepath) {
      this.filepath = path.join(os.tmpdir(), uuid() + '.json')
      console.warn('No filepath provided, using temporary file: ' + this.filepath)
    } else {
      this.filepath = this.filepath.endsWith('.json') ? this.filepath : this.filepath + '.json'
      this.filepath = path.resolve(this.filepath)
    }
    
    try {
      this.target = JSON.parse(fs.readFileSync(this.filepath, 'utf8'), reviver)
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.warn('File does not exist:', this.filepath)
        if (resetFileOnFail) {
          console.warn('Populating file with defaultValue', defaultValue)
          this.target = defaultValue
          fs.writeFileSync(this.filepath, JSON.stringify(this.target, replacer))
        } else {
          throw error
        }
      }
    }
    
    if (watch) {
      this.watch()
    }
  }
  
  
  live() {
    const handler = {
      get: (obj, prop) => {
        if ((typeof obj[prop] === 'object') && (obj[prop] !== null)) {
          return new Proxy(obj[prop], handler)
        } else {
          return obj[prop]
        }
      },
      
      set: (obj, prop, value) => {
        obj[prop] = value
        
        fs.writeFileSync(this.filepath, JSON.stringify(this.target, replacer))
        if (this.verbose) console.log('DataLive-', prop, 'set to', value)
        
        return true
      }
    }
    
    return new Proxy(this.target, handler)
  }
  
  
  /**
   * @description Watch the file for changes
   */
  watch() {
    if (!this.filepath) return console.error('No filepath to watch')
    
    fs.watch(this.filepath, (event, filename) => {
      try {
        if (event === 'change') {
          // if the file changes externally then update the target obj
          this.target = JSON.parse(fs.readFileSync(this.filepath, 'utf8'), reviver)
        }
      } catch (error) {
        console.error('Error watching file: ' + this.filepath)
      }
    })
  }
}