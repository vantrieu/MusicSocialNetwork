const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const errorhandler = require('./helpers/error-handler');
const Account = require('./models/Account');
const fileUpload = require('express-fileupload');
require('dotenv/config');

//Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(errorhandler);
app.use(require('morgan')('combined'))
app.use(fileUpload({createParentPath: true}));
app.use(express.static(__dirname+'/public'));
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/public/index.html');
})

//Import Routes
const userRoute = require('./routes/user');
const accountRoute = require('./routes/account');

//Routes
app.use('/accounts', accountRoute);
app.use('/users', userRoute);

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
            const account = new Account();
            account._doc.username = 'admin';
            account.password = '12345678';
            account.email = 'admin@gmail.com';
            account.role = 'Administrator';
            account.createdate = Date.now();
            account.save();
            console.log('Generate database success!');
        } else {
            console.log('Not generate database!');
        }

    });
});

//Start listening to the server
app.listen(process.env.PORT, () => {
    console.log(`Server running on http://localhost:${process.env.PORT}`)
});