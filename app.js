const bodyParser = require('body-parser');
const express = require('express');
const routes = require('./routes/router'); // Import the router
const app = express();

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Middleware for parsing URL-encoded data
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Use the routes defined in the router.js file
app.use('/', routes);  // This line will handle all the routes

// Start the server
app.listen(3000, () => {
    console.log('Server initialized on http://localhost:3000');
});
