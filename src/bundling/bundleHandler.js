const feeKey = require('../../key.js').key;
require(`dotenv`).config();
const {v4} = require('uuid');
const knex = require('../../database/db.js');
const Arweave = require('arweave');
const colors = require('colors');
const utils = require('./bundleFuncs.js');
//const harmony = require('../../harmony/harmonyUtils.js');
const arweave = Arweave.init({
    host: 'arweave.net',
    port: 443,
    protocol: 'https',
    timeout: 20000,
});


// Moves all files from bundles/cahcedBundle to bundles/sealedBundles.
const sealBundle = async () => {
    const files = await utils.readFolders(`bundles`);
    //Files is now a list of all moats cached
    for (let i = 0; i<files.length; i++) {
        const statements = await utils.readDir(`bundles/${files[i]}/cachedBundle`)

        //Check if empty.  If so, delete.
        if (statements.length == 0) {
            await utils.rmDir(`bundles/${files[i]}`)
        } else {
            for (let j = 0; j< statements.length; j++) {
                await utils.moveFile(`bundles/${files[i]}/cachedBundle/${statements[j]}`, `bundles/${files[i]}/sealedBundles`)
            }
        }
    };
};

// Takes files from sealed bundles and puts them into a single file in finalized bundles.
const finalizeBundle = async () => {
    let finalBundle = {};
    const moats = await utils.readFolders(`bundles`);

    // Splits bundles up into sub-bundle types (like post, createAccount, etc.) and seals their data accordingly.
    for (let i = 0; i<moats.length; i++) {

        //We grab the subBundle type.  This is the request endpoint the statement came through

        if (!finalBundle[moats[i]]) {
            finalBundle[moats[i]] = []
        }
        const files = await utils.readDir(`bundles/${moats[i]}/sealedBundles`)
        //Now we loop through the files
        for (let j = 0; j< files.length; j++) {
            let fileData = await utils.readFile(`bundles/${moats[i]}/sealedBundles/${files[j]}`)

            if (fileData.length > 0) {
                finalBundle[moats[i]].push(JSON.parse(fileData))
            } else {
                console.log(`${files[i]} contained no data.  Deleting.`);
                await utils.deleteFile(`bundles/${moats[i]}/sealedBundles/${files[j]}`);
            };
        }

        // Deletes remaining bundles in sealedBundles.
    // This happens after finalizing bundles in case the server crashes while finalizing.
    for (let j = 0; j<files.length; j++) {
        try {
            await utils.deleteFile(`bundles/${moats[i]}/sealedBundles/${files[j]}`);
        } catch(e) {
            console.log('Error deleting File');
        };
    };

    //Now I check if data ended up getting pushed.  If not, I delete the moat
        if (finalBundle[moats[i]].length == 0) {
            delete finalBundle[moats[i]]
            await utils.rmDir(`bundles/${moats[i]}`)
        }
    }

    finalBundle = JSON.stringify(finalBundle)
    if (finalBundle.length > 2) {
        finalBundle = JSON.stringify(finalBundle)
        const unique_id = v4()

        //Write to finalized bundles
        await utils.write2File(`finalizedBundles/${unique_id}`, finalBundle);
        await knex('pending_bundles').insert({
            bundle_id: unique_id,
            moats: moats
        })
    } else {
        console.log('Bundle was empty')
    }
};

// Submits finalized bundles to Arweave.
const submitBundles = async () => {
    const files = await utils.readDir(`finalizedBundles`);

    // Loops through all finalized bundles and sends them to Arweave.
    // Pending bundles are moved to pendingBundles folder in wrapper function.
    for (let i=0; i<files.length; i++) {
        await sendBundleToArweave(`finalizedBundles/${files[i]}`, false);
    };
};

