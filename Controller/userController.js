const db = require('../config/db');
const bcrypt = require('bcrypt');
const { customerPage } = require('./customerController');

// Hash the defaultAdmin password on initialization
const defaultAdmin = {
    username: 'admin',
    password: bcrypt.hashSync('admin123', 10),  // Hash this password
};

const userController = {
    login: (req, res) => { 
        res.render('login'); 
    },
    
    register: (req, res) => { 
        res.render('register'); 
    },
    
    dashboard: (req, res) => { 
        res.render('dashboard'); 
    },
    customerPage: (req, res) => {res.render('customerPage');
    },
    handleLogin: (req, res) => {
        const { username, password } = req.body;
    
        // Check if login matches the defaultAdmin
        if (username === defaultAdmin.username) {
            if (bcrypt.compareSync(password, defaultAdmin.password)) {
                if (req.session) {
                    req.session.user = { username: defaultAdmin.username, role: 'admin' };
                } else {
                    console.error('Session is not available');
                    return res.status(500).send('Internal Server Error');
                }
                return res.redirect('/admin/dashboard');
            } else {
                return res.status(401).send('Invalid username or password.');
            }
        }
    
        // Query to check if user exists in the database
        const query = `SELECT * FROM users WHERE username = ? OR email = ?`;
        db.query(query, [username, username], (err, results) => {
            if (err) return res.status(500).send('Internal Server Error');
            
            if (results.length > 0) {
                const user = results[0];
    
                // Compare the provided password with the stored hashed password
                if (bcrypt.compareSync(password, user.password)) {
                    if (req.session) {
                        req.session.user = { username: user.username, role: user.role };
                    } else {
                        console.error('Session is not available');
                        return res.status(500).send('Internal Server Error');
                    }
                    return res.redirect('/customers/customerPage');
                } else {
                    return res.status(401).send('Invalid username or password.');
                }
            } else {
                return res.status(401).send('Invalid username or password.');
            }
        });
    },
    
    handleRegister: async (req, res) => {
        const { name, username, email, password, confirmPassword } = req.body;
    
        // Check if passwords match
        if (password !== confirmPassword) {
            return res.status(400).json({ error: 'Passwords do not match.' });
        }
    
        // Hash the password before storing it
        const hashedPassword = await bcrypt.hash(password, 10);
    
        // Check if the username or email already exists
        const queryCheck = `SELECT * FROM users WHERE username = ? OR email = ?`;
    
        try {
            const [results] = await db.query(queryCheck, [username, email]);
    
            if (results.length > 0) {
                return res.status(400).json({ error: 'Username or email already exists.' });
            }
    
            // Insert the new user into the database
            const queryInsert = `INSERT INTO users (name, username, email, password) VALUES (?, ?, ?, ?)`;
            await db.query(queryInsert, [name, username, email, hashedPassword]);
    
            res.redirect('/login');
        } catch (err) {
            console.error('Error during registration:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }
};


module.exports = userController;

