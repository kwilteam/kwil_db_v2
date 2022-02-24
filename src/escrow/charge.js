require(`dotenv`).config();

const chargeQuery = async (_writeData) => {
    const dataAmt = JSON.stringify(_writeData).length * process.env.UPCHARGE_RATE
    await global.admin_pool.query(`INSERT INTO charged_queries (query_hash, data_size) VALUES ($1, $2)`, [_writeData.h, dataAmt])
}

const initCharge = async () => {
    //This must run after init database
    //Now lets create a table to track payments
    await global.admin_pool.query(`CREATE TABLE IF NOT EXISTS charged_queries(
        query_hash varchar(64) PRIMARY KEY,
        data_size int NOT NULL
    )`)
}

module.exports = {chargeQuery, initCharge}