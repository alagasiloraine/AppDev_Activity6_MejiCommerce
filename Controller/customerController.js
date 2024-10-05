const db = require('../config/db');
// const { getAllProducts, getProduct, addToCart, getCart, removeFromCart, clearCart, submitOrder } = require('./customerController');

// Get all products
const getAllProducts = async (req, res) => {
  try {
    const [products] = await db.query('SELECT * FROM products');
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
};

// Get a single product
const getProduct = async (req, res) => {
  try {
    const [product] = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (product.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product', error: error.message });
  }
};

// Add to cart
const addToCart = async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user.id; // Assuming user authentication is implemented

  try {
    const [product] = await db.query('SELECT * FROM products WHERE id = ?', [productId]);
    if (product.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await db.query(
      'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)',
      [userId, productId, quantity]
    );

    res.status(201).json({ message: 'Product added to cart' });
  } catch (error) {
    res.status(500).json({ message: 'Error adding to cart', error: error.message });
  }
};

// Get cart
const getCart = async (req, res) => {
  const userId = req.user.user_id; // Assuming user authentication is implemented

  try {
    const [cartItems] = await db.query(
      `SELECT c.id, p.name, p.price, c.quantity 
       FROM cart c 
       JOIN products p ON c.product_id = p.id 
       WHERE c.user_id = ?`,
      [userId]
    );
    res.json(cartItems);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching cart', error: error.message });
  }
};

// Remove from cart
const removeFromCart = async (req, res) => {
  const userId = req.user.id; // Assuming user authentication is implemented
  const { id } = req.params;

  try {
    await db.query('DELETE FROM cart WHERE id = ? AND user_id = ?', [id, userId]);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error removing from cart', error: error.message });
  }
};

// Clear cart
const clearCart = async (req, res) => {
  const userId = req.user.id; // Assuming user authentication is implemented

  try {
    await db.query('DELETE FROM cart WHERE user_id = ?', [userId]);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error clearing cart', error: error.message });
  }
};

// Submit order
const submitOrder = async (req, res) => {
  const userId = req.user.user_id; // Assuming user authentication is implemented

  try {
    // Start a transaction
    await db.beginTransaction();

    // Create a new order
    const [orderResult] = await db.query('INSERT INTO orders (user_id, status) VALUES (?, "pending")', [userId]);
    const orderId = orderResult.insertId;

    // Get cart items
    const [cartItems] = await db.query(
      `SELECT c.product_id, c.quantity, p.price 
       FROM cart c 
       JOIN products p ON c.product_id = p.id 
       WHERE c.user_id = ?`,
      [userId]
    );

    // Insert order items
    for (const item of cartItems) {
      await db.query(
        'INSERT INTO order_items (item_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.product_id, item.quantity, item.price]
      );
    }

    // Clear the cart
    await db.query('DELETE FROM cart WHERE user_id = ?', [userId]);

    // Commit the transaction
    await db.commit();

    res.status(201).json({ message: 'Order submitted successfully', orderId });
  } catch (error) {
    // If there's an error, rollback the transaction
    await db.rollback();
    res.status(500).json({ message: 'Error submitting order', error: error.message });
  }
};

// Export individual functions
module.exports = {
  getAllProducts,
  getProduct,
  addToCart,
  getCart,
  removeFromCart,
  clearCart,
  submitOrder
};
