const KwilDB = require('kwildb')
require(`dotenv`).config();
const fundingPools = require('./fundingPools.json')
const abi = require('./poolABI.json')
const Web3 = require('web3')
const tokens = require('./tokens.json')

const getPoolsForMoat = async (_moat) => {
    const results = await KwilDB.getPoolsByMoat(process.env.REGISTRY_ADDRESS, _moat)
    return results
}

const initContract = async (_chain, _token) => {
    const web3 = new Web3(fundingPools[_chain].RPC)
    const contractAddr = fundingPools[_chain].tokens[_token]
    web3.eth.accounts.wallet.add(process.env.PRIVATE_KEY)
    const contract = new web3.eth.Contract(abi.abi, contractAddr)
    return contract
}

const getTotalFundsForMoat = async (_moat) => {
    const pools = await getPoolsForMoat(_moat)
    
    for (let i = 0; i<pools.length; i++) {
        if (pools[i].blockchain == 'goerli') {continue}
        const contract = await initContract(pools[i].blockchain, pools[i].token)
        const pool = await contract.methods.pools(pools[i].pool_name).call()
        const divAmt = 10 ** tokens[pools[i].token].decimals
        console.log(pool.pool/divAmt)
    }
}

module.exports = {getPoolsForMoat, getTotalFundsForMoat}