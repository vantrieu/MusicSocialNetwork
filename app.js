const express = require('express');
const app = express();
const helmet = require('helmet');
const rateLimit = require("express-rate-limit");
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const Account = require('./models/Account');
const User = require('./models/User');
const fileUpload = require('express-fileupload');
const responsehandler = require('./helpers/respone-handler');
const removeVietnameseTones = require('./helpers/convertVie-handler');
const cron = require('node-cron'), spawn = require('child_process').spawn;
const driveApi = require('./controllers/driveapi.controller');
const cronjob = require('./constants/cronjob');
require('dotenv/config');

// CORS config
var corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200,
    methods: "GET, POST, PUT, DELETE"
}
app.use(cors(corsOptions));

// Against DDOS or brute-force
const limiter = rateLimit({
    // 1 minutes
    windowMs: 1 * 60 * 1000,
    // limit each IP to 100 requests per windowMs
    max: 120
});
app.use(limiter);

//Middlewares
app.use(helmet());
app.use(bodyParser.json({ limit: '10240kb'}));
app.use(require('morgan')('combined'))
app.use(fileUpload({ createParentPath: true }));
app.use(express.static(__dirname + '/public'));
app.get('/', function (req, res) {
    return res.sendFile(__dirname + '/public/index.html');
})

//Import Routes
const albumRoute = require('./routes/album');
const userRoute = require('./routes/user');
const accountRoute = require('./routes/account');
const trackRoute = require('./routes/track');
const playlistRoute = require('./routes/playlist');
const commentRoute = require('./routes/comment');
const historyRoute = require('./routes/history');
const { generatedb } = require('./constants/generatedb');
const tracktypeRoute = require('./routes/tracktype');
const singerRoute = require('./routes/singer');
const findRoute = require('./routes/find');
const backupRoute = require('./routes/backup');

//Routes
app.use('/albums', albumRoute);
app.use('/accounts', accountRoute);
app.use('/users', userRoute);
app.use('/tracks', trackRoute);
app.use('/playlists', playlistRoute);
app.use('/comments', commentRoute);
app.use('/histories', historyRoute);
app.use('/tracktypes', tracktypeRoute);
app.use('/singers', singerRoute);
app.use('/finds', findRoute);
app.use('/backup', backupRoute);

//Connect mongodb
mongoose.connect(
    process.env.DB_CONNECTION, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
});

mongoose.connection.on('error', console.error.bind(console, 'Database connection error:'));
mongoose.connection.once('open', function () {
    console.info('Successfully connected to the database!');
    const username = 'administrator';
    Account.findOne({ username: username }, function (err, account) {
        generatedb(err, account);
    });
});

//Auto backup database
cron.schedule('0 0 0 1 * *', () => {
    let backupProcess = spawn('mongodump', [
        '--db=musicsocialnetwork',
        '--archive=./backup/musicsocialnetwork.gz',
        '--gzip'
      ]);

    backupProcess.on('exit', (code, signal) => {
        if(code) 
            console.log('Backup process exited with code ', code);
        else if (signal)
            console.error('Backup process was killed with singal ', signal);
        else {
            console.log('Successfully backedup the database');
            driveApi.saveBakToDrive();
        }
            
    });
});

let backupProcess = spawn('mongorestore', [
    '--db=musicsocialnetwork',
    '--archive=./backup/musicsocialnetwork.gz',
    '--gzip'
  ]);

backupProcess.on('exit', (code, signal) => {
    if(code) 
        console.log('Restore process exited with code ', code);
    else if (signal)
        console.error('Restore process was killed with singal ', signal);
    else {
        console.log('Successfully restore the database!');
    }
        
});

// cron.schedule('0 0 * * * *', () => {
//     cronjob.CalculatorAlbum();
// });

//Catch 404 Errors and forward them to error handler
app.use((req, res, next) => {
    const err = new Error('Not Found!');
    err.status = 404;
    next(err);
});

//Error handler function
app.use((err, req, res, next) => {
    const error = app.get('env') === 'development' ? err : {};
    const status = err.status || 500;
    return responsehandler(res, status, error.message, null, null);
});

//Start listening to the server
app.listen(process.env.PORT, () => {
    console.log(`Server running on http://localhost:${process.env.PORT}`)
});