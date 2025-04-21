import DataLive from './index.js'
import os from 'os'
import path from 'path'
import fs from 'fs'

async function runTest() {
  const data = { test: 'initial' }
  const filepath = path.join(os.homedir(), 'test.json')
  console.log('Filepath:', filepath)

  // Delete the file if it exists to start fresh
  if (fs.existsSync(filepath)) {
    fs.unlinkSync(filepath)
    console.log('Deleted existing file')
  }

  const dl = new DataLive(filepath, { target: data, verbose: true })
  const instance = dl.live()

  console.log('Initial value:', instance.test)

  instance.test = 'changed'
  console.log('After change:', instance.test)

  const fileContents = fs.readFileSync(filepath, 'utf8')
  console.log('File contents:', fileContents)
}

// Run the test and wait for all console output
runTest().then(() => {
  console.log('Test complete')
  process.exit(0)
}).catch(error => {
  console.error('Test failed:', error)
  process.exit(1)
}) 