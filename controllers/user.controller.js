const moment = require('moment')
const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.me = function (req, res) {
    const user = res.locals.user;
    user._doc.birthday = moment(user._doc.birthday).format('DD/MM/YYYY');
    user._doc.createdate = moment(user._doc.createdate).format('DD/MM/YYYY');
    const { password, __v, tokens, ...userNoField } = user._doc;
    res.status(200).send({ 
        'user': userNoField 
    });
}

exports.create = async function (req, res, next) {
    try {
        const user = new User(req.body);
        await user.save();
        res.status(201).send({
            message: 'User created!'
        })
    } catch (err) {
        next(err);
    }
}

exports.login = async function (req, res, next) {
    try {
        const pass = req.body.password;
        const username = req.body.username;
        const user = await User.findOne({ username });
        if (user == null) {
            res.status(200).send({ message: 'Invalid login credentials' });
        }
        const isPasswordMatch = await bcrypt.compare(pass, user.password)
        if (!isPasswordMatch) {
            res.status(200).send({ message: 'Invalid login credentials' });
        }
        if (!user) {
            return res.status(401).send({ 
                error: 'Login failed! Check authentication credentials'
            })
        }
        const token = await user.generateAuthToken();
        user._doc.birthday = moment(user._doc.birthday).format('DD/MM/YYYY');
        user._doc.createdate = moment(user._doc.createdate).format('DD/MM/YYYY');
        const { password, __v, tokens, ...userNoField } = user._doc;
        res.send({
            'user': userNoField,
            'token': token
        });
    } catch (error) {
        next(error);;
    }
}

exports.logout = async function (req, res, next) {
    try {
        res.locals.user.tokens = res.locals.user.tokens.filter((token) => {
            token.token != req.token
        });
        await res.locals.user.save();
        res.status(200).send({
            message: 'Success!'
        });
    } catch (err) {
        next(err);
    }
}

exports.logoutall = async function (req, res, next) {
    try {
        res.locals.user.tokens.splice(0, res.locals.user.tokens.length);
        await res.locals.user.save();
        res.status(200).send({ 
            message: 'Success!' 
        });
    } catch (err) {
        next(err);
    }
}