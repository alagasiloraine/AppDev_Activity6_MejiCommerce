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

        // Get the cart count for the logged-in user
        let cartCount = 0;
        if (user_id) {
            const [cartRows] = await db.query('SELECT COUNT(*) AS count FROM cart WHERE user_id = ?', [user_id]);
            cartCount = cartRows[0].count; // Get the count of items in the cart
        }

        res.render('customers/products', {
            user: username,
            products: products,
            cartCount: cartCount // Pass cartCount to the view
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
    // Get user_id from session
    const user_id = req.session.user.user_id; 
    
    // Convert prod_id to integer from route parameter
    const prod_id = parseInt(req.params.prod_id, 10); 
    
    // Log the product ID for debugging purposes
    console.log("Received Product ID:", prod_id);

    // Ensure the quantity is at least 1 (defaults to 1 if not provided)
    const quantity = Math.max(parseInt(req.body.quantity, 10) || 1, 1); 
    
    try {
        // Validate that the prod_id is a valid number
        if (isNaN(prod_id)) {
            return res.status(400).json({ message: "Invalid Product ID." });
        }

        // Check if the product is already in the cart
        const [cartRows] = await db.query('SELECT * FROM cart WHERE user_id = ? AND prod_id = ?', [user_id, prod_id]);

        if (cartRows.length > 0) {
            // If product is already in the cart, update the quantity
            await db.query('UPDATE cart SET quantity = quantity + ? WHERE user_id = ? AND prod_id = ?', [quantity, user_id, prod_id]);
            // Get the updated cart count
            const [cartCountRows] = await db.query('SELECT COUNT(*) AS count FROM cart WHERE user_id = ?', [user_id]);
            const cartCount = cartCountRows[0].count;
            return res.json({ message: "Product quantity updated in cart.", cartCount });
        } else {
            // If product is not in the cart, insert it with the desired quantity
            await db.query('INSERT INTO cart (user_id, prod_id, quantity) VALUES (?, ?, ?)', [user_id, prod_id, quantity]);
            // Get the updated cart count
            const [cartCountRows] = await db.query('SELECT COUNT(*) AS count FROM cart WHERE user_id = ?', [user_id]);
            const cartCount = cartCountRows[0].count;
            return res.status(201).json({ message: "Product added to cart successfully!", cartCount });
        }
    } catch (error) {
        // Handle any errors and log them for debugging
        console.error("Error adding to cart:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
};

const viewCart = async (req, res) => {
    const user_id = req.session.user.user_id;

    try {
        let cartItems = [];
        let totalPrice = 0;

        const [cartRows] = await db.query('SELECT p.prodname, p.price, c.quantity FROM cart c JOIN products p ON c.prod_id = p.prod_id WHERE c.user_id = ?', [user_id]);
        cartItems = cartRows;

        totalPrice = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

        res.render('customers/cart', {
            cartItems,
            totalPrice
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
            'INSERT INTO orders (cart_id, total_amount, status) VALUES (?, ?, ?)', 
            [cart_id, total_amount, status]
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

        await connection.query('DELETE FROM cart WHERE user_id = ?', [user_id]);

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
    viewCart,
    checkout,
    isAuthenticated,
}
