const express = require('express');
const router = express.Router();
const mejicoController = require('../Controller/mejicoController');
const adminController = require('../Controller/adminController');
const userController = require('../Controller/userController');
const customerController = require('../Controller/customerController');

const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.status(401).json({ error: 'User not logged in.' });
    }
};

router.get('/', (req, res) => {
    return res.render('home', {
        user: req.session.user 
    });
});

router.get('/about', (req, res) => {
    return res.render('about', {
        user: req.session.user 
    });
});

router.get('/contact', (req, res) => {
    return res.render('contact', {
        user: req.session.user 
    });
});

router.get('/testimonial', (req, res) => {
    return res.render('testimonial', {
        user: req.session.user 
    });
});

router.get('/feature', (req, res) => {
    return res.render('feature', {
        user: req.session.user 
    });
});

router.get('/product', (req, res) => {
    return res.render('product', {
        user: req.session.user 
    });
});

router.get('/howtouse', (req, res) => {
    return res.render('howtouse', {
        user: req.session.user 
    });
});

router.get('/blog', (req, res) => {
    return res.render('blog', {
        user: req.session.user 
    });
});

router.get('/blog1', (req, res) => {
    return res.render('blog1', {
        user: req.session.user 
    });
});

router.get('/blog2', (req, res) => {
    return res.render('blog2', {
        user: req.session.user 
    });
});

router.get('/blog3', (req, res) => {
    return res.render('blog3', {
        user: req.session.user 
    });
});

router.get('/notFound', (req, res) => {
    return res.render('notFound', {
        user: req.session.user 
    });
});

router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/'); 
        }
        res.redirect('/?message=loggedout'); 
    });
});

router.get('/login', userController.login);
router.get('/register', userController.register); 
router.post('/register', userController.handleRegister);
router.post('/login', userController.handleLogin);

router.use('/customers/cart', isAuthenticated);
router.use('/customers/checkout', isAuthenticated);

router.get('/customers/products', customerController.getProducts); 
router.post('/customers/cart/:prod_id', customerController.addToCart); 
router.get('/customers/cart', customerController.viewCart); 
router.post('/customers/checkout', customerController.checkout); 
router.use('/admin', isAuthenticated);

router.get('/admin/products',adminController.getProducts) 
router.get('/admin/products',adminController.getProducts) 
router.post('/admin/products',adminController.addProduct); 

router.get('/admin/products/:prod_id',adminController.viewProduct) 
router.delete('/admin/products/:prod_id',adminController.deleteProduct) 
router.post('/admin/products/:prod_id',adminController.editProduct); 
router.get('/admin/customer', adminController.getUsers); 

router.get('/admin/order', adminController.getOrders); 
router.get('/admin/dashboard', adminController.getDashboardData); 

router.get('/admin/category', adminController.getCategories);
router.post('/admin/category', adminController.addCategory);

router.get('/admin/orders', adminController.getOrders);
router.post('/orders/update-status/:order_id', adminController.updateOrderStatus);

router.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});
    

module.exports = router;