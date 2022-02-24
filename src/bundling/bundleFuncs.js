const fs = require('fs');
const fileWriter = require('../filesystem/fileWriter.js');
require(`dotenv`).config();

// Returns _dir parameter (directory) files from Google Cloud.
const readDir = async (_dir) => {
    const files = await fs.promises.readdir('./'+_dir);
    return files;
};

const readFolders = async (_dir) => {
    const files = await fs.promises.readdir('./'+_dir);
    return files;
}

const rmDir = async (_dir) => {
    fs.rmSync('./'+_dir, {recursive: true})
}

// Renames Google Cloud directory.
const rename = async (_oldDir, _newDir) => {
    await fs.renameSync('./'+_oldDir, './'+_newDir);
};

// Returns file string content of _file parameter in Google Cloud.
const readFile = async (_file) => {
    const content = await fileWriter.readFromFile('./'+_file);
    return content.toString();
};

// Deletes _dir parameter (directory) from Google Cloud.
const deleteFile = async (_dir) => {
    await fs.unlinkSync('./'+_dir);
};

// Moves file in Google Cloud based on inputted function parameters.
const moveFile = async (_main, _newFile, _newName = '') => {
    await fileWriter.moveFile('./'+_main, './'+_newFile, _newName);
};

// Writes content in parameter (_content) to _path (file path) in Google Cloud.
const write2File = async (_path, _content) => {
    if (process.env.NODE_ENV == 'productionG') {
    };
    await fileWriter.write2File('./'+_path, _content);
};

// Writes data to cachedBundle file.
const writeToBundleCache = async (_req, _writeData) => {
    await fileWriter.writeToBundleCache(_writeData, _req);
};

module.exports = { readDir, deleteFile, moveFile, write2File, writeToBundleCache, readFile, rename, rmDir, readFolders };