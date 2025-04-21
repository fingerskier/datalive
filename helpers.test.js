import {describe, it, expect} from 'vitest'
import {replacer, reviver} from './index.js'
import {randomString} from './testHelpers.js'


describe('JSON helpers', () => {
  describe('replacer', () => {
    let rand = randomString()
    
    it('should stringify arrow functions', () => {
      const func = () => rand
      const result = replacer(rand, func)
      expect(result).toBe(func.toString())
    })
    
    it('should stringify named functions', () => {
      const func = function test() { return rand }
      const result = replacer(rand, func)
      expect(result).toBe(func.toString())
    })
    
    it('should not stringify non-functions', () => {
      const result = replacer(rand, rand)
      expect(result).toBe(rand)
    })
  })


  describe('reviver', () => {
    let rand = randomString()
    
    it('should parse arrow functions', () => {
      const func = () => 'test'
      const funcString = func.toString()
      const result = reviver('test', funcString)
      expect(result()).toBe(func())
    })
    
    it('should parse named functions', () => {
      const func = function test() { return 'test' }
      const result = reviver('test', func.toString())
      expect(result()).toBe(func())
    })
    
    it('should not parse non-functions', () => {
      const result = reviver('test', 'test')
      expect(result).toBe('test')
    })
  })

  it('round‑trips nested functions', () => {
    const original = { a: n => n + 1, deep: [{ x: () => 'ok' }] };

    const json   = JSON.stringify(original, replacer);
    const parsed = JSON.parse(json, reviver);

    expect(parsed.a(2)).toBe(3);
    expect(parsed.deep[0].x()).toBe('ok');
  });

  it('handles arrow functions with implicit return', () => {
    const fn      = x => x * 2;
    const revived = reviver('k', fn.toString());
    expect(revived(4)).toBe(8);
  });

  it('does not revive look‑alike strings', () => {
    const tricky = 'functionnot(){}';
    expect(reviver('k', tricky)).toBe(tricky);
  });

  it('returns original string when eval fails', () => {
    const bad = '()=>{';          // invalid JS
    expect(reviver('k', bad)).toBe(bad);
  });
})
