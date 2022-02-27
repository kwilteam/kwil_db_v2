const rs = require('jsrsasign');
const { getMoatModulus, createPubJWK } = require('../utils/utils');

const checkQuerySig = async (_data) => {
    /*
    Data contains query, timestamp, hash, salt, and signature
    */
   const moatModulus = await getMoatModulus(_data.moat)
   const pubKey = createPubJWK(moatModulus)
   let sig = new rs.crypto.Signature({ alg: 'SHA384withRSA' });
   sig.init(pubKey)
   sig.updateString(createSignedQuery(_data))
   return sig.verify(_data.signature)
}

function createSignedQuery (_data) {
    return {
        data: _data.query,
        timestamp: _data.timestamp,
        hash: _data.hash,
        queryID: _data.queryID
    }
}

module.exports = {checkQuerySig, createSignedQuery}