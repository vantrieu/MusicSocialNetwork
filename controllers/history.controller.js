const History = require("../models/History");
const responsehandler = require('../helpers/respone-handler');
const moment = require('moment');

exports.viewHistory = async function (req, res) {
    const user_id = res.locals.account.user_id;
    const histories = await History.find({ user: user_id }, ['_id', 'track', 'content', 'createdAt']).limit(100);
    if(histories !== null) {
        for (const history of histories) {
            history._doc.createdAt = moment(history._doc.createdAt).format('DD/MM/YYYY HH:mm:ss');
        }
    }
    return responsehandler(res, 200, 'Successfully', histories, null);
}