const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { SECRET } = require('../config');

const passport = require('passport');

//register the user function can be any admin user or superadmin
const user_registration = async(user_detail, role, res) => {
    try {
        //validate the username
        let username_not_taken = await validate_username(user_detail.username);
        if (!username_not_taken) {
            return res.status(400).json({
                message: "Username is already taken",
                success: false
            });
        }
        //validate the email1
        let email_not_taken = await validate_email(user_detail.email);
        if (!email_not_taken) {
            return res.status(400).json({
                message: "Email is already registered",
                success: false
            });
        }

        // if it passes the validation hash the passwords
        const password = await bcryptjs.hash(user_detail.password, 12);

        // create the new user
        const new_user = new User({
            ...user_detail,
            password,
            role
        });

        //save the user
        await new_user.save();

        return res.status(201).json({
            message: "User has been successfully registered",
            success: true
        });
    } catch (error) {
        // implement logger function like winston
        return res.status(500).json({
            message: `Unable to create account because : ${error}`,
            success: false
        });
    }
};

//user login function
const user_login = async(user_credentials, role, res) => {
    let { username, password } = user_credentials;

    //check if the username is in the database
    const user = await User.findOne({
        username
    });

    if (!user) {
        return res.status(404).json({
            message: "Username not found",
            succes: false
        });
    }

    if (user.role !== role) {
        return res.status(403).json({
            message: "Unauthorised! please login from the right portal",
            succes: false
        });
    }

    // user is valid now check the password
    let is_match = await bcryptjs.compare(password, user.password);

    if (is_match) {
        // sign in the token and issue it to the user
        let token = jwt.sign({
            user_id: user._id,
            role: user.role,
            username: user.username,
            email: user.email
        }, SECRET, {
            expiresIn: "7 days"
        });

        //return the response
        let result = {
            username: user.username,
            email: user.email,
            role: user.role,
            token: `Bearer ${token}`,
            expiresIn: 168
        }

        return res.status(403).json({
            ...result,
            message: `You are logged in as1 as ${role}`,
            succes: true
        });
    } else {
        return res.status(403).json({
            message: "Incorrect password ",
            succes: false
        });
    }

};

const validate_username = async(username) => {
    let user = await User.findOne({
        username
    });
    return user ? false : true;
};

// passport middleware
const user_authentication = passport.authenticate("jwt", { session: false });

const validate_email = async(email) => {
    let user = await User.findOne({
        email
    });
    return user ? false : true;
};

// check role middleware
const check_role = roles => (req, res, next) => {
    if (roles.includes(req.user.role)) {
        next();
    } else {
        return res.status(401).json({
            message: "Unauthorised",
            success: false
        });
    }
};

const serialise_user = (user) => {
    return {
        username: user.username,
        email: user.email,
        _id: user._id,
        name: user.name,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
    };
}

module.exports = {
    user_authentication,
    user_registration,
    user_login,
    serialise_user,
    check_role
};