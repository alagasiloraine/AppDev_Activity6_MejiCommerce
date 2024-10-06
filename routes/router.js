// const express = require('express');
// const router = express.Router();
// const mejicoController = require('../Controller/mejicoController');
// const adminController = require('../Controller/adminController');
// const userController = require('../Controller/userController');
// const customerController = require('../Controller/customerController');

// // Public routes (Handled by mejicoController)
// router.get('/', (req, res) => {
//     // Pass the user session data to the EJS template
//     return res.render('home', {
//         user: req.session.user // Pass the user object if logged in
//     });
// });
// router.get('/about', mejicoController.about);
// router.get('/contact', mejicoController.contact);
// router.get('/testimonial', mejicoController.testimonial);
// router.get('/feature', mejicoController.feature);
// router.get('/product', mejicoController.product);
// router.get('/howtouse', mejicoController.howtouse);
// router.get('/blog', mejicoController.blog);
// router.get('/notFound', mejicoController.notFound);
// router.get('/logout', (req, res) => {
//     req.session.destroy(err => {
//         if (err) {
//             return res.redirect('/'); // Redirect to home on error
//         }
//         res.clearCookie('connect.sid'); // Clear the cookie
//         res.redirect('/'); // Redirect to home page after logout
//     });
// });

// // User routes (Handled by userController)
// router.get('/login', userController.login);
// router.get('/register', userController.register);  // Register route
// router.post('/login', userController.handleLogin);
// router.post('/register', userController.handleRegister);

// // Customer routes (Handled by customerController)
// router.get('/customer/products', customerController.getAllProducts);  // Get all products for customers
// router.get('/customer/products/:prod_id', customerController.getProduct);  // Get a single product by ID

// // Cart operations for customers
// router.post('/customer/cart', customerController.addToCart);          // Add product to cart
// router.get('/customer/cart', customerController.getCart);             // Get the cart for the current user
// router.delete('/customer/cart/:cart_id', customerController.removeFromCart); // Remove a specific item from the cart
// router.delete('/customer/cart', customerController.clearCart);        // Clear the entire cart

// // Order submission for customers
// router.post('/customer/order', customerController.submitOrder);       // Submit an order

// // Admin routes (Handled by adminController)
// router.get('/admin/dashboard', adminController.getDashboardData); // Get dashboard data
// router.get('/admin/products', adminController.getProducts); // Get all products
// router.post('/admin/products', adminController.addProduct); // Add a new product
// router.delete('/admin/products/:prod_id', adminController.deleteProduct); // Delete a product
// router.get('/admin/orders', adminController.getOrders); // Get all orders

// router.get('/admin/products', adminController.getProducts);
// router.post('/addProduct', adminController.addProduct);    



// module.exports = router;
const express = require('express');
const router = express.Router();
const mejicoController = require('../Controller/mejicoController');
const adminController = require('../Controller/adminController');
const userController = require('../Controller/userController');
const customerController = require('../Controller/customerController');

// Public routes (Handled by mejicoController)
router.get('/', (req, res) => {
    // Pass the user session data to the EJS template
    return res.render('home', {
        user: req.session.user // Pass the user object if logged in
    });
});
router.get('/about', mejicoController.about);
router.get('/contact', mejicoController.contact);
router.get('/testimonial', mejicoController.testimonial);
router.get('/feature', mejicoController.feature);
router.get('/product', mejicoController.product);
router.get('/howtouse', mejicoController.howtouse);
router.get('/blog', mejicoController.blog);
router.get('/notFound', mejicoController.notFound);
router.get('/logout', (req, res) => {
        req.session.destroy(err => {
            if (err) {
                return res.redirect('/'); // Redirect to home on error
            }
            res.clearCookie('connect.sid'); // Clear the cookie
            res.redirect('/'); // Redirect to home page after logout
        });
    });

// User routes (Handled by userController)
router.get('/login', userController.login);
router.get('/register', userController.register);  // Register route
router.post('/login', userController.handleLogin);
router.post('/register', userController.handleRegister);

// Customer routes (Handled by customerController)
router.get('/customer/products', customerController.getAllProducts);  // Get all products for customers
router.get('/customer/products/:prod_id', customerController.getProduct);  // Get a single product by ID

// Cart operations for customers
router.post('/customer/cart', customerController.addToCart);          // Add product to cart
router.get('/customer/cart', customerController.getCart);             // Get the cart for the current user
router.delete('/customer/cart/:cart_id', customerController.removeFromCart); // Remove a specific item from the cart
router.delete('/customer/cart', customerController.clearCart);        // Clear the entire cart

// Order submission for customers
router.post('/customer/order', customerController.submitOrder);       // Submit an order

// Admin routes (Handled by adminController)
router.get('/admin/dashboard', adminController.getDashboardData); // Get dashboard data
router.get('/admin/products', adminController.getProducts); // Get all products
router.post('/admin/products', adminController.addProduct); // Add a new product
router.post('/admin/products/:prod_id', adminController.editProduct);

router.get('/admin/products/:prod_id', adminController.viewProduct); //View Product
router.delete('/admin/products/:prod_id', adminController.deleteProduct); // Delete a product
router.get('/admin/orders', adminController.getOrders); // Get all orders

module.exports = router;

