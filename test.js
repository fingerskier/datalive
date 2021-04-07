const LJ = require('.')('test')

console.log(LJ)

LJ.flarn = 'ghibbet'
LJ.one = 1

const textVersion = JSON.stringify(LJ)
const storedVersion = JSON.stringify(require('./test.json'))
console.log('Is same?', textVersion===storedVersion)
console.log(textVersion, storedVersion)