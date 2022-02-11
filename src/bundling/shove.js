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
