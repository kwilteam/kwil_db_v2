const fs = require("fs");
const fsJ = require('fs-jetpack');


// Copies files to publicCopy bundle
const publicCopyBundle = () => {

  let publicCopyBundle = {};

  // Scans files in public via recursion and saves them to bundle.
  const fileScanner = ( currentDir = "public" ) => {

    // Reads in files in directory
    let openedDir = fs.opendirSync(currentDir);
    let filesLeft = true;

    // Loops through directory files. If it finds another directory, it reads that before continuing.
    while ( filesLeft ) {

      // Creates Dirent object to read current iteration in directory.
      let fileDirent = openedDir.readSync();

      // Checks whether fileDirent is null before running any functions on it.
      if ( fileDirent == null ) {
        // Sets filesLeft to false to stop cycling through directory.
        filesLeft = false;
      } else if ( fileDirent.isDirectory() ) {
        // Calls recursion loop if file is a directory.
        fileScanner(`${currentDir}/${fileDirent.name}`);
      } else if ( fileDirent != null ) {
        // Saves file data under path.
        publicCopyBundle[`${currentDir}/${fileDirent.name}`] = fs.readFileSync(`${currentDir}/${fileDirent.name}`, 'utf-8');
      };
    };
  };

  // Initial call to scan files.
  fileScanner();

  // Saves files to bundle.
  fsJ.file(`./bundles/publicCopyBundle`, { content: publicCopyBundle });

};

publicCopyBundle();

// module.exports = publicCopyBundle;