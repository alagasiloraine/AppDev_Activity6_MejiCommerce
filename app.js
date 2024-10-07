const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const routes = require('./routes/router'); // Import the routes
const app = express();
const path = require('path');

// Session configuration
app.use(session({
    secret: 'your_secret_key_here',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false, // Set to true if using HTTPS
        maxAge: 1000 * 60 * 60 * 24, // 1 day expiration
    },
}));

// Debugging middleware for session logging
app.use((req, res, next) => {
    console.log('Session:', req.session); // Log the session for debugging
    next();
});

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Serve static files from the 'uploads' directory for image access
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Set up EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Use routes
app.use('/', routes); // All routes handled in the routes file

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
