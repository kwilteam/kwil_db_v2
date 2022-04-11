const { Pool } = require('pg');
require(`dotenv`).config();


// Edits client credentials based on their connection (i.e. local docker image, google hosting, etc.)

 let credentials = {
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT,
  database: process.env.DATABASE_NAME,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
    }
  if (process.env.NODE_ENV == 'development') {
    credentials = {host: 'localhost',
      port: 5432,
      database: `postgres`,
      user: `postgres`,
      password: `password`,}
  } else if (process.env.NODE_ENV == 'docker') {
    credentials = {host: 'postgres',
      port: process.env.DATABASE_PORT,
      database: process.env.DATABASE_NAME,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,}
  }
const pool = new Pool(credentials)

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err)
    process.exit(-1)
  })

// This function is used in server.js.


module.exports = { pool, credentials, Pool };