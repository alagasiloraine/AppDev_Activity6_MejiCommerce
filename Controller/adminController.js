const db = require('../config/db');
const multer = require('multer');
const path = require('path');

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

exports.getCategories = async (req, res) => {
    try {
        const [categories] = await db.query('SELECT * FROM categories');
        res.render('adminDashboard', { categories });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Failed to fetch categories. Please try again later.' });
    }
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads/images');
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

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

exports.getProducts = async (req, res) => {
    try {
        const [products] = await db.query('SELECT * FROM products');
        res.render('admin/products', { products });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Failed to fetch products. Please try again later.' });
    }
};

exports.addProduct = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            console.error('File upload error:', err);
            return res.status(400).json({ error: 'Error uploading file' });
        }

        const { prodname, description, price, cat_id } = req.body;
        const fileName = req.file ? req.file.filename : null;

        try {
            if (!prodname || !description || !price || !cat_id || !fileName) {
                return res.status(400).json({ error: 'All fields are required' });
            }

            const decimalPrice = parseFloat(price);
            if (isNaN(decimalPrice)) {
                return res.status(400).json({ error: 'Price must be a valid number.' });
            }

            const query = 'INSERT INTO products (prodname, description, price, image, cat_id) VALUES (?, ?, ?, ?, ?)';
            const result = await db.query(query, [prodname, description, decimalPrice.toFixed(2), fileName, cat_id]);

            const lastInsertedId = result.insertId;

            const newProduct = {
                prodname,
                description,
                price: decimalPrice.toFixed(2),
                image: fileName,
                cat_id,
                prod_id: lastInsertedId 
            };

            res.status(201).json({ message: 'Product added successfully', product: newProduct });
        } catch (error) {
            console.error('Error adding product:', error);
            res.status(500).json({ error: 'Failed to add product. Please try again later.' });
        }
    });
};


exports.viewProduct = async (req, res) => {
    const prod_id = req.params.prod_id;
    try {
        const [result] = await db.query('SELECT * FROM products WHERE prod_id = ?', [prod_id]);

        if (result.length === 0) {
            return res.status(404).send('Product not found.');
        }

        res.render('admin/view-product', { product: result[0] });
    } catch (err) {
        console.error('Error fetching product:', err);
        return res.status(500).send('Error fetching product.');
    }
};

exports.editProduct = async (req, res) => {
    console.log(req.body);
    console.log(req.file);

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
        const prod_id = req.params.prod_id;

        const [result] = await db.query('DELETE FROM products WHERE prod_id = ?', [prod_id]);

        if (result.affectedRows > 0) {
            res.json({ success: true, message: 'Product deleted successfully' });
        } else {
            res.status(404).json({ success: false, error: 'Product not found' });
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ success: false, error: 'Failed to delete product' });
    }
};

exports.getOrders = async (req, res) => {
    try {
        const query = `
            SELECT o.order_id, o.total_amount, o.status, 
                   p.prodname AS product_name, 
                   o.created_at
            FROM orders o
            INNER JOIN cart c ON o.cart_id = c.cart_id
            INNER JOIN products p ON c.prod_id = p.prod_id;
        `;

        console.log('Executing SQL Query:', query);

        const [orders] = await db.query(query);

        console.log('Fetched Orders:', orders);

        if (!orders || orders.length === 0) {
            return res.status(200).json([]);
        }

        res.status(200).json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Failed to fetch orders. Please try again later.' });
    }
};

exports.updateOrderStatus = async (req, res) => {
    const { order_id } = req.params;
    const { status } = req.body;

    try {
        await db.query('UPDATE orders SET status = ? WHERE order_id = ?', [status, order_id]);

        res.status(200).json({ message: 'Order status updated successfully.' });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ message: 'Failed to update order status.' });
    }
};

exports.getUsers = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT user_id, name, username, email, role FROM users');
        res.render('admin/customer', { users: rows });
    } catch (error) {
        console.error('Error retrieving users:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getOrders = async (req, res) => {
    try {
        const query = `
            SELECT 
                o.order_id,  
                u.name,  
                p.prodname,
                oi.price,
                o.created_at,
                o.status 
            FROM 
                orders o 
            JOIN 
                orders_item oi ON o.order_id = oi.order_id 
            JOIN 
                products p ON oi.prod_id = p.prod_id
            JOIN 
                users u ON o.user_id = u.user_id  
            ORDER BY 
                o.created_at DESC;
        `;

        const [orders] = await db.query(query);
        
        return res.render('admin/order', { orders });
    } catch (error) {
        console.error("Error retrieving orders:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
};

exports.getDashboardData = async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    try {
        const [productCount] = await db.query('SELECT COUNT(*) AS totalProducts FROM products');
        const [userCount] = await db.query('SELECT COUNT(*) AS totalUsers FROM users');
        const [totalOrdersResult] = await db.query('SELECT COUNT(*) AS totalOrders FROM orders');

        res.render('admin/dashboard', {
            totalProducts: productCount[0].totalProducts,
            totalUsers: userCount[0].totalUsers,
            totalOrders: totalOrdersResult[0].totalOrders
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard data. Please try again later.' });
    }
};

exports.getCategories = async (req, res) => {
    try {
        const [categories] = await db.query('SELECT * FROM categories');
        res.render('admin/category', { categories });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};

exports.addCategory = async (req, res) => {
    const { catname } = req.body;
    if (!catname) {
        return res.status(400).send('Category name is required');
    }
    try {
        await db.query('INSERT INTO categories (catname) VALUES (?)', [catname]);
        res.redirect('/admin/category');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};

exports.deleteCategory = async (req, res) => {
    const { id } = req.params;

    try {
        await db.query('DELETE FROM categories WHERE cat_id = ?', [id]);
        res.redirect('/admin/category');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};

exports.getProducts = async (req, res) => {
    try {
        const [products] = await db.query('SELECT * FROM products');
        const [categories] = await db.query('SELECT cat_id, catname FROM categories');

        res.render('admin/products', { products, categories });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Failed to fetch products. Please try again later.' });
    }
};

