/*const { hyphenToSnake } = require("./src/utils/utils")

global.database_map = new Map()

global.database_map.set('a', 1)

console.log(global.database_map.get('a'))


const { Parser } = require('node-sql-parser');
const parser = new Parser();

const ast = parser.astify(`select * from testschema.testtable; select * from testschema2.testtable;`)
console.log(ast[0].from)*/

const Kwil = require('kwil')

const yuh = Kwil.getGateway('https://demo.kwil.com', 'https://urls.kwil.xyz')