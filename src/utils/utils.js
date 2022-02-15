<<<<<<< HEAD

=======
const jssha = require('jssha')
const b64 = require('base64url')
>>>>>>> master

const hyphenToSnake = (_string) => {
    let string = _string.toLowerCase()
    string = string.replaceAll('-', '_')
    return string.toLowerCase()
}

const snakeToHyphen = (_string) => {
    let string = _string.toLowerCase()
    string = string.replaceAll('_', '-')
    return string
}

// Takes a data hash and writes its file's corresponding directory path.
// Data is stored via 5 layer subdirectories where each layer is based on a hash's corresponding character (for characters 1-5).
const hashPath = (_string) => {
    let _path = '';
    for (let i = 0; i < 5; i++) {
        _path = _path + _string[i] + '/';
    };
    return _path;
};

// Generates a random string based on 'characters' and the inputted length parameter.
const generateRandomString = (_length) => {
    const characters =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz123456789_-=+';
    let result = '';
    for (let i = 0; i < _length; i++) {
        result += characters.charAt(
            Math.floor(Math.random() * characters.length)
        );
    };
    return result;
};

<<<<<<< HEAD
const jssha = require('jssha')
const b64 = require('base64url')
=======
>>>>>>> master
const sha384 = (_text) => {
    try {
        if (_text != null){
    const shaObj = new jssha('SHA-384', 'TEXT', { encoding: 'UTF8' });
    shaObj.update(_text);
    const b64Hash = shaObj.getHash('B64');
    return b64.fromBase64(b64Hash);
    } else {
        return ''
    }
    } catch(e) {
        console.log(e)
        throw new Error('Tried to hash something that is not a string. Make sure all inputs are correctly formatted.')
    }
};

<<<<<<< HEAD
module.exports = {hyphenToSnake, snakeToHyphen, hashPath, generateRandomString, sha384}
=======
const getMoatModulus = async (_moat) => {
    //This doesn't have to be async if it is getting data from the database_map and not database
    const moatData = global.database_map.get(_moat)
    return moatData.key
    //Below is code for how to do this from the database

    /*
    const result = await global.admin_pool.query(`SELECT public_key FROM moats WHERE moat_name LIKE ($1)`, [_moat])
    return result[0].public_key
    */
}

const createPubJWK = (_modulus) => {
    return {
        kty: 'RSA',
        n: _modulus,
        e: 'AQAB',
    };
}

module.exports = {hyphenToSnake, snakeToHyphen, hashPath, generateRandomString, sha384, getMoatModulus, createPubJWK}
>>>>>>> master
