const db = require('../config/db');

const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.status(401).json({ message: "Please log in to access this resource." });
    }
};


const getProducts = async (req, res) => {
    try {
        const [products] = await db.query('SELECT * FROM products');
        const username = req.session.user ? req.session.user.username : null;
        const user_id = req.session.user ? req.session.user.user_id : null;

        let cartCount = 0;
        if (user_id) {
            const [cartRows] = await db.query('SELECT COUNT(*) AS count FROM cart WHERE user_id = ?', [user_id]);
            cartCount = cartRows[0].count;
        }

        res.render('customers/products', {
            user: username,
            products: products,
            cartCount: cartCount 
        });
    } catch (err) {
        console.error('Error fetching products:', err);
        return res.status(500).send('Error fetching products');
    }
};

const getCartCount = async (userId) => {
    const [result] = await db.query('SELECT COUNT(*) as count FROM cart WHERE user_id = ?', [userId]);
    return result[0].count;
};

const addToCart = async (req, res) => {
    const prod_id = req.params.prod_id;
    const quantity = req.body.quantity || 1;

    try {
        if (!req.session.user) {
            console.log('User session not found');
            return res.status(401).json({ error: 'User must be logged in to add items to the cart.' });
        }

        const user_id = req.session.user.user_id;
        if (!user_id) {
            console.log('User ID not found in session:', req.session.user);
            return res.status(400).json({ error: 'Invalid session. User ID is missing.' });
        }

        await db.query('INSERT INTO cart (user_id, prod_id, quantity) VALUES (?, ?, ?)', [user_id, prod_id, quantity]);

        res.json({ success: true, message: 'Product added to cart.' });
    } catch (error) {
        console.error("Error adding to cart:", error);
        res.status(500).json({ error: 'Failed to add product to cart.' });
    }
};

const viewCart = async (req, res) => {
    const user_id = req.session.user.user_id;

    try {
        let cartItems = [];
        let totalPrice = 0;
        let cartCount = 0;

        const [cartRows] = await db.query('SELECT p.prodname, p.price, c.quantity FROM cart c JOIN products p ON c.prod_id = p.prod_id WHERE c.user_id = ?', [user_id]);
        cartItems = cartRows;

        totalPrice = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
        cartCount = cartItems.length;

        res.render('customers/cart', {
            cartItems,
            totalPrice,
            cartCount, 
            user: req.session.user
        });
    } catch (error) {
        console.error("Error viewing cart:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
};

const checkout = async (req, res) => {
    const user_id = req.session.user.user_id;

    const connection = await db.getConnection(); 
    await connection.beginTransaction(); 

    try {
        const [cartRows] = await connection.query(
            `SELECT c.cart_id, c.prod_id, c.quantity, p.price 
             FROM cart c 
             JOIN products p ON c.prod_id = p.prod_id 
             WHERE c.user_id = ?`, 
            [user_id]
        );

        if (cartRows.length === 0) {
            return res.status(400).json({ message: "Cart is empty." });
        }

        let total_amount = cartRows.reduce((total, item) => total + (item.quantity * item.price), 0);
        const status = 'pending'; 
        const cart_id = cartRows[0].cart_id; 
        const [orderResult] = await connection.query(
            'INSERT INTO orders (user_id, cart_id, total_amount, status) VALUES (?, ?, ?, ?)', 
            [user_id, cart_id, total_amount, status] 
        );

        if (orderResult.affectedRows === 0) {
            throw new Error("Failed to create order.");
        }

        const order_id = orderResult.insertId; 

        for (const item of cartRows) {
            const { prod_id, quantity, price } = item;
            await connection.query(
                'INSERT INTO orders_item (order_id, prod_id, quantity, price) VALUES (?, ?, ?, ?)', 
                [order_id, prod_id, quantity, price]
            );
        }

        await connection.commit(); 
        return res.status(200).json({ message: "Checkout successful!" });
    } catch (error) {
        await connection.rollback(); 
        console.error("Error during checkout:", error);
        return res.status(500).json({ message: "Internal server error." });
    } finally {
        connection.release(); 
    }
};


module.exports = {
    getProducts,
    addToCart,
    getCartCount,
    viewCart,
    checkout,
    isAuthenticated,
}