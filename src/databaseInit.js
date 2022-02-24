const partitions = require('./utils/bundlePartitions.js')
const {pool, Pool, credentials} = require('../database/pool.js')

const databaseInit = async () => {
    try {
        //Putting this in try catch since database likely exists
        await pool.query(`CREATE DATABASE admin;`)
    } catch(e) {
        console.log(`Admin already exists`)
    }

    //Now we create the master pool
    credentials.database = 'admin'
    const admin_pool = new Pool(credentials)

    //Set admin pool
    global.admin_pool = admin_pool

    //Create a bundle table
    await admin_pool.query(`CREATE TABLE IF NOT EXISTS bundles(
        bundle_id varchar(43) PRIMARY KEY,
        height integer NOT NULL,
        cursor_id varchar(44) NOT NULL,
        synced boolean NOT NULL,
        moat varchar(64) NOT NULL
        );`)

    //Create pending bundle table
    await admin_pool.query(`CREATE TABLE IF NOT EXISTS pending_bundles(
        bundle_id text PRIMARY KEY,
        moats text[] NOT NULL
        )`)

        //Partition
    await partitions.partitionInit()

    //Create moats table

    await admin_pool.query(`CREATE TABLE IF NOT EXISTS moats(
        moat_name varchar(128) PRIMARY KEY,
        owner_address varchar(42) NOT NULL,
        public_key varchar(683) NOT NULL,
        encrypted_key varchar(5000) NOT NULL,
        encrypted_secret varchar(88) NOT NULL
    );`)

    //Revoke access from public
    await admin_pool.query('REVOKE connect ON DATABASE admin FROM PUBLIC;')

    //Creating a map for all databases

    global.database_map = new Map()

    let userAuth = await admin_pool.query(`SELECT moat_name, public_key from moats;`)
    userAuth = userAuth.rows
    userAuth.forEach(user => {
        //Map the moat name to the credentials
        credentials.database = user.moat_name
        try {
            //Try/catch in case there is DB connectivity issue
            global.database_map.set(user.moat_name, {key: user.public_key, pool: new Pool(credentials), data_size: 0})
        } catch(e) {
            console.log(e)
        }
    })
}

module.exports = {databaseInit}