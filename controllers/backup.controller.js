const driveApi = require('./driveapi.controller');
const responsehandler = require('../helpers/respone-handler');
const spawn = require('child_process').spawn

exports.backupDatabase = async function (req, res) {
    let backupProcess = spawn('mongodump', [
        '--db=musicsocialnetwork',
        '--archive=./backup/musicsocialnetwork.gz',
        '--gzip'
    ]);

    backupProcess.on('exit', (code, signal) => {
        if (code) {
            console.log('Backup process exited with code ', code);
            return responsehandler(res, 500, 'Internal Server Error', null, null);
        }
        else if (signal) {
            console.error('Backup process was killed with singal ', signal);
            return responsehandler(res, 500, 'Internal Server Error', null, null);
        }
        else {
            console.log('Successfully backedup the database');
            driveApi.saveBakToDrive();
            return responsehandler(res, 200, 'Successfully', null, null);
        }
    });
}