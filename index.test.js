import {beforeAll, describe, it, expect} from 'vitest'
import DataLive, {replacer, reviver} from './index.js'
import fs from 'fs'
import path from 'path'


describe('replacer', () => {
  it('should stringify arrow functions', () => {
    const func = () => 'test'
    const result = replacer('test', func)
    expect(result).toBe(func.toString())
  })

  it('should stringify named functions', () => {
    const func = function test() { return 'test' }
    const result = replacer('test', func)
    expect(result).toBe(func.toString())
  })

  it('should not stringify non-functions', () => {
    const result = replacer('test', 'test')
    expect(result).toBe('test')
  })
})


describe('reviver', () => {
  it('should parse arrow functions', () => {
    const func = () => 'test'
    console.debug('Original function:', func, typeof func)
    const funcString = func.toString()
    console.debug('Function string:', funcString, typeof funcString)
    const result = reviver('test', funcString)
    console.debug('Final result:', result, typeof result)
    if (typeof result === 'function') {
      console.debug('Result is a function, calling it:', result())
    }
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


describe('DataLive', () => {
  let dl
  let DL
  
  beforeAll(() => {
    DL = new DataLive(path.resolve('./flarn'))
    dl = DL.live()
  })
  

  it('should create a new DataLive instance', () => {
    expect(dl).toBeDefined()
  })

  it('should accept simple values', () => {
    dl.test1 = 'test'
    expect(dl.test1).toBe('test')
  })

  it('should accept functions', () => {
    dl.test2 = () => 'test'
    expect(dl.test2()).toBe('test')
  })

  it('should accept objects', () => {
    dl.test3 = {test: 'test'}
    expect(dl.test3.test).toBe('test')
  })

  it('should accept arrays', () => {
    dl.test4 = ['test']
    expect(dl.test4[0]).toBe('test')
  })

  it('should accept nested objects', () => {
    dl.test5 = {test: 'test', test2: {test: 'test2'}}
    expect(dl.test5.test2.test).toBe('test2')
  })

  it('should accept nested arrays', () => {
    dl.test6 = [{test: 'test'}, {test: 'test2'}]
    expect(dl.test6[0].test).toBe('test')
    expect(dl.test6[1].test).toBe('test2')
  })

  it('should accept nested arrays of objects', () => {
    dl.test7 = [{test: 'test'}, {test: 'test2'}]
    expect(dl.test7[0].test).toBe('test')
    expect(dl.test7[1].test).toBe('test2')
  })

  it('should accept complex objects', () => {
    dl.test8 = {
      one: 'one',
      two: 'two',
      three: {
        four: 'four',
        five: 'five',
        six: 'six'
      },
      four: [{five: 'five'}, {six: 'six'}]
    }
    expect(dl.test8.one).toBe('one')
    expect(dl.test8.two).toBe('two')
    expect(dl.test8.three.four).toBe('four')
    expect(dl.test8.three.five).toBe('five')
    expect(dl.test8.three.six).toBe('six')
    expect(dl.test8.four[0].five).toBe('five')
    expect(dl.test8.four[1].six).toBe('six')
  })
  
  it('should have the correct file-contents', () => {
    console.debug('DL.filepath', DL.filepath)
    const contents = fs.readFileSync(DL.filepath, 'utf8')
    expect(contents).toBe(JSON.stringify(dl, replacer))
  })

  it('should see changes to the file', () => {
    dl.test1 = 'test2'
    expect(dl.test1).toBe('test2')
    const contents = JSON.parse(fs.readFileSync(DL.filepath, 'utf8'), reviver)
    contents.externalTest = 'flarn ghibbet'
    fs.writeFileSync(DL.filepath, JSON.stringify(contents, replacer))
    expect(dl.externalTest).toBe('flarn ghibbet')
  })
})


describe('DataLive default temporary file', () => {
  let dl
  let DL
  
  beforeAll(() => {
    DL = new DataLive()
    dl = DL.live()
  })
  
  it('should create a new DataLive instance', () => {
    expect(dl).toBeDefined()
  })
  
  it('should have a temporary file', () => {
    expect(DL.filepath).toBeDefined()
  })
  
  it('should have a temporary file with a .json extension', () => {
    expect(DL.filepath).toMatch(/\.json$/)
  })
})