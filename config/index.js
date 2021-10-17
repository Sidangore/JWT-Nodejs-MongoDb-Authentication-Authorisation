require('dotenv').config();

module.exports = {
    SECRET: process.env.APP_SECRET,
    PORT: process.env.APP_PORT,
    URL: process.env.URL
};