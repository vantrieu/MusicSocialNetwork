const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv/config');

//Middlewares
app.use(cors());
app.use(bodyParser.json());

//Import Routes
const postRoute = require('./routes/post');
const userRoute = require('./routes/user');

app.use('/posts', postRoute);
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
    console.info('Successfully connected to the database');
});

//Start listening to the server
app.listen(process.env.PORT, () => {
    console.log(`Server running on http://localhost:${process.env.PORT}`)
});