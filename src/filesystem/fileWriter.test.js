const fileWriter = require('./fileWriter');
const fs = require('fs');
require(`dotenv`).config();
const bundleFuncs = require('../bundling/bundleFuncs.js');

/*
    Notes: Check input types in functions. Storephotos/writeSettings not used? WriteToBundleCache duplicated? Specifying readFromFile
*/

describe("write2File & readFromFile", () => {
    it("write2File/readFromFile writes/reads correct file data on path", async () => {

        // Test File Path
        const testPath = 'testBundles/testBundle1';

        // Writes file to path
        await fileWriter.write2File(testPath,'asdf');
        // Reads newly written file data
        var fileContent = await fileWriter.readFromFile(testPath);
         
        // // Deletes Test File and Directory
        // fs.unlink(testPath, function (err) {
        //     if (err) return console.log(err);
        // });
        // fs.rmdir('testBundles', function (err) {
        //     if (err) return console.log(err);
        // });
    });
    it("readFromFile throws error for nonExistent file", async () => {
        await expect(fileWriter.readFromFile('fakeBundles')).rejects.toThrow();
    });
});

describe("moveFile", () => {
    it("Moves file to correct location", async () => {
        // Tests that initial file exists
        
        // Moves File

        // Checks that initial file is in new location

        // Checks that initial file is deleted
    });
});

describe("writeToBundleCache", () => {
    it("Writes to persistant fs storage based on: request type", async () => {
        
    });
});

