const LJ = require('.')

const lj = new LJ('test')

console.log(lj)

lj.flarn = 'ghibbet'
lj.one = 1

const textVersion = JSON.stringify(lj)
const storedVersion = JSON.stringify(require('./test.json'))
console.log('Should be true', textVersion===storedVersion)
console.log(textVersion, storedVersion)

const lj2 = new LJ('flarn')

lj2.name = 'Flarn'
lj2.contact = true
lj2.may.fourth = 'Pew Pew Day'