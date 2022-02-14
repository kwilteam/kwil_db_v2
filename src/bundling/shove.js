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

const {key} = require('../../key.js')
const Arweave = require('arweave')
const arweave = Arweave.init({
    host: 'arweave.net',
    port: 443,
    protocol: 'https',
    timeout: 20000,
})

const partitions = require('../utils/bundlePartition.js')
const { write2File, deleteFile } = require('./bundleFuncs.js')

const shoveBundles = async () => {

    //Will start by switching the bundle partition
    const currentPartition = !!global.current_partition //FIXME: Doing this to copy, unsure if booleans copy automatically or not
    console.log(currentPartition)
    //await partitions.switchPartition()
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
            finalObj[moats[i].moat_name][endpoints[j].request_endpoint] = JSON.parse(data.rows)
        }
    }

    //We now have our bundle!  Submit to arweave
    let arweaveTransaction = await arweave.createTransaction(
        finalObj,
        key
    );

    for (let i = 0; i<moats.length; i++) {
        arweaveTransaction.addTag('Moat', moats[i].moat_name);
    }

    await arweave.transactions.sign(arweaveTransaction, key);

    //Now lets store the arweave txid

    await write2File(arweaveTransaction.id, JSON.stringify(finalObj))
    await global.admin_pool.query(`INSERT INTO pending_bundles (bundle_id, moats) VALUES ('${arweaveTransaction.id}', ARRAY ${moats})`)

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


}

const scanPendingBundles = async () => {
    const pendingBundles = await global.admin_pool.query(`SELECT * FROM pending_bundles`)
    for (let i = 0; i<pendingBundles.length; i++) {
        const status = await arweave.transactions.getStatus(pendingBundles.bundle_id);

        if (status.status == 202) { // Outputs that bundle is still pending to console.

            console.log(`${pendingBundles[i]} is still pending.  Status: ${status.status}`);

        } else if (status.status == 200) { // Outputs that bundle has been mined to console and adds transaction data to Harmony network.

            console.log(`${pendingBundles[i]} has been mined.  Deleting from pending pool.  Status: ${status.status}`);
            await deleteFile(`pendingBundles/${pendingBundles[i]}`);
            //await harmony.addBlock(process.env.DATA_MOAT, files[i]);

        } else if (status.status == 404) { // Resubmits bundle to ARWeave network if transaction fails to get mined.
            
            console.log(`${pendingBundles[i]} was pending and expired.  Resumbitting...`);
            //const txid = await sendBundleToArweave(`pendingBundles/${pendingBundles[i]}`);
                // Adds bundle to registry.

        } else {
            console.log(`There was an error.  Arweave returned an unexpected status code.`);
            console.log(status);
        };
    }
}

module.exports = {shoveBundles, scanPendingBundles}