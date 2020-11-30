const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const Account = require('./models/Account');
const User = require('./models/User');
const fileUpload = require('express-fileupload');
const responsehandler = require('./helpers/respone-handler');
require('dotenv/config');

//Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(require('morgan')('combined'))
app.use(fileUpload({ createParentPath: true }));
app.use(express.static(__dirname + '/public'));
app.get('/', function (req, res) {
    return res.sendFile(__dirname + '/public/index.html');
})

//Import Routes
const userRoute = require('./routes/user');
const accountRoute = require('./routes/account');
const trackRoute = require('./routes/track');

//Routes
app.use('/accounts', accountRoute);
app.use('/users', userRoute);
app.use('/tracks', trackRoute);

//Connect mongodb
mongoose.connect(
    process.env.DB_CONNECTION, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
}
);

mongoose.connection.on('error', console.error.bind(console, 'Database connection error:'));
mongoose.connection.once('open', function () {
    console.info('Successfully connected to the database!');
    const username = 'admin';
    Account.findOne({ username: username }, function (err, account) {
        if (err)
            console.log(err);
        if (!account) {
            let account = new Account();
            let user = new User();
            account.username = 'admin';
            account.password = '12345678';
            account.email = 'admin@gmail.com';
            account.user_id = user._id;
            account.role = 'Administrator';
            account.phonenumber = '03867537750';
            account.save();
            user.firstname = 'Super';
            user.lastname = 'Admin';
            user.birthday = Date.now();
            user.gender = 'Không muốn tiết lộ';
            user.save();
            console.log('Generate database success!');
        } else {
            console.log('Not generate database!');
        }

    });
});

//Catch 404 Errors and forward them to error handler
app.use((req, res, next) => {
    const err = new Error('Not found');
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