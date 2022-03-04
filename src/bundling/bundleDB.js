const { chargeQuery } = require("../escrow/charge")

/*
This file will be used to write bundle data to a database

The table containing bundles will contain four columns: data (the stringified body data), moat name, the endpoint it was sent to, and an auto incrementer.
*/
const write2Bundle = async (_req, _data) => {
    try {
        let endpoint = _req.originalUrl.split("/")
        await chargeQuery(_req, _data)
        await global.admin_pool.query(`INSERT INTO "bundle_${global.current_partition}" (post_data, moat_name, request_endpoint) VALUES ($1, $2, $3)`, [JSON.stringify(_data), _req.body.moat, endpoint[1]]) //Prepared Statements to prevent SQL injection
    } catch(e) {
        console.log(e)
    }
}

module.exports = {write2Bundle}