const LJ = require('.')

const lj = new LJ('test')

lj.flarn = 'ghibbet'
lj.one = 1
console.log('Should be true; one is 1', lj.one===1)
console.log(lj)

// const inMemoryVersion = JSON.stringify(lj)
// const storedData = require('./test.json')
// const storedVersion = JSON.stringify(storedData)
// console.log('Should be true', inMemoryVersion===storedVersion)
// console.log(inMemoryVersion, storedVersion)

////

const lj2 = new LJ('flarn')

lj2.name = 'Flarn'
lj2.contact = true
console.log('Should be true', lj2.name==='Flarn')
console.log('Should be true', lj2.contact===true)
lj2.contact = false
console.log('Should be true', lj2.contact===false)

// to create a nested property we must first create the root object
console.log('create may property')
lj2.may = {}
console.log('create may.fourth property')
lj2.may.fourth = 'Pew Pew Day'
console.log('Object property exists', lj2.may.hasOwnProperty('fourth'))

console.log(lj2)

////

const lj3 = new LJ('ghib')

lj3.moniker = `Some ${'name'}`
console.log('Should be true, moniker', lj3.moniker===`Some ${'name'}`)
lj3.may = []
console.log('Should be true, may_array', Array.isArray(lj3.may))
lj3.may[4] = 'Pew Pew Day'
console.log('Should be true, may[4]', lj3.may[4]==='Pew Pew Day')

console.log(lj3)