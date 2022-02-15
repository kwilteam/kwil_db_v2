const fsJ = require('fs-jetpack');
const bundleInit = async () => {
    fsJ.dir('./bundles')
    const dirs = ['./finalizedBundles', './pendingBundles']
    for (let i = 0; i<dirs.length; i++) {
        fsJ.dir(dirs[i])
    }
}

module.exports = {bundleInit}