const bodyParser = require('body-parser');
const colors = require('colors');
require(`dotenv`).config();
const numCPUs = require('os').cpus().length;
const cluster = require('cluster');
const Express = require('express');
const app = Express();
const cron = require('node-cron');
//const { shoveBundles } = require('./src/bundler/bundleHandler');
const {shove} = require(`./src/bundling/shove.js`)
//const { syncNode } = require('./src/bundler/syncFuncs');
const handlerFunc = require('./src/handler.js')
const handler = handlerFunc.handler()
const cors = require('cors');
let server = require('http').createServer();
const partitions = require('./src/utils/bundlePartitions.js')
const {databaseInit} = require('./src/databaseInit.js');
const { initCharge, updateMoatCharges } = require('./src/escrow/charge.js');
const {initPools} = require("./src/poolRegistry/pools");

//function shoveBundles() {}

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
        app.post('/getMoats', handler.getMoats)
        app.post('/preparedStatement', handler.preparedStatement)
        app.post('/getMoatDebit',handler.getMoatDebit)

        // Syncs data with server.

        await databaseInit()
        await initCharge()
        await initPools();

        //Partition
        await partitions.partitionInit()

        try {
            cron.schedule('0 0 0 * * *', async function () {
                //await syncNode();
                console.log(`Node Synced`.green);
                await updateMoatCharges()
                await shove();
            })
            } catch(e) {
                console.log('There was an error syncing'.red);
                console.log(e);
            };

        // Avoids running code on several worker threads.
        try {
            //await syncNode();
            console.log(`Node Synced`.green);
            await shove();
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