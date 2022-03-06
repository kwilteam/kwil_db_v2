const Web3 = require("web3");
const abi = require("../../abi.json");
const dbUtils = require("../utils/dbUtils");
const kwildb = require("kwildb");
const tokens = require("../escrow/tokens.json");


const initPools = async () =>{

    const options = {
        // Enable auto reconnection
        reconnect: {
            auto: true,
            delay: 30000, // ms
            maxAttempts: 1000,
            onTimeout: false
        }
    };


    const wsGoerli = new Web3.providers.WebsocketProvider('wss://eth-goerli.alchemyapi.io/v2/7ugsfAn1P2ei1mI5Kj48L6kXourgUeTL', options)
    const web3Goerli = new Web3(wsGoerli)
    const contractAddrGoerli = "0x6c1B59FE7F955E8F3DcCD703c80d32c83B6a52c6"
    const contractGoerli = new web3Goerli.eth.Contract(abi.abi, contractAddrGoerli)

    const wsPolygon = new Web3.providers.WebsocketProvider('wss://polygon-mainnet.g.alchemy.com/v2/rmHrTewIiEOvqSby9ApxY3nnhTOVP4G-', options)
    const web3Polygon = new Web3(wsPolygon)
    const contractAddrPolygon = "0x2669eC7028A3ab5C7179b8f69448A3CC8d89f9E1"
    const contractPolygon = new web3Polygon.eth.Contract(abi.abi, contractAddrPolygon)

    const contractAddrPolygonKRED = "0x304c18A81725F54Eb95450772796f96BBe5eA079"
    const contractPolygonKRED = new web3Polygon.eth.Contract(abi.abi, contractAddrPolygonKRED)

    //Goerli listener
    contractGoerli.events.PoolFunded({})
        .on('data', async function(event){
            try {
                console.log(event.returnValues);
                for (let [key, value] of global.moatPoolMap) {
                    console.log(key + " = " + value);
                    const divAmt = 10 ** 6;
                    if (value.has(event.returnValues.poolName)){
                        if (value.get(event.returnValues.poolName)<event.returnValues.totalFunds/divAmt) {
                            const num = global.accumulationMap.get(key);
                            global.accumulationMap.set(key, num + (+event.returnValues.fundsAdded/divAmt))
                            console.log(global.accumulationMap);
                            return;
                        }
                        else{
                            return;
                        }
                        //PUT IN MAP INSTEAD OF SET
                    }
                }
            }catch(e){
                console.log(e)
            }
        })
        .on('error', console.error);

    contractPolygon.events.PoolFunded({})
        .on('data', async function(event){
            try {
                console.log(event.returnValues);
                for (let [key, value] of global.moatPoolMap) {
                    console.log(key + " = " + value);
                    const divAmt = 10 ** 6;
                    if (value.has(event.returnValues.poolName)){
                        if (value.get(event.returnValues.poolName)<event.returnValues.totalFunds/divAmt) {
                            const num = global.accumulationMap.get(key);
                            global.accumulationMap.set(key, num + (+event.returnValues.fundsAdded/divAmt))
                            console.log(global.accumulationMap);
                            return;
                        }
                        else{
                            return;
                        }
                        //PUT IN MAP INSTEAD OF SET
                    }
                }
            }catch(e){
                console.log(e)
            }
        })
        .on('error', console.error);

    contractPolygonKRED.events.PoolFunded({})
        .on('data', async function(event){
            try {
                console.log(event.returnValues);
                for (let [key, value] of global.moatPoolMap) {
                    console.log(key + " = " + value);
                    const divAmt = 10 ** 18;
                    if (value.has(event.returnValues.poolName)){
                        if (value.get(event.returnValues.poolName)<event.returnValues.totalFunds/divAmt) {
                            const num = global.accumulationMap.get(key);
                            global.accumulationMap.set(key, num + (+event.returnValues.fundsAdded/divAmt))
                            console.log(global.accumulationMap);
                            return;
                        }
                        else{
                            return;
                        }
                        //PUT IN MAP INSTEAD OF SET
                    }
                }
            }catch(e){
                console.log(e)
            }
        })
        .on('error', console.error);

    const arr = await dbUtils.getMoatsOnNode();
    //arr.push('genericmoatname');
    console.log(arr)
    global.accumulationMap = new Map();
    global.moatPoolMap = new Map();
    console.log(accumulationMap)
    //CHANGE FOR LOOP
    for (let i =0;i<arr.length;i++){
        global.moatPoolMap.set(arr[i],new Map());
        global.accumulationMap.set(arr[i],0)
        const pools =  await kwildb.getPoolsByMoat('https://registry.kwil.xyz',arr[i])
        console.log(pools)
        let accumulator = 0;
        for (let j = 0;j<pools.length;j++){
            //accumulationMap.get('testingnewprimkey'/*arr[i]*/).set(pools[i].)
            global.moatPoolMap.get(arr[i]).set(pools[j].id.split("_")[0],);
            const poolFromChain = await kwildb.pools.getPool(pools[j].pool_name,pools[j].blockchain,pools[j].token);
            const divAmt = 10 ** tokens[pools[j].token].decimals
            const finalTokenAmt = poolFromChain.pool/divAmt
            global.moatPoolMap.get(arr[i]).set(pools[j].id.split("_")[0],+finalTokenAmt);
            console.log(poolFromChain)
            accumulator += +finalTokenAmt;
        }
        global.accumulationMap.set(arr[i],accumulator);
        console.log(global.accumulationMap);
    }
    console.log(global.moatPoolMap);
}

module.exports = {initPools}