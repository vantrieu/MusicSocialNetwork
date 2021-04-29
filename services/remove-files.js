const fs = require('fs');

const removeFile = async function (path) {
    if (fs.existsSync(path)) {
        fs.unlinkSync(path);
        return true;
    }
    else {
        return false;
    }
}

module.exports = removeFile;