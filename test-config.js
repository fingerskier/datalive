import DataLive from './index.js'
import os from 'os'
import path from 'path'
import fs from 'fs'

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
console.log('Using filepath:', _filepath)

const dlOptions = {
  target: data,
  verbose: true
}
const DL = new DataLive(_filepath, dlOptions)
const instance = DL.live()

console.log('Initial config:', JSON.stringify(instance, null, 2))
console.log('Initial file exists:', fs.existsSync(_filepath))
if (fs.existsSync(_filepath)) {
  console.log('Initial file contents:', fs.readFileSync(_filepath, 'utf8'))
}

// Make a change
console.log('\nMaking change to machine.name...')
instance.machine.name = 'test-machine'
console.log('After change:', JSON.stringify(instance, null, 2))
console.log('File exists after change:', fs.existsSync(_filepath))
if (fs.existsSync(_filepath)) {
  console.log('File contents after change:', fs.readFileSync(_filepath, 'utf8'))
}

// Try a direct write to verify permissions
console.log('\nAttempting direct write...')
try {
  fs.writeFileSync(_filepath, JSON.stringify(instance, null, 2))
  console.log('Direct write succeeded')
} catch (error) {
  console.error('Direct write failed:', error)
}

process.exit(0) 