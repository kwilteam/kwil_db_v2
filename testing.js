const { getPoolsForMoat, getTotalFundsForMoat, isAcceptedToken} = require("./src/escrow/utils")
const axios = require('axios')

const testF = async () => {
    //console.log(await getPoolsForMoat('testingnewprimkey'))
    //console.log(await getTotalFundsForMoat('testingnewprimkey'))
    console.time('t')
    const params = {
        url: 'https://arweave.net/O5GGcVpcDEorVxOfnjHnAwKwOjJY3AjHQEwytMYbQ3w',
        method: 'get',
        timeout: 20000
    }
    await axios(params)
    console.timeEnd('t')
}

//testF()