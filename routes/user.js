const express = require('express');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const auth = require('../middlewares/auth');

const router = express.Router();

router.post('/create', async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.status(201).send({ Message: 'User created!' });
    } catch (error) {
        res.status(400).send(error);
    }
})

router.post('/login', async(req, res) => {
    try {
        const { username, password } = req.body
        const user = await User.findOne({username})
        if (user == null) {
            res.json({message: 'Invalid login credentials'});
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password)
        if (!isPasswordMatch) {
            res.json({message: 'Invalid login credentials'});
        }
        if (!user) {
            return res.status(401).send({error: 'Login failed! Check authentication credentials'})
        }
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (error) {
        res.status(400).send(error)
    }
});

router.get('/me', auth, async(req, res) => {
    res.send(req.user)
});

router.post('/me/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token != req.token
        })
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send(error)
    }
});

router.post('/me/logoutall', auth, async(req, res) => {
    try {
        req.user.tokens.splice(0, req.user.tokens.length)
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send(error)
    }
});

module.exports = router;