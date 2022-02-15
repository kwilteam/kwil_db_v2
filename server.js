const bodyParser = require('body-parser');
<<<<<<< HEAD
//const colors = require('colors');
=======
const colors = require('colors');
>>>>>>> master
require(`dotenv`).config();
const numCPUs = require('os').cpus().length;
const cluster = require('cluster');
const Express = require('express');
const app = Express();
const cron = require('node-cron');
//const { shoveBundles } = require('./src/bundler/bundleHandler');
<<<<<<< HEAD
const {shoveBundles} = require(`./src/bundling/shove.js`)
//const { syncNode } = require('./src/bundler/syncFuncs');
const { bundleInit } = require('./src/bundling/bundleInit');
const handlerFunc = require('./src/handler.js')
const handler = handlerFunc.handler()
const {pool, Pool, credentials} = require('./database/pool.js')
const { decryptKey } = require('./src/utils/encryption');
const cors = require('cors');
let server = require('http').createServer();
const partitions = require('./src/utils/bundlePartition.js')
=======
const {shove} = require(`./src/bundling/shove.js`)
//const { syncNode } = require('./src/bundler/syncFuncs');
const handlerFunc = require('./src/handler.js')
const handler = handlerFunc.handler()
const cors = require('cors');
let server = require('http').createServer();
const partitions = require('./src/utils/bundlePartitions.js')
const {databaseInit} = require('./src/databaseInit.js')
>>>>>>> master

//function shoveBundles() {}
function syncNode() {}


const start = async () => {
    
    if (cluster.isMaster) {

        // Starts up the database and logs startup to console
        console.log(`Master ${process.pid} is running`);

        // Creates Node.js worker instances on all cores
        for (let i = 0; i < numCPUs; i++) {
            cluster.fork();
        }
        app.use(bodyParser.json({ limit: '10mb' }));

        if (process.env.NODE_ENV == 'development') {
            app.use(cors())
        }

        //Request handlers right here
        app.post('/createMoat', handler.createMoat)
        app.post('/raw', handler.query)
        app.post('/storePhoto', handler.storePhoto)
        app.post('/storeFile', handler.storeFile)
<<<<<<< HEAD
        app.post('/getMoats', handler.getMoats)
        /*app.post('/storeFile', handler.storeFile)
        app.post('/storePhoto', handler.storePhoto)
        app.post(`/transaction`, handler.transaction)*/

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
=======

        // Syncs data with server.

        await databaseInit()
>>>>>>> master

        //Partition
        await partitions.partitionInit()

        try {
<<<<<<< HEAD
            await bundleInit()
        } catch(e) {
            console.log(e)
        }


        //Create admin schema

        await admin_pool.query(`CREATE TABLE IF NOT EXISTS moats(
            moat_name varchar(128) PRIMARY KEY,
            owner_address varchar(42) NOT NULL,
            api_key varchar(88) NOT NULL,
            encrypted_key varchar(88) NOT NULL,
            encrypted_secret varchar(88) NOT NULL
        );`)

        await admin_pool.query('REVOKE connect ON DATABASE admin FROM PUBLIC;')

        //Creating a map for all databases

        global.database_map = new Map()

        let userAuth = await admin_pool.query(`SELECT moat_name, api_key from moats;`)
        userAuth = userAuth.rows
        userAuth.forEach(user => {
            //Map the moat name to the credentials
            credentials.database = user.moat_name
            try {
                //Try/catch in case there is DB connectivity issue
                global.database_map.set(user.moat_name, {key: decryptKey(user.api_key), pool: new Pool(credentials)})
            } catch(e) {
                console.log(e)
            }
        })

        console.log(global.database_map)

        // Syncs data with server.

        try {
            cron.schedule('0 0 */1 * * *', async function () {
                await syncNode();
                console.log(`Node Synced`.green);
                await shoveBundles();
=======
            cron.schedule('0 0 0 * * *', async function () {
                //await syncNode();
                console.log(`Node Synced`.green);
                await shove();
>>>>>>> master
            })
            } catch(e) {
                console.log('There was an error syncing'.red);
                console.log(e);
            };

        // Avoids running code on several worker threads.
        try {
<<<<<<< HEAD
            await syncNode();
            console.log(`Node Synced`.green);
            await shoveBundles();
=======
            //await syncNode();
            console.log(`Node Synced`.green);
            await shove();
>>>>>>> master
        } catch(e) {
            console.log('There was an error syncing or shoving'.red);
            console.log(e);
        };

        //Making a websocket and http server
        server.on('request', app);
        server.listen(process.env.NODE_PORT, function () {
            console.log(`Synchronizer is running on port ${process.env.NODE_PORT}`)
        })
    }
};


start();