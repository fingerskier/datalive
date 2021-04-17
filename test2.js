const LJ = require('.')

const lj = new LJ('test')

const textVersion = JSON.stringify(lj)
console.log(lj)
const storedVersion = JSON.stringify(require('./test.json'))
console.log('Should be true', textVersion===storedVersion)
console.log(textVersion, storedVersion)

////

const lj2 = new LJ('flarn')

console.log('Should be true', lj2.name==='Flarn')
console.log('Should be true', lj2.contact===true)
console.log('Should be true', lj2.contact===false)

// to create a nested property we must first create the root object
console.log('Object property exists', lj2.may.hasOwnProperty('fourth'))

console.log(lj2)

////

const lj3 = new LJ('ghib')

console.log('Should be true, moniker', lj3.moniker===`Some ${'name'}`)
console.log('Should be true, may_array', Array.isArray(lj3.may))
console.log('Should be true, may[4]', lj3.may[4]==='Pew Pew Day')

console.log(lj3)