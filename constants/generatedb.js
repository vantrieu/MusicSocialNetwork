const removeVietnameseTones = require("../helpers/convertVie-handler");
const Account = require("../models/Account");
const User = require("../models/User");

exports.generatedb = function (err, account) {
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
        user.firstname = 'Admin';
        user.lastname = 'Super';
        let temp = user.lastname + " " + user.firstname;
        user.namenosign = removeVietnameseTones(temp);
        user.avatar = "/images/noimage.jpg"
        user.birthday = Date.now();
        user.gender = 'Không muốn tiết lộ';
        user.save();
        for (let i = 0; i < 100; i++) {
            let account = new Account();
            let user = new User();
            account.username = `user${i}`;
            account.password = '12345678';
            account.email = `user${i}@gmail.com`;
            account.user_id = user._id;
            account.role = 'User';
            account.phonenumber = Math.floor(1000000000 + Math.random() * 900000);
            account.save();
            user.firstname = `User${i}`;
            user.lastname = 'Basic';
            let temp = user.lastname + " " + user.firstname;
            user.namenosign = removeVietnameseTones(temp);
            user.avatar = "/images/noimage.jpg"
            user.birthday = Date.now();
            user.gender = 'Không muốn tiết lộ';
            user.save();
        }
        console.log('Generate database success!');
    } else {
        console.log('Not generate database!');
    }
}