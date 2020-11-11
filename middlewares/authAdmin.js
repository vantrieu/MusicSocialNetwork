const jwt = require('jsonwebtoken');
const Account = require('../models/Account');

const authAdmin = async (req, res, next) => {
    try {
        //const token = req.header('Authorization').replace('Bearer ', '');
        const token = req.headers['x-access-token'];
        const data = jwt.verify(token, process.env.JWT_KEY)
        const account = await Account.findOne({ _id: data._id});
        if (!account) {
            throw new Error()
        }
        const date = new Date().getTime();
        if (data.role === 'Administrator' && data.expireIn >= date) {
            res.locals.account = account;
            next();
        }
    } catch (err) {
        res.status(401).send({
            message: 'Not authorized to access this resource'
        })
    }
}
module.exports = authAdmin;