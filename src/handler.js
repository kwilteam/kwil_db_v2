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
            */

            let data = req.body

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
                //If the schema exists already
                await res.send({
                    creation: false,
                    reason: `A moat by this name already exists on this node, or this moat name is restricted.`
                })
            } else {
                //If the schema does not exist
                await createDatabase(data)
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
                //Credentials are valid, contains the hash

                try {
                    //Do the business logic here
                    const dbPool = global.database_map.get(data.moat)
                    const queryResult = await dbPool.pool.query(data.data)

                    if (data.store) {
                        //Write to bundle cache

                        const writeData = {
                            q: data.data,
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
                    results: `Invalid database signature`
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

                const validSig = await checkQuerySig(data)
                if (validSig) {

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

                const validSig = await checkQuerySig(data)
                if (validSig) {

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
    }

    return new Handler()
}

module.exports = {handler}