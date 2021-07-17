const driveApi = require('./driveapi.controller');
const responsehandler = require('../helpers/respone-handler');

exports.backupDatabase = async function (req, res) {
    let backupProcess = spawn('mongodump', [
        '--db=musicsocialnetwork',
        '--archive=./backup/musicsocialnetwork.gz',
        '--gzip'
    ]);

    backupProcess.on('exit', (code, signal) => {
        if (code)
            console.log('Backup process exited with code ', code);
        else if (signal)
            console.error('Backup process was killed with singal ', signal);
        else {
            console.log('Successfully backedup the database');
            driveApi.saveBakToDrive();
            return responsehandler(res, 200, 'Successfully', null, null);
        }
    });

    return responsehandler(res, 500, 'Internal Server Error', null, null);
}