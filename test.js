/*const { hyphenToSnake } = require("./src/utils/utils")

global.database_map = new Map()

global.database_map.set('a', 1)

console.log(global.database_map.get('a'))


const { Parser } = require('node-sql-parser');
const parser = new Parser();

const ast = parser.astify(`select * from testschema.testtable; select * from testschema2.testtable;`)
console.log(ast[0].from)*/

const { Client, Pool } = require('pg');
require(`dotenv`).config();


// Edits client credentials based on their connection (i.e. local docker image, google hosting, etc.)

 let credentials = {host: 'localhost',
 port: 5432,
 database: `postgres`,
 user: `postgres`,
 password: `password`,}

 let credentials2 = {host: 'localhost',
 port: 5432,
 database: `postgres`,
 user: `not_admin`,
 password: `password`,}


const pool = new Pool(credentials2)

pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err)
    process.exit(-1)
  })

  const testF = async () => {
    //console.log(await pool.query(`DROP DATABASE test3;`))
    //console.log(await pool.query(`SELECT datname FROM pg_database;`))
    //console.log(await pool.query(`CREATE TABLE test(test_var varchar(10))`))
    //console.log(await pool.query(`SELECT * from test`))
    //console.log(await pool.query(`DROP ROLE not_admin;`))
    //console.log(await pool.query(`CREATE ROLE not_admin WITH PASSWORD 'password'; ALTER ROLE "not_admin" WITH LOGIN; REVOKE connect ON DATABASE admin FROM not_admin;`))
    //console.log(await pool.query(`GRANT ALL PRIVILEGES ON DATABASE test3 TO not_admin ;`))
    //console.log(await pool.query(`SHOW hba_file;`))
}

testF()