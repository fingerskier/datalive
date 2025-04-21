import DataLive from './index.js'
import os from 'os'
import path from 'path'

const data = {
  anti_coast: false,
  controller: "jir1",
  machine: {
    name: "unknown",
    gt_level: 4,
    rgt_level: 6,
    scalar: 1,
    compression_active: false,
    maximum_position: 50,
    minimum_position: 25,
  },
  reverse_actuator: false,
}

const filename = 'spectrum.json'
const homeDirectory = os.homedir()
const _filepath = path.join(homeDirectory, filename)
const dlOptions = {
  target: data,
  watch: true, // Changed to true to watch for changes
}
const DL = new DataLive(_filepath, dlOptions)
const instance = DL.live()

console.log('Initial config:', instance)

// Make a change
instance.machine.name = 'test-machine'
console.log('After change:', instance)

// Read the file directly to verify
import fs from 'fs'
const fileContents = fs.readFileSync(_filepath, 'utf8')
console.log('File contents:', fileContents) 