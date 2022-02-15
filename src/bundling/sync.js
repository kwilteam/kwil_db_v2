/*
This will be used to sync data posted to Arweave

It will start by getting all moats that are served by this node.

It will then query for those on the Arweave gateway, sorted by the oldest first.

The TXIDs will be stored in the table bundles

After querying, it will, from oldest to newest, run through each query, JPEG, and file write, checking the hash, and then subsequently, if the hash matches the stored value, store the data
*/

