const {readFromFile, write2File, moveFile} = require("../fileWriter");
const fs = require('fs');

describe("fileWriter", () => {
    /*describe("failure", () => {
        test("fails", () => {
            expect(1).toBe(2);
        })
    })*/

    describe("readFromFile", () => {
        test('passes for file testRead', async () => {
            const result = await readFromFile("./src/filesystem/test/testRead");
            expect(result.toString()).toEqual("foo")
        });
    })

  /*  describe("write2File", () => {
        test('passes for file testWrite', async () => {
           write2File("./src/filesystem/test/testWrite", "sdhfjk").then((resolve) => {
                readFromFile("./src/filesystem/test/testWrite").then((result) => {
                    resolve(console.log(JSON.stringify(result)))
                })

                // return expect(JSON.stringify(result)).toBe("sdhfjk")
            })
           /!* try {
                write2File("./src/filesystem/test/testWrite", "sdhfjk").then(() => {
                    readFromFile("./src/filesystem/test/testWrite").then((result) => {
                         expect(false).resolves.toEqual(true)
                    })
                    // console.log(result)

                });
            } catch (e) {
                expect(e).toMatch("error");
            }*!/

        })
    })*/

   /* describe("moveFile", () => {
        test('passes for file testMove', async () => {
                write2File("./src/filesystem/testMove", "baz").then(() => {
                    moveFile('./src/filesystem/testMove', "./src/filesystem/test", "testMove")
                    const result = readFromFile("./src/filesystem/test/testMove");
                    fs.unlinkSync("./src/filesystem/test/testMove");
                    expect(result).toEqual("baz")
                })
        });
    })*/
})


