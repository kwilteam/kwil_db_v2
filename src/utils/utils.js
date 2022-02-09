

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

module.exports = {hyphenToSnake, snakeToHyphen, hashPath, generateRandomString}