const Product = require('../models/product');

// Display all products
exports.index = (req, res) => {
    Product.getAllProducts((err, results) => {
        if (err) throw err;
        res.render('index', { products: results });
    });
};

// Show form to add a new product
exports.showAddForm = (req, res) => {
    res.render('add');
};

// Add a new product
exports.add = (req, res) => {
    const newProduct = {
        name: req.body.name,
        price: req.body.price,
        description: req.body.description,
        stocks: req.body.stocks
    };

    Product.addProduct(newProduct, (err) => {
        if (err) throw err;
        res.redirect('/');
    });
};

// Show form to edit a product
exports.showEditForm = (req, res) => {
    const id = req.params.id;
    Product.getProductById(id, (err, result) => {
        if (err) throw err;
        res.render('edit', { product: result[0] });
    });
};

// Edit a product
exports.edit = (req, res) => {
    const id = req.params.id;
    const updatedProduct = {
        name: req.body.name,
        price: req.body.price,
        description: req.body.description,
        stocks: req.body.stocks
    };

    Product.updateProduct(id, updatedProduct, (err) => {
        if (err) throw err;
        res.redirect('/');
    });
};

// Delete a product
exports.delete = (req, res) => {
    const id = req.params.id;
    Product.deleteProduct(id, (err) => {
        if (err) throw err;
        res.redirect('/');
    });
};
