const db = require('../config/db');
const bcrypt = require('bcrypt');

const defaultAdmin = {
    username: 'admin',
    password: bcrypt.hashSync('admin123', 10),  
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
           
            if (username === defaultAdmin.username) {
                const isMatch = await bcrypt.compare(password, defaultAdmin.password);
                if (isMatch) {
                    req.session.user = { username: defaultAdmin.username, role: 'admin' };
                    return res.redirect('/admin/dashboard');
                } else {
                    return res.status(401).send('Invalid admin password.');
                }
            }

            const queryCheck = `SELECT * FROM users WHERE username = ? OR email = ?`;
            const [results] = await db.query(queryCheck, [username, username]);  
            const user = results[0];

            if (user) {
                const isMatch = await bcrypt.compare(password, user.password);
                if (isMatch) {
                    req.session.user = {
                        user_id: user.user_id, 
                        username: user.username,
                        role: 'customer',
                    };
                    return res.render('customers/customerPage', {
                        username: req.session.user.username,
                    });
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

        if (password !== confirmPassword) {
            return res.status(400).json({ error: 'Passwords do not match.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const queryCheck = `SELECT * FROM users WHERE username = ? OR email = ?`;

        try {
            const [results] = await db.query(queryCheck, [username, email]);

            if (results.length > 0) {
                return res.status(400).json({ error: 'Username or email already exists.' });
            }

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
