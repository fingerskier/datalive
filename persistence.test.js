import {describe, it, expect, beforeEach, beforeAll, afterAll} from 'vitest'
import DataLive, {replacer, reviver} from './index.js'
import fs from 'fs'
import path from 'path'
import {tmpdir} from 'os'

let filename = 'persisty'
let savedFilepath = ''
let intermediary = {}


describe('DataLive – persistence', () => {
  let file
  
  beforeEach(() => {
    file = path.join(tmpdir(), `${Math.random()}.json`)
    fs.writeFileSync(file, JSON.stringify({ foo: 42 }, replacer))
  })

  it('loads existing JSON', () => {
    const live = new DataLive(file, {verbose: false}).live()
    expect(live.foo).toBe(42)
  })

  it('persists mutations & reloads', () => {
    const first = new DataLive(file, {verbose: false}).live()
    first.bar = 'baz'

    const second = new DataLive(file, {verbose: false}).live()
    expect(second.bar).toBe('baz')
  })

  it('revives stored functions', () => {
    const first = new DataLive(file, {verbose: false}).live()
    first.mul = n => n * 2

    const second = new DataLive(file, {verbose: false}).live()
    expect(second.mul(3)).toBe(6)
  })

  it('creates a file for later', () => {
    const DL = new DataLive(filename, {verbose: false})
    intermediary = JSON.parse(JSON.stringify(DL.data, replacer), reviver)
    savedFilepath = DL.filepath
    expect(savedFilepath).toBeDefined()
  })
})


describe('New instance, old file', () => {
  let dl
  let DL
  
  beforeAll(() => {
    DL = new DataLive(filename, {verbose: false})
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