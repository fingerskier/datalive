const LJ = require('.')

const lj = new LJ('foob')

lj.may = []
lj.may[4] = 'be with you'
console.log('Should be true; mayArray', lj.may[4]==='be with you')

console.log(lj)