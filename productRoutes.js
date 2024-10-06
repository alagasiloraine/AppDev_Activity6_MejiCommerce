const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Routes
router.get('/', productController.index);
router.get('/add', productController.showAddForm);
router.post('/add', productController.add);
router.get('/edit/:id', productController.showEditForm);
router.post('/edit/:id', productController.edit);
router.get('/delete/:id', productController.delete);

module.exports = router;
