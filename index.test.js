import {afterAll, afterEach, beforeAll, beforeEach, describe, it, expect} from 'vitest'
import DataLive, {replacer, reviver} from './index.js'
import fs from 'fs'
import path from 'path'
import { tmpdir } from 'os'
import {randomString, sleep} from './testHelpers.js'

let filename = './schlum'
let intermediary = {}
let savedFilepath = ''


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
    DL = new DataLive(filename, {verbose: false})
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


describe('DataLive – core behaviour', () => {
  let file, dl;

  const mkFile = obj => {
    file = path.join(tmpdir(), `${Date.now()}-${Math.random()}.json`);
    fs.writeFileSync(file, JSON.stringify(obj ?? {}, replacer));
  };

  beforeEach(() => {
    mkFile({});                     // empty but *existing* file
    dl = new DataLive(file, {verbose: false}).live();
  });

  afterEach(() => fs.rmSync(file, { force: true }));

  it('loads existing JSON', () => {
    fs.writeFileSync(file, JSON.stringify({ sentinel: 'ok' }, replacer));
    const fresh = new DataLive(file, {verbose: false}).live();
    expect(fresh.sentinel).toBe('ok');
  });

  it('persists primitives, objects and arrays', () => {
    dl.a = 1;
    dl.b = { c: 'x' };
    dl.d = [2, 3];
    const reloaded = new DataLive(file, {verbose: false}).live();
    expect(reloaded.a).toBe(1);
    expect(reloaded.b.c).toBe('x');
    expect(reloaded.d[1]).toBe(3);
  });

  it('revives functions', () => {
    dl.mul = n => n * 2;
    const again = new DataLive(file, {verbose: false}).live();
    expect(again.mul(4)).toBe(8);
  });

  it('reacts to external edits (watch)', async () => {
    const json = JSON.parse(fs.readFileSync(file, 'utf8'), reviver);
    json.external = 'update';
    fs.writeFileSync(file, JSON.stringify(json, replacer));
    
    await sleep(100)
    expect(dl.external).toBe('update')
  })

  it('resets on corrupt JSON when enabled', () => {
    fs.writeFileSync(file, '{ bad json', 'utf8');
    const fresh = new DataLive(file, { defaultValue: { ok: true }, resetFileOnFail: true }).live();
    expect(fresh.ok).toBe(true);
  });
});


describe('DataLive default temporary file', () => {
  let dl
  let DL
  
  beforeAll(() => {
    DL = new DataLive(null, {verbose: false})
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

  afterAll(() => {
    fs.unlinkSync(DL.filepath)
  })
})
