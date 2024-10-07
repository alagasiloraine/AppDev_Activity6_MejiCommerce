const db = require('../config/db');
const multer = require('multer');
const path = require('path');

// Dashboard data retrieval
exports.getDashboardData = async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    try {
        const [productCount] = await db.query('SELECT COUNT(*) AS totalProducts FROM products');
        const [categories] = await db.query('SELECT * FROM categories');
        const [orderData] = await db.query('SELECT COUNT(*) AS monthlyOrders, SUM(total_amount) AS monthlyRevenue FROM orders WHERE MONTH(created_at) = MONTH(CURRENT_DATE())');
        const [userCount] = await db.query('SELECT COUNT(*) AS totalUsers FROM users');

        const currentMonth = new Date().getMonth() + 1;
        const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;

        const [productChange] = await db.query('SELECT COUNT(*) AS productChange FROM products WHERE MONTH(created_at) = ?', [previousMonth]);
        const [orderChange] = await db.query('SELECT COUNT(*) AS orderChange FROM orders WHERE MONTH(created_at) = ?', [previousMonth]);
        const [revenueChange] = await db.query('SELECT SUM(total_amount) AS revenueChange FROM orders WHERE MONTH(created_at) = ?', [previousMonth]);
        const [userChange] = await db.query('SELECT COUNT(*) AS userChange FROM users WHERE MONTH(created_at) = ?', [previousMonth]);

        const [monthlySales] = await db.query(`
            SELECT MONTH(created_at) AS month, SUM(total_amount) AS total 
            FROM orders 
            WHERE YEAR(created_at) = YEAR(CURRENT_DATE())
            GROUP BY MONTH(created_at)
        `);

        const [recentOrders] = await db.query(`
            SELECT order_id, user_id, total_amount FROM orders 
            ORDER BY created_at DESC LIMIT 5
        `);

        res.render('admin/dashboard', {
            user: req.session.user,
            categories,
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
        res.status(500).json({ error: 'Failed to fetch dashboard data. Please try again later.' });
    }
};

// Categories retrieval
exports.getCategories = async (req, res) => {
    try {
        const [categories] = await db.query('SELECT * FROM categories');
        res.render('adminDashboard', { categories });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Failed to fetch categories. Please try again later.' });
    }
};

// Set storage engine
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads/images');
        cb(null, uploadDir); // Set upload directory
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Save file with a unique name
    }
});

// File upload settings
const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only images are allowed!'), false);
        }
    }
}).single('image');

// Get all products
exports.getProducts = async (req, res) => {
    try {
        const [products] = await db.query('SELECT * FROM products');
        res.render('admin/products', { products });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Failed to fetch products. Please try again later.' });
    }
};

// Add products
exports.addProduct = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            console.error('File upload error:', err);
            return res.status(400).json({ error: 'Error uploading file' });
        }

        const { prodname, description, price, cat_id } = req.body;
        const fileName = req.file ? req.file.filename : null;

        try {
            // Validate input fields
            if (!prodname || !description || !price || !cat_id || !fileName) {
                return res.status(400).json({ error: 'All fields are required' });
            }

            const decimalPrice = parseFloat(price);
            if (isNaN(decimalPrice)) {
                return res.status(400).json({ error: 'Price must be a valid number.' });
            }

            // Insert product into the database and get the last inserted ID
            const query = 'INSERT INTO products (prodname, description, price, image, cat_id) VALUES (?, ?, ?, ?, ?)';
            const result = await db.query(query, [prodname, description, decimalPrice.toFixed(2), fileName, cat_id]);

            // Get the last inserted product ID
            const lastInsertedId = result.insertId;

            // Create new product object for response
            const newProduct = {
                prodname,
                description,
                price: decimalPrice.toFixed(2),
                image: fileName,
                cat_id,
                prod_id: lastInsertedId // Use the last inserted ID here
            };

            res.status(201).json({ message: 'Product added successfully', product: newProduct });
        } catch (error) {
            console.error('Error adding product:', error);
            res.status(500).json({ error: 'Failed to add product. Please try again later.' });
        }
    });
};


// View Product and Redirect
exports.viewProduct = async (req, res) => {
    const prod_id = req.params.prod_id;
    try {
        // Fetch product details from the database by ID
        const [result] = await db.query('SELECT * FROM products WHERE prod_id = ?', [prod_id]);
        
        // If product not found, send 404 error response
        if (result.length === 0) {
            return res.status(404).send('Product not found.');
        }

        // Render the 'view-product' page and pass the product data
        res.render('admin/view-product', { product: result[0] }); // Assuming result[0] contains the product data
    } catch (err) {
        console.error('Error fetching product:', err);
        return res.status(500).send('Error fetching product.');
    }
};

