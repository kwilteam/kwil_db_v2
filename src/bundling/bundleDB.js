const { pool } = require('../../database/pool.js');

/*
This file will be used to write bundle data to a database

The table containing bundles will contain three tables: data (the stringified body data), moat name, when it was inserted into the database (unix timestamp), and the endpoint it was sent to.
*/

const bundleDB = async ( cursor_id, moat, data ) => {

    // Submit parameters to database in table bundleDB: data (stringified body data), moat name, cursor_id, and unix time stamp for submission time.
    await pool.query(`INSERT INTO bundleDB (cursor_id, moat, submission_time, data) VALUES ('${cursor_id}', '${moat}', CURRENT_TIMESTAMP, '${data}');`);

};

bundleDB( "cursorid1", "moat1", "data1" );