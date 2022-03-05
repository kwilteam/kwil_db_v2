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

const convertToUSD = async (_token, _amt) => {
    //Putting this here for when we need to accept other tokens
    return _amt
}

const getAcceptedTokens = async () => {
    const tokens = process.env.ACCEPTED_TOKENS.split(' ')
    return tokens
}

const isAcceptedToken = async (_token, _chain) => {
    const acceptedTokens = await getAcceptedTokens()
    if (acceptedTokens.includes(`${_token}_${_chain}`)) {
        return true
    } else {
        return false
    }
}

const getTotalFundsForMoat = async (_moat) => {
    const pools = await getPoolsForMoat(_moat)

    let totalUSDAmt = 0
    
    for (let i = 0; i<pools.length; i++) {
        if (! await isAcceptedToken(pools[i].token, pools[i].blockchain)) {continue}
        const contract = await initContract(pools[i].blockchain, pools[i].token)
        const pool = await contract.methods.pools(pools[i].pool_name).call()
        const divAmt = 10 ** tokens[pools[i].token].decimals
        const finalTokenAmt = pool.pool/divAmt
        const usdAmt = await convertToUSD(pools[i].token, finalTokenAmt)
        totalUSDAmt += usdAmt
    }
    return totalUSDAmt
}

module.exports = {getPoolsForMoat, getTotalFundsForMoat, isAcceptedToken}