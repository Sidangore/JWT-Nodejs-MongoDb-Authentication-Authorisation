const router = require('express').Router();
const { user_registration, user_login, user_authentication, serialise_user, check_role } = require('../utils/auth.utils');

// REGISTRATIONS
// user registration route
router.post('/register-user', async(req, res) => {
    await user_registration(req.body, 'user', res);
});
// admin registration route
router.post('/register-admin', async(req, res) => {
    await user_registration(req.body, 'admin', res);

});
// super admin registration
router.post('/register-super-admin', async(req, res) => {
    await user_registration(req.body, 'superadmin', res);

});

// LOGINS
// user login route
router.post('/login-user', async(req, res) => {
    await user_login(req.body, 'user', res);
});
// admin login route
router.post('/login-admin', async(req, res) => {
    await user_login(req.body, 'admin', res);
});
// super admin route
router.post('/login-super-admin', async(req, res) => {
    await user_login(req.body, 'superadmin', res);
});

// PROTECTED

// common profile route
router.get('/profile', user_authentication, async(req, res) => {
    // console.log(req);
    return res.json(serialise_user(req.user));
});
// user protected route
router.get('/user-profile', user_authentication, check_role(['user']), async(req, res) => {
    return res.json("hello user");
});
// admin protected route
router.get('/admin-profile', user_authentication, check_role(['admin']), async(req, res) => {
    return res.json("hello admin");

});
// superadmin proctected route
router.get('/super-admin-profile', user_authentication, check_role(['superadmin']), async(req, res) => {
    return res.json("hello superadmin");

});

module.exports = router;