const { body, header } = require('express-validator');

const validateRegister = [
    body('username', 'Tên đăng nhập không thể rỗng!').not().isEmpty(),
    body('username', 'Tên đăng nhập phải có ít nhất 6 ký tự!').isLength({ min: 6 }),
    body('password', 'Mật khẩu không thể rỗng!').not().isEmpty(),
    body('password', 'Mật khẩu phải có ít nhất 6 ký tự!').isLength({ min: 6 }),
    body('phonenumber', 'Số điện thoại không được rỗng').isLength({ min: 10, max: 11 }),
    body('phonenumber', 'Số điện thoại phải từ 10 đến 11 ký tự').isLength({ min: 10, max: 11 }),
    body('email', 'Email không được rỗng!').not().isEmpty(),
    body('email', 'Email không đúng định dạng!').isEmail(),
    body('firstname', 'Tên không thể rỗng!').not().isEmpty(),
    body('lastname', 'Họ không thể rỗng!').not().isEmpty(),
    body('birthday', 'Sinh nhật không thể trống!').not().isEmpty(),
    body('birthday', 'Ngày sinh không đúng định dạng!').isISO8601('yyyy-mm-dd'),
    body('gender', 'Giới tính không thể rỗng!').not().isEmpty(),
];

const validateLogin = [
    body('username', 'Tên đăng nhập không thể rỗng!').not().isEmpty(),
    body('username', 'Tên đăng nhập phải có ít nhất 6 ký tự!').isLength({ min: 6 }),
    body('password', 'Mật khẩu không thể rỗng!').not().isEmpty(),
    body('password', 'Mật khẩu phải có ít nhất 6 ký tự!').isLength({ min: 6 })
];

const validateAuthRefresh = [
    header('x-access-token', `Headers 'x-access-token' không thể rỗng!`).not().isEmpty(),
    header('x-refresh-token', `Headers 'x-refresh-token' không thể rỗng!`).not().isEmpty()
];

const validateAuth = [
    header('x-access-token', `Headers 'x-access-token' không thể rỗng!`).not().isEmpty()
];

module.exports = {
    validateRegister,
    validateLogin,
    validateAuthRefresh,
    validateAuth
};