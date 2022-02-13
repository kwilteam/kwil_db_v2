const knex = require('./db.js');
const fsJ = require('fs-jetpack');


// Returns an SQL statement to insert all of the database's data into another database
const getDbSQL = async () => {

    // Initializes string to return for request
    let sqlString = "";
    
    // Saves tableNames into object
    let tableNames = await knex.raw(`SELECT *
        FROM pg_catalog.pg_tables
        WHERE schemaname != 'pg_catalog' AND 
            schemaname != 'information_schema';`);

    // Adds existing tables/columns to sql statement, then adds table values in.
    for (let i = 0; i < tableNames.rows.length; i++) {

        // Assigning table name, column names, and column data types to variables
        let tableName = tableNames.rows[i].tablename.toString();
        let columnNames = await knex.raw(`select column_name
            from information_schema.columns
            where table_name='${tableName}';`);
        let columnDataType = await knex.raw(`SELECT attname, format_type(atttypid, atttypmod) AS type
            FROM   pg_attribute
            WHERE  attrelid = '${tableName}'::regclass
            AND    attnum > 0
            AND    NOT attisdropped
            ORDER  BY attnum;`);
        let tableData = await knex.raw(`SELECT * FROM ${tableName}`);

        // Adds tables, column names, and data types to sqlString
        sqlString += 'CREATE TABLE ' + tableName + ' (';
        for (let j = 0; j < columnNames.rows.length; j++) {
            sqlString += `${columnNames.rows[j].column_name} ${columnDataType.rows[j].type}`;
            if ( j < (columnNames.rows.length - 1)) { sqlString += ', '};
        };
        sqlString += ');';

        // Adds table values (via SQL statement) to new tables if they exist
        if (tableData.rowCount > 0) {
            for (let j = 0; j < tableData.rowCount; j++) {
                
                // Initializing variables for use in final sequel statement string
                let headers = '';
                let values = '';

                // Cycles through columns
                for (let k = 0; k < columnNames.rows.length; k++) {
                    // Saves column headers and values into variables for query writing use
                    headers += `${columnNames.rows[k].column_name}`;
                    values += `${Object.values(tableData.rows[j])[k]}`;
                    // Adds commas if necessary to SQL statement
                    if ( k < (columnNames.rows.length - 1)) { headers += ', '; values += ', '; };
                };
                // Adds necessary values to snapshot SQL string
                sqlString += `INSERT INTO ${tableName} (${headers}) VALUES (${values});`;
            };
        };
    };

    // Writes the outputted db-snapshot to a text file.
    fsJ.file("snapshot.txt", { content: sqlString });

    // Returns sql request string to initialize copy of database.
    return(sqlString);
};

getDbSQL();

// module.exports = getDbSQL;