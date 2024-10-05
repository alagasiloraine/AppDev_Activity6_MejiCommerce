const db = require('../config/db'); // Assuming you have a MySQL database connection setup
const multer = require('multer');
const path = require('path');

exports.getDashboardData = async (req, res) => {
    // Check if the user is authenticated
    if (!req.session.user) {
        return res.redirect('/login'); // Redirect if not logged in
    }

    try {
        // Fetch the necessary data using promises
        const [productCount] = await db.query('SELECT COUNT(*) AS totalProducts FROM products');
        const [categories] = await db.query('SELECT * FROM categories');
        const [orderData] = await db.query('SELECT COUNT(*) AS monthlyOrders, SUM(total_amount) AS monthlyRevenue FROM orders WHERE MONTH(created_at) = MONTH(CURRENT_DATE())');
        const [userCount] = await db.query('SELECT COUNT(*) AS totalUsers FROM users');

        // Calculate previous month handling
        const currentMonth = new Date().getMonth() + 1; // Months are zero-indexed
        const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;

        // Fetch additional data for "change from last month"
        const [productChange] = await db.query('SELECT COUNT(*) AS productChange FROM products WHERE MONTH(created_at) = ?', [previousMonth]);
        const [orderChange] = await db.query('SELECT COUNT(*) AS orderChange FROM orders WHERE MONTH(created_at) = ?', [previousMonth]);
        const [revenueChange] = await db.query('SELECT SUM(total_amount) AS revenueChange FROM orders WHERE MONTH(created_at) = ?', [previousMonth]);
        const [userChange] = await db.query('SELECT COUNT(*) AS userChange FROM users WHERE MONTH(created_at) = ?', [previousMonth]);

        // Get monthly sales data (for the chart)
        const [monthlySales] = await db.query(`
            SELECT MONTH(created_at) AS month, SUM(total_amount) AS total 
            FROM orders 
            WHERE YEAR(created_at) = YEAR(CURRENT_DATE())
            GROUP BY MONTH(created_at)
        `);

        // Get recent orders
        const [recentOrders] = await db.query(`
            SELECT order_id, user_id, total_amount FROM orders 
            ORDER BY created_at DESC LIMIT 5
        `);

        // Render the dashboard view with data
        res.render('admin/dashboard', {
            user: req.session.user, // Pass user info to the view
            totalProducts: productCount[0].totalProducts,
            monthlyOrders: orderData[0].monthlyOrders,
            monthlyRevenue: orderData[0].monthlyRevenue,
            totalUsers: userCount[0].totalUsers,
            productChange: productChange[0].productChange,
            orderChange: orderChange[0].orderChange,
            revenueChange: revenueChange[0].revenueChange,
            userChange: userChange[0].userChange,
            monthlySales,
            recentOrders
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
};

exports.getCategories = async (req, res) => {
    try {
        const [categories] = await db.query('SELECT * FROM categories');
        res.render('adminDashboard', { categories });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).send('Server error');
    }
};

// Configure multer for image upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/images/'); // Destination folder for uploaded images
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Save with unique filename
    }
});
// File upload settings
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png|gif/;
        const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = fileTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb('Error: Images Only!');
        }
    }
}).single('image'); // 'image' is the field name
// Get all products
exports.getProducts = async (req, res) => {
    try {
        const [products] = await db.query('SELECT * FROM products');
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
};
//add products
exports.addProduct = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ error: err });
        }

        const { name, description, price, category_id } = req.body;
        const imageUrl = req.file ? `/uploads/images/${req.file.filename}` : null;

        try {
            if (!name || !description || !price || !category_id || !imageUrl) {
                return res.status(400).json({ error: 'All fields are required' });
            }

            await db.query('INSERT INTO products (prodname, description, price, image, cat_id) VALUES (?, ?, ?, ?, ?)', 
                [name, description, price, imageUrl, category_id]);

            res.status(201).json({ message: 'Product added successfully' });
        } catch (error) {
            console.error('Error adding product:', error);
            res.status(500).json({ error: 'Failed to add product' });
        }
    });
};


// Delete a product
exports.deleteProduct = async (req, res) => {
    const { id } = req.params;

    try {
        await db.query('DELETE FROM products WHERE id = ?', [id]);
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Failed to delete product' });
    }
};

// Get all orders
exports.getOrders = async (req, res) => {
    try {
        const [orders] = await db.query('SELECT orders.*, users.username AS user FROM orders JOIN users ON orders.user_id = users.user_id');
        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
};

