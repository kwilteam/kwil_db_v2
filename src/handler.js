<<<<<<< HEAD
const {Pool, credentials} = require('../database/pool.js')
const { hyphenToSnake, snakeToHyphen } = require('./utils/utils.js')
const {writeToBundleCache} = require('./bundling/bundleFuncs.js')
const {write2Bundle} = require('./bundling/bundleDB.js')
const { Parser } = require('node-sql-parser');
const parser = new Parser();
const { storePhotos } = require('./filesystem/fileWriter.js');
const { encryptKey } = require('./utils/encryption.js');
const fsJ = require("fs-jetpack");
const fs = require("fs");
const registry = require('./registry/mainRegistry')

const handler = () => {
    class Handler {
        constructor() {

        }

        async createMoat(req, res) {
            /*

            When creating a moat, we are creating a schema in postgres.  We will check if the moat exists by checking if the schema exists.

            If it doesn't exist, then we will create the schema, and update our schema table (located at admin.schemas) with the user credentials.

=======
const { hyphenToSnake } = require('./utils/utils.js')
const {ifDBExists, createDatabase} = require('./utils/dbUtils')
const {write2Bundle} = require('./bundling/bundleDB.js')
const fsJ = require("fs-jetpack");
const fs = require("fs");
const { checkQuerySig } = require('./signatures/signatures.js');

const handler = () => {
    class Handler {

        async createMoat(req, res) {
            /*
            When creating a moat, we create a new database.  We first need to check if the database exists
            Then, if not, create the database
>>>>>>> master
            */

            let data = req.body

<<<<<<< HEAD
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
=======
            try {

            //First make sure it is snake case
            console.log(data)
            data.moat = hyphenToSnake(data.moat)
            const dbExists = await ifDBExists(data.moat)
            //If the schema doesn't exist, result will be [].  If it does, result will be [schema_name: data.data.moat]
            
            if (data.publicKey.length != 683) {
                console.log(data.publicKey)
                //Putting this here to ensure the key isn't a sql injection since, given its position, it could be possible
                res.send(`Public Key must be length 683`)
            }
            else if (dbExists) {
>>>>>>> master
                //If the schema exists already
                await res.send({
                    creation: false,
                    reason: `A moat by this name already exists on this node, or this moat name is restricted.`
                })
            } else {
                //If the schema does not exist
<<<<<<< HEAD

                await admin_pool.query(`CREATE DATABASE ${data.moat};`)
                await admin_pool.query(`REVOKE ALL ON DATABASE ${data.moat} FROM PUBLIC;`)
                await admin_pool.query(`CREATE ROLE ${data.moat} WITH PASSWORD '${data.key}'; ALTER ROLE "${data.moat}" WITH LOGIN; GRANT ALL PRIVILEGES ON DATABASE ${data.moat} TO ${data.moat};`)

                //Now lets store in the admin schema the credentials
                const encryptedKey = encryptKey(data.key)
                await admin_pool.pool.query(`INSERT INTO moats(moat_name, owner_address, api_key, encrypted_key, encrypted_secret) VALUES ('${data.moat}', '${data.address}', '${encryptedKey}', '${data.encryptedKey}', '${data.secret}')`)

                //Update the credentials map

                let _credentials = JSON.parse(JSON.stringify(credentials)) //Want to copy it
                _credentials.database = data.moat
                _credentials.user = data.moat
                _credentials.password = data.key
                const newPool = new Pool(_credentials)
                global.database_map.set(data.moat, {key: data.key, pool: newPool})

                await registry.addMoat(data.moat,data.address,data.key,data.secret)

=======
                await createDatabase(data)
>>>>>>> master
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
<<<<<<< HEAD
            /*

            Will need to check if user and password are valid auth credentials

            */

            try {
            let data = req.body

            data.moat = hyphenToSnake(data.moat)

            const storedCredentials = global.database_map.get(data.moat)
            if (data.apiKey == storedCredentials.key && typeof data.hash == 'string') {
=======
            try {
                let data = req.body

                data.moat = hyphenToSnake(data.moat)
                let senderValidity = false
                try {
                    senderValidity = await checkQuerySig(data)
                } catch(e) {
                    res.send('If this database exists, it is not being validated by this node.')
                }

            if (senderValidity) {
>>>>>>> master
                //Credentials are valid, contains the hash

                try {
                    //Do the business logic here
<<<<<<< HEAD
                    
                    const dbPool = global.database_map.get(data.moat)
                    const queryResult = await dbPool.pool.query(data.query)
=======
                    const dbPool = global.database_map.get(data.moat)
                    const queryResult = await dbPool.pool.query(data.data)
>>>>>>> master

                    if (data.store) {
                        //Write to bundle cache

                        const writeData = {
<<<<<<< HEAD
                            q: data.query,
=======
                            q: data.data,
>>>>>>> master
                            t: data.timestamp,
                            h: data.hash
                        }
                        await write2Bundle(req, writeData)
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
<<<<<<< HEAD
                    results: `Invalid database credentials`
=======
                    results: `Invalid database signature`
>>>>>>> master
                })
            }
            res.end()
        } catch(e) {
            console.log(e)
            res.end(`There was a database error`)
        }
        }

        async storeFile(req,res) {
            const data = req.body;

            try {
                // Returns nothing if no photos are inputted into function.
                if (data.file == null) {
                    return;
                }

                data.moat = hyphenToSnake(data.moat)

<<<<<<< HEAD
                const storedCredentials = global.database_map.get(data.moat)
                if (data.apiKey == storedCredentials.key) {

                    console.log('apiKey matches');

                    const subDirects = data.path.split('/')
                    console.log(subDirects)
=======
                const validSig = await checkQuerySig(data)
                if (validSig) {

                    const subDirects = data.path.split('/')
>>>>>>> master
                    let finPath = ''
                    if (subDirects.length>1) {
                        for (let j=0; j<subDirects.length-1; j++) {
                            finPath += subDirects[j] + '/'
                        }
                    } else {
                        finPath = subDirects
                    }

                    fsJ.dir('public/'+data.moat+'/' + finPath);
                    // Checks whether the photo is already saved on the node and saves it if it's not.
                    if (!fs.existsSync('public/'+data.moat+'/' + data.path)){
                        fs.writeFile(
                            'public/'+data.moat+'/' + data.path,
                            data.file,
                            function(err) {
                                console.log(err);
                            }
                        );
                        res.send('success')
                    } else {
                        // Logs that photo already exists on the node if a redundant save request is submitted.
                        res.send(`Photo already exists: ${data.path}`);
                    };
                }else{
                    res.send('Incorrect apiKey');
                }
            } catch(e) {
                console.log(e);
                res.send('error');
            } finally{
                res.end();
            }
        }


        async storePhoto(req, res) {
            const data = req.body;

            try {
                // Returns nothing if no photos are inputted into function.
                if (data.image == null) {
                    return;
                }

                //console.log(data.image);

                const matches = data.image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

                if (matches.length !== 3) {
                    return new Error('Invalid input string');
                }

                const img = new Buffer(matches[2], 'base64');

                data.moat = hyphenToSnake(data.moat)

<<<<<<< HEAD
                const storedCredentials = global.database_map.get(data.moat)
                if (data.apiKey == storedCredentials.key) {

                    console.log('apiKey matches');
=======
                const validSig = await checkQuerySig(data)
                if (validSig) {
>>>>>>> master

                    const subDirects = data.path.split('/')
                    let finPath = ''
                    if (subDirects.length>1) {
                        for (let j=0; j<subDirects.length-1; j++) {
                            finPath += subDirects[j] + '/'
                        }
                    } else {
                        finPath = subDirects
                    }

                    fsJ.dir('public/'+data.moat+'/' + finPath);
                    // Checks whether the photo is already saved on the node and saves it if it's not.
                    if (!fs.existsSync('public/'+data.moat+'/' + data.path)){
                        fs.writeFile(
                            'public/'+data.moat+'/' + data.path,
                            img,
                            { encoding: 'base64' },
                            function(err) {
                                res.send('file write error');
                            }
                        );
                        res.send('success')
                    } else {
                        // Logs that photo already exists on the node if a redundant save request is submitted.
                        res.send(`Photo already exists: ${data.path}`);
                    };
                }else{
                    res.send('Incorrect apiKey');
                }
            } catch(e) {
                console.log(e);
                res.send('error');
            } finally{
                res.end();
            }
        }
<<<<<<< HEAD

       async getMoats(req, res){
            try {
                const data = req.body;
                res.send(await registry.getMoats(data.owner));
            }
            catch (e) {
                res.end();
            }
        }
    }



=======
    }

>>>>>>> master
    return new Handler()
}

module.exports = {handler}