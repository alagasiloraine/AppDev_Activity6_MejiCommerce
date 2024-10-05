const db = require('../config/db');
const bcrypt = require('bcrypt');

// Hash the defaultAdmin password synchronously on initialization
const defaultAdmin = {
    username: 'admin',
    password: bcrypt.hashSync('admin123', 10),  // Use hashSync to hash the password synchronously
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
    customerPage: (req, res) => {
        res.render('customerPage');
    },
    handleLogin: async (req, res) => {
        const { username, password } = req.body;
    
        try {
            // Check if login matches the defaultAdmin
            if (username === defaultAdmin.username) {
                const isMatch = await bcrypt.compare(password, defaultAdmin.password);
                if (isMatch) {
                    if (req.session) {
                        req.session.user = { username: defaultAdmin.username, role: 'admin' };
                        return res.redirect('/admin/dashboard');
                    } else {
                        console.error('Session is not available');
                        return res.status(500).send('Internal Server Error');
                    }
                } else {
                    return res.status(401).send('Invalid admin password.');
                }
            }
    
            // If not admin, check in the database for customers
            const queryCheck = `SELECT * FROM users WHERE username = ? OR email = ?`;
            const [results] = await db.query(queryCheck, [username, username]); // assuming username or email can be used
            const user = results[0];
    
            if (user) {
                const isMatch = await bcrypt.compare(password, user.password);
                if (isMatch) {
                    if (req.session) {
                        req.session.user = {
                            name: user.name,
                            username: user.username,
                            role: 'customer',
                        };
                        return res.render('customers/customerPage', {
                            name: req.session.user.name,
                        });
                    } else {
                        console.error('Session is not available');
                        return res.status(500).send('Internal Server Error');
                    }
                } else {
                    return res.status(401).send('Invalid username or password.');
                }
            } else {
                return res.status(401).send('User not found.');
            }
    
        } catch (error) {
            console.error('Login error:', error);
            return res.status(500).send('Internal Server Error');
        }
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
