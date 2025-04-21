import {afterAll, beforeAll, describe, it, expect} from 'vitest'
import DataLive, {replacer, reviver} from './index.js'
import fs from 'fs'
import path from 'path'

let filename = './flarn'
let intermediary = {}
let savedFilepath = ''

const randomString = () => Math.random().toString(36).substring(2, 15)
const randomInt = () => Math.floor(Math.random() * 1000000)


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
  let val1 = randomString()
  let val2 = randomString()
  let val3 = randomString()
  let val4 = randomString()
  let val5 = randomString()
  let val6 = randomString()
  let val7 = randomString()
  let val8 = randomString()
  let val9 = randomString()
  let val10 = randomString()
  

  beforeAll(() => {
    DL = new DataLive(filename)
    dl = DL.live()
  })
  

  it('should create a new DataLive instance', () => {
    expect(dl).toBeDefined()
  })

  it('should accept simple values', () => {
    dl.test1 = val1
    expect(dl.test1).toBe(val1)
  })

  it('should accept functions', () => {
    dl.test2 = () => val2
    expect(dl.test2()).toBe(val2)
  })

  it('should accept objects', () => {
    dl.test3 = {test: val3}
    expect(dl.test3.test).toBe(val3)
  })

  it('should accept arrays', () => {
    dl.test4 = [val4]
    expect(dl.test4[0]).toBe(val4)
  })

  it('should accept nested objects', () => {
    dl.test5 = {test: val5, test2: {test: val6}}
    expect(dl.test5.test2.test).toBe(val6)
  })

  it('should accept nested arrays', () => {
    dl.test6 = [{test: val7}, {test: val8}]
    expect(dl.test6[0].test).toBe(val7)
    expect(dl.test6[1].test).toBe(val8)
  })

  it('should accept nested arrays of objects', () => {
    dl.test7 = [{test: val9}, {test: val10}]
    expect(dl.test7[0].test).toBe(val9)
    expect(dl.test7[1].test).toBe(val10)
  })

  it('should accept complex objects', () => {
    dl.test8 = {
      one: val1,
      two: val2,
      three: {
        four: val3,
        five: val4,
        six: val5
      },
      four: [{five: val6}, {six: val7}]
    }
    expect(dl.test8.one).toBe(val1)
    expect(dl.test8.two).toBe(val2)
    expect(dl.test8.three.four).toBe(val3)
    expect(dl.test8.three.five).toBe(val4)
    expect(dl.test8.three.six).toBe(val5)
    expect(dl.test8.four[0].five).toBe(val6)
    expect(dl.test8.four[1].six).toBe(val7)
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
  
  
  afterAll(() => {
    intermediary = JSON.parse(JSON.stringify(dl, replacer), reviver)
    savedFilepath = DL.filepath
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


describe('New instance, old file', () => {
  let dl
  let DL
  
  beforeAll(() => {
    DL = new DataLive(filename)
    dl = DL.live()
  })
  
  it('should create a new DataLive instance', () => {
    expect(dl).toBeDefined()
  })
  
  it('should have a file', () => {
    expect(DL.filepath).toBeDefined()
  })
  
  it('should have the same file as the previous instance', () => {
    expect(DL.filepath).toBe(savedFilepath)
  })

  it('should have the same contents as the previous instance', () => {
    expect(JSON.stringify(dl, replacer)).toBe(JSON.stringify(intermediary, replacer))
  })
})
