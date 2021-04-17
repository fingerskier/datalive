const LJ = require('.')

const lj = new LJ('fx')

lj.a = 1
lj.b = 'two'
lj.c = [1,2,3,'four']
lj.d = {a:1, b:'two'}
lj.add = (a,b)=>a+b

console.log(lj)

const lj2 = new LJ('fx')
console.log('Should be 3; add()', lj2.add(1,2)===3)