// Scans pending bundles to check their upload status and updates their existence accordingly.
const scanPendingBundles = async () => {
    const files = await utils.readDir(`pendingBundles`);
    for (let i = 0; i<files.length; i++) {
        const status = await arweave.transactions.getStatus(files[i]);
        
        // Executes pending bundle management according ARWeave bundle transaction status.
        if (status.status == 202) { // Outputs that bundle is still pending to console.
            console.log(`${files[i]} is still pending`);
            console.log(status);
        } else if (status.status == 200) { // Outputs that bundle has been mined to console and adds transaction data to Harmony network.
            console.log(`${files[i]} has been mined.  Deleting from pending pool.  Status: ${status.status}`);
            await utils.deleteFile(`pendingBundles/${files[i]}`);
            //await harmony.addBlock(process.env.DATA_MOAT, files[i]);
        } else if (status.status == 404) { // Resubmits bundle to ARWeave network if transaction fails to get mined.
            console.log(`${files[i]} was pending and expired.  Resumbitting...`);
            const txid = await sendBundleToArweave(`pendingBundles/${files[i]}`);
                // Adds bundle to registry.
                await knex('bundles').insert({
                    bundle_id: txid,
                    synced: true,
                    height: 1, // Since this node is submitting the submission height is 1.
                    moat: process.env.DATA_MOAT
                });
        } else {
            console.log(`There was an error.  Arweave returned an unexpected status code.`);
            console.log(status);
        };
    };
};


// Submits bundle from _path parameter to ARWeave.
// _pending is set to true by default, however if false, it will move the bundle to pending and delete previous path.
const sendBundleToArweave = async (_path, _pending=true) => {
    // Reads data from bundles and creates corresponding ARWeave transaction.
    let readData = await utils.readFile(_path);

    //We need to retrieve the moats from the DB

    //First we must find the unique identifier

    const paths = _path.split("/")

    let moats = await knex('pending_bundles').select('moats').where({bundle_id: paths[paths.length-1]})
    moats = moats.moats

    let arweaveTransaction = await arweave.createTransaction(
        { data: readData },
        feeKey
    );

    // Adds ARWeave transaction tags. Necessary tags are application, version, and data moat.
    arweaveTransaction.addTag('Application', 'Kwil');
    arweaveTransaction.addTag('Version', process.env.BUNDLE_VERSION);

    //Loop through adding moat tags
    for (let i = 0; i< moats.length; i++) {
        arweaveTransaction.addTag('Moat', moats[i]);
    }
    
    // Signs generated ARWeave transaction.
    await arweave.transactions.sign(arweaveTransaction, feeKey);
    
    // Gets ARWeave uploader for chunk uploading and uploads data. Logs success.
    let uploader = await arweave.transactions.getUploader(
        arweaveTransaction
    );
    while (!uploader.isComplete) {
        await uploader.uploadChunk();
        console.log(
            `${uploader.pctComplete}% complete, ${uploader.uploadedChunks}/${uploader.totalChunks}`
        );
    };
    console.log(`Bundle submitted to Arweave.  Bundle path: ${_path}.  Arweave TXID: ${arweaveTransaction.id}`);


    if (_pending == false) { // Moves file from wherever it was to pending.
        console.log(`Bundle ${_path} being set to pending.`);
        await utils.moveFile(_path, `pendingBundles`, arweaveTransaction.id);

    } else { // Renames new file for resubmission if it has already been set to pending and failed to get mined.
        console.log(`Bundle ${_path} already set to pending.  It has been resubmitted.`);
        await utils.rename(_path, `pendingBundles/${arweaveTransaction.id}`);
    }
    return {
        id: arweaveTransaction.id
    };
};


const wait = (timeToDelay = 1000) => new Promise((resolve) => setTimeout(resolve, timeToDelay));


// Executes bundle functions in the correct order for bundle rearrangement/submission.
const shoveBundles = async () => {
    if (process.env.SHOVE == false.toString()) {return}
    await sealBundle();
    console.log('Bundle Sealed'.green);
    await wait();
    await finalizeBundle();
    console.log(`Bundle Finalized`.green);
    await wait();
    await scanPendingBundles();
    console.log(`Pending Bundles Scanned`.green);
    await wait();
    await submitBundles();
    console.log(`New Bundles Submitted`.green);
};


module.exports = { sealBundle, finalizeBundle, submitBundles, scanPendingBundles, shoveBundles, wait }