//EDIT PRODUCT
exports.editProduct = async (req, res) => {
    console.log(req.body); // Log form data
    console.log(req.file); // Log uploaded file info

    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }

        const { prod_id, prodname, description, price, cat_id } = req.body;
        const fileName = req.file ? req.file.filename : null;

        if (!prod_id || !prodname || !description || !price || !cat_id) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const decimalPrice = parseFloat(price);
        if (isNaN(decimalPrice)) {
            return res.status(400).json({ error: 'Price must be a valid number.' });
        }

        try {
            const query = fileName
                ? 'UPDATE products SET prodname = ?, description = ?, price = ?, image = ?, cat_id = ? WHERE prod_id = ?'
                : 'UPDATE products SET prodname = ?, description = ?, price = ?, cat_id = ? WHERE prod_id = ?';

            const values = fileName
                ? [prodname, description, decimalPrice.toFixed(2), fileName, cat_id, prod_id]
                : [prodname, description, decimalPrice.toFixed(2), cat_id, prod_id];

            await db.query(query, values);

            res.status(200).json({ message: 'Product updated successfully' });
        } catch (error) {
            console.error('Error updating product:', error);
            res.status(500).json({ error: 'Failed to update product. Please try again later.' });
        }
    });
};

exports.deleteProduct = async (req, res) => {
    try {
        const prod_id = req.params.prod_id;  // Get product ID from request parameters

        // Use parameterized query to avoid SQL injection
        const [result] = await db.query('DELETE FROM products WHERE prod_id = ?', [prod_id]);

        if (result.affectedRows > 0) {
            // Successfully deleted product
            res.json({ success: true, message: 'Product deleted successfully' });
        } else {
            // No rows affected, product not found
            res.status(404).json({ success: false, error: 'Product not found' });
        }
    } catch (error) {
        // Log and return an error response
        console.error('Error deleting product:', error);
        res.status(500).json({ success: false, error: 'Failed to delete product' });
    }
};


// Get all orders
exports.getOrders = async (req, res) => {
    try {
        const [orders] = await db.query('SELECT orders.*, users.username AS user FROM orders JOIN users ON orders.user_id = users.user_id');
        res.render('admin/order', { orders });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Failed to fetch orders. Please try again later.' });
    }
};

   // Function to retrieve all users
 exports.getUsers = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT user_id, name, username, email, role FROM users');
        res.render('admin/customer', { users: rows });
    } catch (error) {
        console.error('Error retrieving users:', error);
        res.status(500).send('Internal Server Error');
    }
};

// Function to retrieve dashboard data (total users and total products)
exports.getDashboardData = async (req, res) => {
    try {
        // Query to get the total number of users
        const [userRows] = await db.query('SELECT COUNT(user_id) AS totalUsers FROM users');
        const totalUsers = userRows[0].totalUsers;

        // Query to get the total number of products
        const [productRows] = await db.query('SELECT COUNT(*) AS total FROM products');
        const totalProducts = productRows[0].total;

        // Render the dashboard with both totalUsers and totalProducts
        res.render('admin/dashboard', { totalUsers, totalProducts });
    } catch (error) {
        console.error('Error retrieving dashboard data:', error);
        res.status(500).send('Internal Server Error');
    }
};

// Get all categories
exports.getCategories = async (req, res) => {
    try {
        // Use the promise-based pool to query the database
        const [categories] = await db.query('SELECT * FROM categories'); // Replace 'categories' with your table name
        res.render('admin/category', {
            categories: categories
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};

// Add a new category
exports.addCategory = async (req, res) => {
    const { catname } = req.body;
    if (!catname) {
        return res.status(400).send('Category name is required');
    }
    try {
        // Use the promise-based pool to insert a new category
        await db.query('INSERT INTO categories (catname) VALUES (?)', [catname]);  // Adjust table and column name as needed
        res.redirect('/admin/category');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};

// Delete a category by ID
exports.deleteCategory = async (req, res) => {
    const { id } = req.params; // Extracting the ID from request parameters

    try {
        // Delete the category from the database
        await db.query('DELETE FROM categories WHERE cat_id = ?', [id]); // Adjust the table and column name as needed
        res.redirect('/admin/category'); // Redirect back to category management page
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};

// Updated getProducts method in adminController.js
exports.getProducts = async (req, res) => {
    try {
        const [products] = await db.query('SELECT * FROM products');
        const [categories] = await db.query('SELECT cat_id, catname FROM categories'); // Fetch categories

        // Pass products and categories to the view
        res.render('admin/products', { products, categories });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Failed to fetch products. Please try again later.' });
    }
};

