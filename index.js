const cors = require('cors'); // to check the middlewares
const express = require('express');
const body_parser = require('body-parser'); // to parse the requests
const mongoose = require('mongoose'); // connect with the mongodb
const consola = require('consola'); // to show the success and errors
const passport = require('passport');

// bring the app constants
const { URL, PORT } = require('./config');

// initialise the application
const app = express();

// middlewares
app.use(cors());
app.use(body_parser.json());
app.use(passport.initialize());

require('./middlewares/passport.middleware')(passport);

// user router middleware
app.use('/api/users', require('./routes/user.routes'));


// the connection to database is async therefore put it in the function
const start_app = async() => {
    try {
        // connect with the DB first
        await mongoose.connect(URL, { useUnifiedTopology: true, useNewUrlParser: true });

        // show the connection with DB Successful message
        consola.success({
            message: `Successfully connected to DB`,
            badge: true
        });

        // connect to the PORT
        app.listen(PORT, () => consola.success({ message: `Server started on PORT: ${PORT}`, badge: true }));

    } catch (error) {
        // Show error message with the connection with DB fails
        consola.error({
            message: `Connection failed with DB: ${error}`,
            badge: true
        });

        //retry the connection to db
        start_app();
    }
};

start_app();