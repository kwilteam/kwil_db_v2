const {pool} = require('../database/pool.js')
const { hyphenToSnake, snakeToHyphen } = require('./utils/utils.js')
const {writeToBundleCache} = require('./bundles/bundleFuncs.js')
const { Parser } = require('node-sql-parser');
const parser = new Parser();
const { storePhotos } = require('./filesystem/fileWriter.js')

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
                    password: 'password',
                    moat: 'kwil'
                }
            */

            //First make sure it is snake case
            data.moat = hyphenToSnake(data.moat)

            let result = await pool.query(`SELECT schema_name FROM information_schema.schemata WHERE schema_name LIKE '${data.moat}';`)
            result = result.rows
            console.log(result)

            //If the schema doesn't exist, result will be [].  If it does, result will be [schema_name: data.data.moat]

            if (result.length > 0) {
                //If the schema exists already
                await res.send({creation: false,
                reason: `A moat by this name already exists on this node, or this moat name is restricted.`
            })
            } else {
                //If the schema does not exist

                await pool.query(`CREATE SCHEMA IF NOT EXISTS ${data.moat};`)

                //Now lets store in the admin schema the credentials

                await pool.query(`INSERT INTO admin.schemas(moat_name, username, moat_password) VALUES ('${data.moat}', '${data.user}', '${data.password}')`)

                //Update the credentials map
                global.database_map.set(data.moat, {user: data.user, password: data.password})

                await res.send({creation: true,
                reason: `Success in creating moat!`
            })
            }
            res.end()
        }


        async createTable (req, res) {
            //Will receive the table name as well as schema
            
        }


        async query (req, res) {
            /*

            Will need to check if user and password are valid auth credentials

            */

            try {
            let data = req.body

            data.moat = hyphenToSnake(data.moat)

            const storedCredentials = global.database_map.get(data.moat)
            if (data.user == storedCredentials.user && data.password == storedCredentials.password) {
                //Credentials are valid

                try {

                    //We need to ensure they are not accessing a schema other than the moat specified

                    //We will parse the sql statement and analyze the schema

                    const ast = parser.astify(data.query)

                    /*
                    ast is in format: 
                    [{
                        with: null,
                        type: 'select',
                        from:[{db: 'testschema', table: 'testtable', as: null}]
                    },
                    {
                        with: null,
                        type: 'select',
                        from:[{db: 'testschema2', table: 'testtable', as: null}]
                    }
                    ]
                    */

                    let validSchema = true

                    //Checking for each ast for each schema if it is the same as specified.
                    //How confident am I that an edge case exists?  Fairly
                    console.log(data.query)
                    console.log(parser.columnList(data.query))

                    ast.forEach(schema => {
                        schema.from.forEach(innerSchema => {
                            if (innerSchema.db != data.moat) {
                                validSchema = false
                            }
                        })
                    })

                    if (validSchema) {
                        //At this point the user has thoroughly proven their credentials
                        const result = await pool.query(req.body.query)
                        await res.send(result.rows)

                        if (req.body.store == true) {
                            //If the query was succesful and storing is on
                            const writeData = {
                                query: data.query,
                                timestamp: new Date
                            }
        
                            req.body.moat = snakeToHyphen(req.body.moat) //Convert back
                            writeToBundleCache(req, writeData)

                            //Distribute to peers as well here, set req.body.store to false though
                        }
                    }
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
    }
    return new Handler()
}

module.exports = {handler}