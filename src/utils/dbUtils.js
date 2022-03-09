const {Pool, credentials} = require('../../database/pool.js')

const ifDBExists = async (_db) => {
    let result = await global.admin_pool.query(`SELECT datname FROM pg_database WHERE datname LIKE '${_db.moat}';`)
    result = result.rows
    if (result.length > 0) {
        return true
    } else {
        return false
    }
}

const createDatabase = async (data) => {
    await global.admin_pool.query(`CREATE DATABASE ${data.moat};`)
    await global.admin_pool.query(`REVOKE connect ON DATABASE ${data.moat} FROM PUBLIC;`)
    await global.admin_pool.query(`CREATE ROLE ${data.moat} WITH LOGIN PASSWORD 'password'; ALTER ROLE "${data.moat}" WITH LOGIN; GRANT ALL PRIVILEGES ON DATABASE ${data.moat} TO ${data.moat};`)
    await global.admin_pool.query(`INSERT INTO moats(moat_name, owner_address, public_key, encrypted_key, encrypted_secret) VALUES ('${data.moat}', '${data.address}', '${data.publicKey}', '${data.encryptedKey}', '${data.secret}')`)
    //Update the credentials map

    let _credentials = JSON.parse(JSON.stringify(credentials)) //Want to copy it
    _credentials.database = data.moat
    _credentials.user = data.moat
    const newPool = new Pool(_credentials)
    global.database_map.set(data.moat, {key: data.publicKey, pool: newPool})
    global.Moat_Charges.set(data.moat, 0)
    global.accumulationMap.set(data.moat, 0);
    global.moatPoolMap.set(data.moat, new Map())
    console.log(global.accumulationMap);
    console.log(global.moatPoolMap);
}

const getMoatsOnNode = async () => {
    let moats = await global.admin_pool.query(`SELECT DISTINCT moat_name FROM moats`)
    moats = moats.rows
    let retMoat = []
    moats.forEach( moat => {
        retMoat.push(moat.moat_name)
    })
    return retMoat
}

module.exports = {ifDBExists, createDatabase, getMoatsOnNode}