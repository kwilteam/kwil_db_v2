const {pool, Pool, credentials} = require('../database/pool.js')
const { hyphenToSnake, snakeToHyphen } = require('./utils/utils.js')
const {writeToBundleCache} = require('./bundling/bundleFuncs.js')
const { Parser } = require('node-sql-parser');
const parser = new Parser();
const { storePhotos } = require('./filesystem/fileWriter.js');
const { encryptKey } = require('./utils/encryption.js');

const handler = () => {
    class Handler {
        constructor() {

        }

        async createMoat(req, res) {
            /*

            When creating a moat, we are creating a schema in postgres.  We will check if the moat exists by checking if the schema exists.

            If it doesn't exist, then we will create the schema, and update our schema table (located at admin.schemas) with the user credentials.

            */

            let data = req.body

            /*
            Data formatted like:
                data: {
                    user: 'kwil',
                    moat: 'kwil'
                }
            */

            try {

            //First make sure it is snake case
            data.moat = hyphenToSnake(data.moat)

            const admin_pool = global.database_map.get('admin')

            let result = await admin_pool.pool.query(`SELECT datname FROM pg_database WHERE datname LIKE '${data.moat}';`)
            result = result.rows

            

            //If the schema doesn't exist, result will be [].  If it does, result will be [schema_name: data.data.moat]
            
            if (data.key.length != 32) {
                //Putting this here to ensure the key isn't a sql injection since, given its position, it could be possible
                res.send(`API key must have a length of 32`)
            }
            else if (result.length > 0) {
                //If the schema exists already
                await res.send({
                    creation: false,
                    reason: `A moat by this name already exists on this node, or this moat name is restricted.`
                })
            } else {
                //If the schema does not exist

                await pool.query(`CREATE DATABASE ${data.moat};`)
                await pool.query(`REVOKE ALL ON DATABASE ${data.moat} FROM PUBLIC;`)
                await pool.query(`CREATE ROLE ${data.moat} WITH PASSWORD '${data.key}'; ALTER ROLE "${data.moat}" WITH LOGIN; GRANT ALL PRIVILEGES ON DATABASE ${data.moat} TO ${data.moat};`)

                //Now lets store in the admin schema the credentials
                const encryptedKey = encryptKey(data.key)
                await admin_pool.pool.query(`INSERT INTO moats(moat_name, owner_address, api_key, encrypted_key) VALUES ('${data.moat}', '${data.address}', '${encryptedKey}', '${data.encryptedKey}')`)

                //Update the credentials map

                let _credentials = JSON.parse(JSON.stringify(credentials)) //Want to copy it
                _credentials.database = data.moat
                _credentials.user = data.moat
                _credentials.password = data.key
                const newPool = new Pool(_credentials)
                global.database_map.set(data.moat, {key: encryptedKey, pool: newPool})

                await res.send(
                    {
                        creation: true,
                        reason: `Success in creating moat!`
                    }
                )
            }
        } catch(e) {
            console.log(e)
            res.send(
                {
                    creation: false,
                    reason: e.toString()
                }
            )
        }
            res.end()
        }

        async query (req, res) {
            /*

            Will need to check if user and password are valid auth credentials

            */

            try {
            let data = req.body

            data.moat = hyphenToSnake(data.moat)

            const storedCredentials = global.database_map.get(data.moat)
            if (data.apiKey == storedCredentials.key) {
                //Credentials are valid

                try {
                    //Do the business logic here
                    
                    const dbPool = global.database_map.get(data.moat)
                    const queryResult = await dbPool.pool.query(data.query)

                    if (data.store) {
                        //Write to bundle cache

                        const writeData = {
                            query: data.query
                        }
                        writeToBundleCache(req, writeData)
                    }

                    res.send(queryResult)

                } catch(e) {
                    console.log(e)
                    await res.status(400).send(e.toString())
                }
                
            } else {
                //Credentials are invalid
                res.send({
                    valid: false,
                    results: `Invalid database credentials`
                })
            }
            res.end()
        } catch(e) {
            console.log(e)
            res.end(`There was a database error`)
        }
        }

        async storeFile() {
            
        }
    }
    return new Handler()
}

module.exports = {handler}