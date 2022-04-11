const fsJ = require('fs-jetpack')
const fs = require('fs')

const initMissingFiles = async () => {
    /*Need to init:
        folders: public, bundles
        files: .env, key.js
    */
    fsJ.dir('./bundles')
    fsJ.dir('./public')

    if (!fs.existsSync('./.env')) {
        fs.writeFileSync(`./.env`,
        `ARWEAVE_GRAPH_HOST = https://arweave.net
NODE_PORT = 1984
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=password
DATABASE_NAME=postgres
DATABASE_CONNECTOR= postgresql
NODE_ENV = production
BUNDLE_VERSION = 1.3
SYNCED_DATA_MOATS = 
SYNC = false
SHOVE = false
ALLOW_REGISTRATION = false
UPCHARGE_RATE = 1.3
        
KEY_SECRET = 
PRIVATE_KEY = 
REGISTRY_ADDRESS = https://registry.kwil.xyz
ACCEPTED_TOKENS = USDC_ethereum USDC_polygon`)
    }

    if (!fs.existsSync('./key.json')) {
        fs.writeFileSync('./key.json', '')
    }
}

module.exports = {initMissingFiles}