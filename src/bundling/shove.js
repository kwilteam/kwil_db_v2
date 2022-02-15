/*
This file contains instructions for managing bundles in the database.  It will function as follows:

It will set a timestamp at which the bundle cache stops.

It will get a list of moats from the moats table

It will get a list of endpoints from the cache table.

For each moat, for each endpoint, it will query all data that has been entered since before this timestamp, sorted by oldest first.  This data will be written to one mega object.
Each key in this object will be the moat name.  Inside of that, each key will be named after a request endpoint.  Inside of each of those will be a chronologically sorted array of each data entry, sorted by oldest first.

This will then be submitted to Arweave and written to the file system at the location bundles/[arweave_tx_id]

This will also be added to a pending_bundles database, which will contain rows tracking Arweave TXID and an array of all moats contained in that bundle.
*/
<<<<<<< HEAD

=======
require(`dotenv`).config();
>>>>>>> master
const {key} = require('../../key.js')
const Arweave = require('arweave')
const arweave = Arweave.init({
    host: 'arweave.net',
    port: 443,
    protocol: 'https',
    timeout: 20000,
})

<<<<<<< HEAD
const partitions = require('../utils/bundlePartition.js')
const { write2File, deleteFile } = require('./bundleFuncs.js')

const shoveBundles = async () => {

    //Will start by switching the bundle partition
    const currentPartition = !!global.current_partition //FIXME: Doing this to copy, unsure if booleans copy automatically or not
    console.log(currentPartition)
    //await partitions.switchPartition()
=======
const partitions = require('../utils/bundlePartitions.js')
const { write2File, deleteFile, readFile, rename } = require('./bundleFuncs.js')

const shoveBundles = async () => {
    if (process.env.SHOVE == 'false') {
        return
    }
    //Will start by switching the bundle partition
    const currentPartition = !!global.current_partition //FIXME: Doing this to copy, unsure if booleans copy automatically or not
    console.log(currentPartition)
    await partitions.switchPartition()
>>>>>>> master
    //Worth noting that switching partition doesn't delete the old one, we need to use delete offset partition later!

    //Get moats and endpoints
    let moats = await global.admin_pool.query(`SELECT moat_name FROM moats;`)
    moats = moats.rows

    let endpoints = await global.admin_pool.query(`SELECT DISTINCT request_endpoint FROM "bundle_${currentPartition}"`)
    endpoints = endpoints.rows

    const finalObj = {}
    //Moat loop
    for (let i = 0; i<moats.length; i++) {
        finalObj[moats[i].moat_name] = {}

        //Endpoint loop
        for (let j = 0; j<endpoints.length; j++) {
            let data = await global.admin_pool.query(`SELECT post_data FROM "bundle_${currentPartition}" WHERE moat_name = '${moats[i].moat_name}' AND request_endpoint = '${endpoints[j].request_endpoint}'`)
<<<<<<< HEAD
            finalObj[moats[i].moat_name][endpoints[j].request_endpoint] = JSON.parse(data.rows)
=======
            finalObj[moats[i].moat_name][endpoints[j].request_endpoint] = data.rows
        }

        if (Object.keys(finalObj[moats[i].moat_name]).length == 0) {
            //No data was added
            console.log(`${moats[i].moat_name} was empty`)
            delete finalObj[moats[i].moat_name]
>>>>>>> master
        }
    }

    //We now have our bundle!  Submit to arweave
<<<<<<< HEAD
    let arweaveTransaction = await arweave.createTransaction(
        finalObj,
=======
    let arweaveTransaction = await arweave.createTransaction({data: JSON.stringify(finalObj)},
>>>>>>> master
        key
    );

    for (let i = 0; i<moats.length; i++) {
        arweaveTransaction.addTag('Moat', moats[i].moat_name);
    }

    await arweave.transactions.sign(arweaveTransaction, key);

<<<<<<< HEAD
    //Now lets store the arweave txid

    await write2File(arweaveTransaction.id, JSON.stringify(finalObj))
    await global.admin_pool.query(`INSERT INTO pending_bundles (bundle_id, moats) VALUES ('${arweaveTransaction.id}', ARRAY ${moats})`)
=======
    //We nee to remove moat_name from the moats array to input to sql
    moats = cleanMoatNames(moats)

    //Return empty if no moats
    if (!containsData(moats) || !isBlockEmpty(finalObj)) {
        console.log(`Block empty, not submitting`)
        return
    }

    //Now lets store the arweave txid

    await write2File('bundles/'+arweaveTransaction.id, JSON.stringify(finalObj))
    await global.admin_pool.query(`INSERT INTO pending_bundles (bundle_id, moats) VALUES ($1, $2)`, [arweaveTransaction.id, moats])
>>>>>>> master

    let uploader = await arweave.transactions.getUploader(
        arweaveTransaction
    );
    try {
        while (!uploader.isComplete) {
            await uploader.uploadChunk();
            console.log(
                `${uploader.pctComplete}% complete, ${uploader.uploadedChunks}/${uploader.totalChunks}`
            );
        };
    } catch(e) {
        console.log(e)
        //Failed to submit to arweave, but the filesystem wrote, so lets delete this partition
    } finally {
        await partitions.deleteDefinedPartition(currentPartition)
    }
<<<<<<< HEAD


}

const scanPendingBundles = async () => {
    const pendingBundles = await global.admin_pool.query(`SELECT * FROM pending_bundles`)
=======
}

function cleanMoatNames (moats) {
    const retVal = []
    moats.forEach(moat => {
        retVal.push(moat.moat_name)
    })
    return retVal
}

function containsData (moats) {
    if (moats.length > 0) {
        return true
    } else {
        return false
    }
}

function isBlockEmpty (dataObj) {
    if (Object.keys(dataObj).length > 0) {
        return true
    } else {
        return false
    }
}

const scanPendingBundles = async () => {
    let pendingBundles = await global.admin_pool.query(`SELECT * FROM pending_bundles`)
    pendingBundles = pendingBundles.rows
>>>>>>> master
    for (let i = 0; i<pendingBundles.length; i++) {
        const status = await arweave.transactions.getStatus(pendingBundles.bundle_id);

        if (status.status == 202) { // Outputs that bundle is still pending to console.

<<<<<<< HEAD
            console.log(`${pendingBundles[i]} is still pending.  Status: ${status.status}`);
=======
            console.log(`${pendingBundles[i].bundle_id} is still pending.  Status: ${status.status}`);
>>>>>>> master

        } else if (status.status == 200) { // Outputs that bundle has been mined to console and adds transaction data to Harmony network.

            console.log(`${pendingBundles[i]} has been mined.  Deleting from pending pool.  Status: ${status.status}`);
<<<<<<< HEAD
            await deleteFile(`pendingBundles/${pendingBundles[i]}`);
            //await harmony.addBlock(process.env.DATA_MOAT, files[i]);

        } else if (status.status == 404) { // Resubmits bundle to ARWeave network if transaction fails to get mined.
            
            console.log(`${pendingBundles[i]} was pending and expired.  Resumbitting...`);
            //const txid = await sendBundleToArweave(`pendingBundles/${pendingBundles[i]}`);
                // Adds bundle to registry.
=======
            await deleteFile(`bundles/${pendingBundles[i].bundle_id}`);

        } else if (status.status == 404) { // Resubmits bundle to ARWeave network if transaction fails to get mined.

            console.log(`${pendingBundles[i].bundle_id} was pending and expired.  Resumbitting...`);
            //const txid = await sendBundleToArweave(`pendingBundles/${pendingBundles[i]}`);
                // Adds bundle to registry.
                try {
                    await sendBundleToArweave(pendingBundles[i].bundle_id, pendingBundles[i].moats)
                } catch(e) {
                    console.log(e)
                }
>>>>>>> master

        } else {
            console.log(`There was an error.  Arweave returned an unexpected status code.`);
            console.log(status);
        };
    }
}

<<<<<<< HEAD
module.exports = {shoveBundles, scanPendingBundles}
=======
async function sendBundleToArweave(_id, _moats) {
    //Read in the file
    const bundleData = await readFile(`bundles/${_id}`)
    let arweaveTransaction = await arweave.createTransaction({data: JSON.stringify(bundleData)},
        key
    );

    for (let i = 0; i<_moats.length; i++) {
        arweaveTransaction.addTag('Moat', _moats[i].moat_name);
    }

    await arweave.transactions.sign(arweaveTransaction, key);
    console.log('In sendToArweave:')
    console.log(_moats)
    console.log(arweaveTransaction)
    await global.admin_pool.query(`INSERT INTO pending_bundles (bundle_id, moats) VALUES ($1, $2)`, [arweaveTransaction.id, _moats])
    await global.admin_pool.query(`DELETE FROM pending_bundles WHERE bundle_id LIKE '${_id}'`) //Delete old value
    
    //Rename the bundle file
    await rename(`bundles/${_id}`,`bundles/${arweaveTransaction.id}`)

    let uploader = await arweave.transactions.getUploader(
        arweaveTransaction
    );

    while (!uploader.isComplete) {
        await uploader.uploadChunk();
        console.log(
            `${uploader.pctComplete}% complete, ${uploader.uploadedChunks}/${uploader.totalChunks}`
        );
    };
}

async function shove() {
    await shoveBundles()
    console.log('Scanning pending')
    await scanPendingBundles()
    console.log('Scan complete')
}

module.exports = {shoveBundles, scanPendingBundles, shove}
>>>>>>> master
