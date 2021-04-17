const LJ = require('.')

const lj = new LJ('Hue')

lj.name = 'Hue Bris'
lj.id = 0912390548
lj.created = lj.created? lj.created: new Date()
lj.updated = new Date()
lj.data = [9,3,'asd', 902.23, {thing: 'stuff', fave: 80085}]

console.log(lj)