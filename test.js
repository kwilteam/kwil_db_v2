const { getPoolsForMoat, getTotalFundsForMoat} = require("./src/escrow/utils")

const testF = async () => {
    //console.log(await getPoolsForMoat('testingnewprimkey'))
    console.log(await getTotalFundsForMoat('testingnewprimkey'))
}
testF()