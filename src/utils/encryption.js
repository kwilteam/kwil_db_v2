require(`dotenv`).config();
const aes256 = require('react-native-crypto-js');
const { sha384 } = require('./utils');

//I don't do any preliminary hashing here because the API keys should be strong enough, and this will allow processes to run much faster

const encryptKey = (_key) => {
    return (aes256.AES.encrypt(_key, sha384(process.env.KEY_SECRET))).toString()
}

const decryptKey = (_cipherText) => {
    return (aes256.AES.decrypt(_cipherText, sha384(process.env.KEY_SECRET))).toString(aes256.enc.Utf8);
}

module.exports = {encryptKey, decryptKey}