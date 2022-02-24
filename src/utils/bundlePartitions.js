const getCurrentPartition = async () => {
    const result = await global.admin_pool.query(`SELECT current_partition FROM bundle_partition`)

    if (result.rows.length > 0) {
        return result.rows[0].current_partition
    } else {
        return null
    }
}

const setPartition = async (_val) => {
    const currentPartition = await getCurrentPartition()
    await global.admin_pool.query(`UPDATE bundle_partition SET current_partition = ${_val} WHERE current_partition = ${currentPartition}`)
    global.current_partition = _val
    await global.admin_pool.query(`CREATE TABLE IF NOT EXISTS "bundle_${_val}"(
        id SERIAL PRIMARY KEY,
        post_data TEXT NOT NULL,
        moat_name varchar(64) NOT NULL,
        request_endpoint varchar(64) NOT NULL
    )`)
}

const deleteOffsetPartition = async () => {
    const currentPartition = await getCurrentPartition()
    if (typeof currentPartition == 'boolean') {
        await global.admin_pool.query(`DROP TABLE "bundle_${!currentPartition}"`)
    }
}

const deleteDefinedPartition = async(_val) => {
    await global.admin_pool.query(`DROP TABLE "bundle_${_val}"`)
}

const switchPartition = async () => {
    const currentPartition = await getCurrentPartition()
    if (currentPartition) {
        //partition is currently true
        await setPartition(false)

    } else {
        //partition is currently false
        await setPartition(true)
    }
}

const partitionInit = async () => {
    //We need to create a table to track what partition we are on for bundles
    await global.admin_pool.query(`CREATE TABLE IF NOT EXISTS bundle_partition(
        current_partition BOOLEAN NOT NULL
    )`)

    //Now check if there is a record
    const currentPartition = await getCurrentPartition()

    if (currentPartition == null) {
        await global.admin_pool.query(`INSERT INTO bundle_partition (current_partition) values (true)`)
        global.current_partition = true
    } else {
        global.current_partition = currentPartition
    }

    await global.admin_pool.query(`CREATE TABLE IF NOT EXISTS "bundle_${currentPartition}"(
        id SERIAL PRIMARY KEY,
        post_data TEXT NOT NULL,
        moat_name varchar(64) NOT NULL,
        request_endpoint varchar(64) NOT NULL
    )`)
}

module.exports = {getCurrentPartition, setPartition, switchPartition, partitionInit, deleteOffsetPartition, deleteDefinedPartition}