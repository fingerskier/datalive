import fs from 'fs';
import os from 'os';
import path from 'path';
import { v4 as uuid } from 'uuid';

/**
 * Detects whether a string looks like a classic or arrow function.
 */
const looksLikeFn = str => /^(?:\s*(?:function\b|\(?[\w$,\s]*\)?\s*=>))/.test(str);

/**
 * JSON.stringify replacer that serialises functions to their source.
 */
export const replacer = (key, value) =>
  typeof value === 'function' ? value.toString() : value;

/**
 * JSON.parse reviver that re‑hydrates serialised functions.
 */
export const reviver = (key, value) => {
  if (typeof value === 'string' && looksLikeFn(value)) {
    try {
      // Wrapping in parentheses lets both arrow and classic functions parse as expressions.
      return eval(`(${value})`);
    } catch (err) {
      console.error('Failed to revive function for', key, ':', err);
    }
  }
  return value;
};

/**
 * Live JS object backed by an on‑disk JSON file.  Mutations are persisted automatically,
 * external edits refresh the in‑memory object, and functions survive the trip.
 */
export default class DataLive {
  /**
   * @param {?string} _filepath   Path to the JSON file (".json" appended if missing). If omitted a temporary file is created.
   * @param {Object}  options     { defaultValue = {}, verbose = false, watch = true, resetFileOnFail = true }
   */
  constructor(
    _filepath,
    {
      defaultValue = {},
      verbose = false,
      watch = true,
      resetFileOnFail = true,
    } = {}
  ) {
    this.verbose = verbose;

    // Resolve the path or fall back to a temp file
    this.filepath = _filepath
      ? path.resolve(_filepath.endsWith('.json') ? _filepath : `${_filepath}.json`)
      : path.join(os.tmpdir(), `${uuid()}.json`);

    // Load existing data or seed the file
    this.target = this.#load(defaultValue, resetFileOnFail);

    // Lazily build a single proxy
    this._proxy = this.#proxyFactory(this.target);

    // Optionally watch for out‑of‑process changes
    if (watch) this.#watch();
  }

  /**
   * Returns a proxy to the data object. Any mutations to the proxy are
   * automatically written back to disk.
   */
  live() {
    return this._proxy;
  }
  /**
   * Alias for {@link live} to allow property-style access to the live object.
   * @return {Object}
   */
  get data() {
    return this._proxy;
  }

  // --------‑‑ private implementation details below ‑‑--------- //

  /**
   * Load existing JSON or initialise a new file.
   * @private
   */
  #load(defaultValue, reset) {
    if (fs.existsSync(this.filepath)) {
      try {
        const raw = fs.readFileSync(this.filepath, 'utf8');
        if (this.verbose) console.debug('DataLive- loaded', this.filepath);
        return JSON.parse(raw, reviver);
      } catch (err) {
        if (!reset) throw err;
        if (this.verbose) console.warn('DataLive- load error', err.message)
      }
    }

    if (this.verbose) console.debug('DataLive- initialising', this.filepath, 'with', defaultValue)
    this.#write(defaultValue);
    return defaultValue;
  }

  /**
   * Persist the object to disk.
   * @private
   */
  #write(obj) {
    fs.writeFileSync(this.filepath, JSON.stringify(obj, replacer));
  }

  /**
   * Create a proxy that automatically persists mutations.
   * @private
   */
  #proxyFactory(root) {
    const write = () => this.#write(root);

    const handler = {
      get(target, prop, receiver) {
        const val = Reflect.get(target, prop, receiver);
        return typeof val === 'object' && val !== null ? new Proxy(val, handler) : val;
      },
      set(target, prop, value) {
        const ok = Reflect.set(target, prop, value);
        write()
        if (this.verbose) console.debug('DataLive- set', prop, value)
        return ok;
      },
      deleteProperty(target, prop) {
        const ok = Reflect.deleteProperty(target, prop);
        write()
        if (this.verbose) console.debug('DataLive- deleted', prop)
        return ok;
      },
    };
    return new Proxy(root, handler);
  }

  /**
   * Watch the backing file for external changes and update the in-memory
   * object when they occur.
   * @private
   */
  #watch() {
    const self = this
    fs.watch(this.filepath, event => {
      if (event !== 'change') return;
      try {
        const fresh = JSON.parse(fs.readFileSync(this.filepath, 'utf8'), reviver);
        Object.assign(self.target, fresh);
        if (this.verbose) console.debug('DataLive- file change detected')
      } catch (err) {
        if (this.verbose) console.error('DataLive- refresh error', err.message)
      }
    });
  }
}
