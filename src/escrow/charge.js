const { getMoatsOnNode } = require("../utils/dbUtils");

require(`dotenv`).config();

const chargeQuery = async (_req, _writeData) => {
    const dataAmt = Math.ceil(JSON.stringify(_writeData).length * process.env.UPCHARGE_RATE)
    await global.admin_pool.query(`INSERT INTO charged_queries (query_id, data_size, data_moat) VALUES ($1, $2, $3)`, [_writeData.h, dataAmt, _req.body.moat])
}

const initCharge = async () => {
    //This must run after init database
    //Now lets create a table to track payments
    try {
    await global.admin_pool.query(`CREATE TABLE IF NOT EXISTS charged_queries(
        query_id varchar(64) PRIMARY KEY,
        data_size int NOT NULL,
        data_moat varchar(64) NOT NULL
    )`)
    global.Moat_Charges = new Map()
    await initSavedCharges()
    await updateMoatCharges()
    } catch(e) {
        console.log(e)
    }
}

const initSavedCharges = async () => {
    await global.admin_pool.query(`CREATE TABLE IF NOT EXISTS logged_charges(
        data_moat varchar(64) PRIMARY KEY,
        total_charges int
    )`)

    const moats = await getMoatsOnNode()

    for (let i = 0; i< moats.length; i++) {
        try {
            await global.admin_pool.query(`INSERT INTO logged_charges(data_moat, total_charges) VALUES ($1, $2)`, [moats[i], 0])
        } catch(e) {
            console.log(`Moat already has charges logged`)
        }
    }
}

const updateMoatCharges = async () => {
    let moats = await global.admin_pool.query(`SELECT DISTINCT data_moat FROM charged_queries`)
    moats = moats.rows
        for (let i = 0; i<moats.length; i++) {
        let dataAmt = await global.admin_pool.query(`SELECT SUM(data_size) FROM charged_queries WHERE data_moat LIKE $1`, [moats[i].data_moat])
        dataAmt= Number(dataAmt.rows[0].sum)
        const currentAmt = await getMoatAmtFromDatabase(moats[i].data_moat)
        const newAmt = Math.ceil(dataAmt+currentAmt)
        await global.admin_pool.query(`UPDATE logged_charges SET total_charges = $1 WHERE data_moat LIKE $2`, [newAmt ,moats[i].data_moat])
        await global.admin_pool.query(`DELETE FROM charged_queries WHERE data_moat LIKE $1`, [moats[i].data_moat])
    }
    //Now lets loop through and store the new charge data in a map
    const allMoats = await getMoatsOnNode()
    for (let i = 0; i< allMoats.length; i++) {
        const amt = await getMoatAmtFromDatabase(allMoats[i])
        global.Moat_Charges.set(allMoats[i], amt)
    }
    console.log(`\nCurrent debits:`)
    console.log(global.Moat_Charges)
    console.log(`\n`)
}

const getMoatAmtFromDatabase = async (_moat) => {
    //Verbose-ass function name
    let amt = await global.admin_pool.query(`SELECT total_charges FROM logged_charges WHERE data_moat LIKE $1`, [_moat])
    amt = amt.rows
    return amt[0].total_charges
}

const ifMoatHasEnoughFunding = async (_moat, _incomingData) => {
    const dataAmt = Match.ceil(JSON.stringify(_incomingData).length * process.env.UPCHARGE_RATE)
    const currentDebit = global.Moat_Charges.get(_moat)
    const currentFunding = 0
    if (dataAmt+currentDebit < currentFunding) {
        return true
    } else {
        return false
    }
}

module.exports = {chargeQuery, initCharge, updateMoatCharges, ifMoatHasEnoughFunding}