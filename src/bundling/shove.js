const { pool } = require("../../database/pool");
const feeKey = require('../../key.js').key;
const Arweave = require('arweave');
const arweave = Arweave.init({
    host: 'arweave.net',
    port: 443,
    protocol: 'https',
    timeout: 20000,
});
const fsJ = require('fs-jetpack');

/*
    This file contains instructions for managing bundles in the database.  It will function as follows:

    It will get a list of moats from the moats table

    It will get a list of endpoints from the cache table.

    It will set a timestamp at which the bundle cache stops.

    For each moat, for each endpoint, it will query all data that has been entered since before this timestamp, sorted by oldest first.  This data will be written to one mega object.
    Each key in this object will be the moat name.  Inside of that, each key will be named after a request endpoint.  Inside of each of those will be a chronologically sorted array of each data entry, sorted by oldest first.

    This will then be submitted to Arweave and written to the file system at the location bundles/[arweave_tx_id]

    This will also be added to a pending_bundles database, which will contain rows tracking Arweave TXID and an array of all moats contained in that bundle.
*/

const sealBundles = async () => {
    
    /*
        Gets most recent bundle data from bundleDB (i.e. moats, endpoints from cache table (cursor_id), and timestamps). Stores to object.
    */
    // Gets bundleDB table data from database and stores into array of objects–each of which contains column values.
    let bundleDB = (await pool.query(`SELECT * FROM bundleDB`)).rows;

    /*
        Using bundle data, takes every bundle from bundles and write to mega object where each key is the data moat name, and each value
        is a sub-object whose keys/values are the cursor_id's (endpoints) and array of each data entry starting with the oldest values.
    */
    // Initializes necessary variables for bundle looping.
    let moatsObject = {};
    bundleTimes = [];
    bundleDatas = [];
    bundleMoats = [];
    bundleCursorIds = [];
    let cursorIdObject = {};
    for ( i = 0; i < bundleDB.length; i++ ) {
        // Resets cursorIdObject to empty. Initializes reused variables in loop. Adds bundle times and datas to array.
        cursorIdObject = {};
        currentBundle = bundleDB[i];
        bundleTimes.push(currentBundle.submission_time);
        bundleDatas.push(currentBundle.data);
        bundleMoats.push(currentBundle.moat);
        bundleCursorIds.push(currentBundle.cursor_id);
        if (!( currentBundle.moat in moatsObject )) {
            // Assigns new moat/cursorid pairs.
            cursorIdObject[currentBundle.cursor_id] = [];
            moatsObject[currentBundle.moat] = cursorIdObject;
        } else if (!( currentBundle.cursor_id in moatsObject[currentBundle.moat] )) {
            // Adds cursorids to moats with existing cursorids.
            cursorIdObject = moatsObject[currentBundle.moat];
            cursorIdObject[currentBundle.cursor_id] = [];
            moatsObject[currentBundle.moat] = cursorIdObject;
        };
    };

    // Bubble sorts times/data into chronological order and adds to data in moats/cursor_ids
    for ( var i = 0; i < bundleTimes.length; i++ ) {
     
        // Last i elements are already in place  
        for( var j = 0; j < ( bundleTimes.length - i - 1 ); j++ ){
            
            // Checking if the item at present iteration 
            // is greater than the next iteration
            if( bundleTimes[j] > bundleTimes[ j + 1 ] ) {
                
                // If the condition is true then swaps bundle times
                var temp = bundleTimes[j]
                bundleTimes[j] = bundleTimes[j + 1]
                bundleTimes[j + 1] = temp

                // If the condition is true then swaps data values
                var temp = bundleDatas[j]
                bundleDatas[j] = bundleDatas[j + 1]
                bundleDatas[j + 1] = temp

                // If the condition is true then swaps moat values
                var temp = bundleMoats[j]
                bundleMoats[j] = bundleMoats[j + 1]
                bundleMoats[j + 1] = temp

                // If the condition is true then swaps cursor_id values
                var temp = bundleCursorIds[j]
                bundleCursorIds[j] = bundleCursorIds[j + 1]
                bundleCursorIds[j + 1] = temp
            };
        };
        moatsObject[bundleMoats[i]][bundleCursorIds[i]].push(bundleDatas[i]);
    };

    // Submits bundles to arweave
    let arweaveTransaction = await arweave.createTransaction(
        { data: JSON.stringify(moatsObject) },
        feeKey
    );

    // Adds ARWeave transaction tags. Necessary tags are application and version.
    arweaveTransaction.addTag('Application', 'Kwil');
    arweaveTransaction.addTag('Version', process.env.BUNDLE_VERSION);

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
    console.log(`Bundle submitted to Arweave.  Bundle path: ./bundles/${arweaveTransaction.id}.  Arweave TXID: ${arweaveTransaction.id}`);

    // Saves bundle object to bundles/[arweave_tx_id]
    fsJ.file(`./bundles/${arweaveTransaction.id}`, { content: moatsObject });

    // Writes bundle_id and data moats array for moats in bundle to pending_bundles table once bundles submitted.
    await pool.query(`INSERT INTO pending_bundles (bundle_id, moats) VALUES ('${arweaveTransaction.id}','{${Object.keys(moatsObject)}}');`);

};

sealBundles();