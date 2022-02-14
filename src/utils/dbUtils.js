const {Pool, credentials} = require('../../database/pool.js')

const ifDBExists = async (_db) => {
    let result = await global.admin_pool.query(`SELECT datname FROM pg_database WHERE datname LIKE '${data.moat}';`)
    result = result.rows
    if (result.rows.length > 0) {
        return true
    } else {
        return false
    }
}

const createDatabase = async (data) => {
    await global.admin_pool.query(`CREATE DATABASE ${data.moat};`)
    await global.admin_pool.query(`REVOKE ALL ON DATABASE ${data.moat} FROM PUBLIC;`)
    await global.admin_pool.query(`CREATE ROLE ${data.moat}; ALTER ROLE "${data.moat}" WITH LOGIN; GRANT ALL PRIVILEGES ON DATABASE ${data.moat} TO ${data.moat};`)
    await global.admin_pool.query(`INSERT INTO moats(moat_name, owner_address, public_key, encrypted_key, encrypted_secret) VALUES ('${data.moat}', '${data.address}', '${data.publicKey}', '${data.encryptedKey}', '${data.secret}')`)
    //Update the credentials map

    let _credentials = JSON.parse(JSON.stringify(credentials)) //Want to copy it
    _credentials.database = data.moat
    _credentials.user = data.moat
    const newPool = new Pool(_credentials)
    global.database_map.set(data.moat, {key: data.publicKey, pool: newPool})
}

module.exports = {ifDBExists, createDatabase}