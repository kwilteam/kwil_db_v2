const bodyParser = require('body-parser');
require(`dotenv`).config();
const numCPUs = require('os').cpus().length;
const cluster = require('cluster');
const Express = require('express');
const app = Express();
const cron = require('node-cron');
//const { shoveBundles } = require('./src/bundler/bundleHandlers');
//const { syncNode } = require('./src/bundler/syncFuncs');
const { bundleInit } = require('./src/bundles/bundleInit');
const handlerFunc = require('./src/handler.js')
const handler = handlerFunc.handler()
const {pool} = require('./database/pool.js')
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

        //Request handlers right here
        app.post('/createMoat', handler.createMoat)
        app.post('/raw', handler.query)
        /*app.post('/storeFile', handler.storeFile)
        app.post('/storePhoto', handler.storePhoto)
        app.post(`/transaction`, handler.transaction)*/
        app.get('/raw', handler.query)
        //app.use(Express.static('public', { fallthrough: false }));

        //Create a bundle table
        await pool.query(`CREATE TABLE IF NOT EXISTS bundles(
            bundle_id varchar(43) PRIMARY KEY,
            height integer NOT NULL,
            cursor_id varchar(44) NOT NULL,
            synced boolean NOT NULL,
            moat varchar(64) NOT NULL
          );`)


        //Init bundles
        try {
            await bundleInit()
        } catch(e) {
            console.log(e)
        }

        //Creating a map for all databases

        global.database_map = new Map()
        let userAuth = await pool.query(`SELECT * from admin.schemas;`)
        userAuth = userAuth.rows
        console.log(userAuth)
        userAuth.forEach(user => {
            //Map the moat name to the credentials
            global.database_map.set(user.moat_name, {user: user.username, password: user.moat_password})
        })

        console.log(global.database_map)

        //Create admin schema

        await pool.query(`CREATE SCHEMA IF NOT EXISTS admin;`)
        await pool.query(`CREATE TABLE IF NOT EXISTS admin.schemas(
            moat_name varchar(128) PRIMARY KEY,
            username varchar(128) NOT NULL,
            moat_password varchar(256) NOT NULL
        );`)

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