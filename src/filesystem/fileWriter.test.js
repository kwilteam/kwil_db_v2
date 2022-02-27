const fileWriter = require('./fileWriter');

/*
    Notes: Check input types in functions. Write deleteFile function not for google cloud? Storephotos/writeSettings not used? WriteToBundleCache duplicated?
*/

describe("write2File", () => {
    it("Writes file data to path", async () => {
        // Writes file to path
        const write2File = await fileWriter.write2File();

        // Test checks for file

        // Deletes file
    });
});

describe("readFromFile", () => {
    it("Reads in correct file data", async () => {
        // Tests return value
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

