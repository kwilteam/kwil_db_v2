const bodyParser = require('body-parser');
const colors = require('colors');
require(`dotenv`).config();
const numCPUs = require('os').cpus().length;
const cluster = require('cluster');
const Express = require('express');
const app = Express();
const cron = require('node-cron');
//const { shoveBundles } = require('./src/bundler/bundleHandler');
//const { syncNode } = require('./src/bundler/syncFuncs');
const { bundleInit } = require('./src/bundling/bundleInit');
const handlerFunc = require('./src/handler.js')
const handler = handlerFunc.handler()
const {pool, Pool, credentials} = require('./database/pool.js')
const { decryptKey } = require('./src/utils/encryption');
const cors = require('cors');
let server = require('http').createServer();

function shoveBundles() {}
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
        /*app.post('/storeFile', handler.storeFile)
        app.post('/storePhoto', handler.storePhoto)
        app.post(`/transaction`, handler.transaction)*/
        app.get('/raw', handler.query)
        //app.use(Express.static('public', { fallthrough: false }));

        //Create bundleDB table for recently submitted bundles
        await pool.query(`CREATE TABLE IF NOT EXISTS bundleDB(
            cursor_id varchar(44) NOT NULL,
            moat varchar(64) NOT NULL,
            submission_time timestamptz NOT NULL,
            data varchar(2048) NOT NULL
          );`)

        //Create a bundle table
        await pool.query(`CREATE TABLE IF NOT EXISTS bundles(
            bundle_id varchar(43) PRIMARY KEY,
            height integer NOT NULL,
            cursor_id varchar(44) NOT NULL,
            synced boolean NOT NULL,
            moat varchar(64) NOT NULL
          );`)

        //Create pending bundle table
        await pool.query(`CREATE TABLE IF NOT EXISTS pending_bundles(
            bundle_id text,
            moats text[]
        )`)


        //Init bundles
        try {
            await bundleInit()
        } catch(e) {
            console.log(e)
        }

        //Create admin schema

        try {
            //Putting this in try catch since database likely exists
            await pool.query(`CREATE DATABASE admin;`)
        } catch(e) {
            console.log(`Admin already exists`)
        }

        //Now we create the master pool
        credentials.database = 'admin'
        const admin_pool = new Pool(credentials)

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

        //Set admin pool
        global.database_map.set('admin', {key: null, pool: admin_pool})

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
            })
            } catch(e) {
                console.log('There was an error syncing'.red);
                console.log(e);
            };

        // Avoids running code on several worker threads.
        try {
            await syncNode();
            console.log(`Node Synced`.green);
            await shoveBundles();
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