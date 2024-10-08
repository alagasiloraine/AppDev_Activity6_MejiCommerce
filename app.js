const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const routes = require('./routes/routes');
const app = express();
const path = require('path');

app.use(session({
    secret: 'your_secret_key_here',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false, 
        maxAge: 1000 * 60 * 60 * 24, 
    },
}));

app.use((req, res, next) => {
    if (req.session.user) {
        res.locals.user = req.session.user; 
    }
    next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use('/', routes); 

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
