const mysql = require('mysql');

// Create a MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // replace with your MySQL username
    password: '', // replace with your MySQL password
    database: 'mejico_db'
});

// Connect to the database
db.connect((err) => {
    if (err) throw err;
    console.log('MySQL Connected...');
});

// CRUD operations
exports.getAllProducts = (callback) => {
    db.query('SELECT * FROM products', callback);
};

exports.addProduct = (product, callback) => {
    db.query('INSERT INTO products SET ?', product, callback);
};

exports.getProductById = (id, callback) => {
    db.query('SELECT * FROM products WHERE id = ?', [id], callback);
};

exports.updateProduct = (id, product, callback) => {
    db.query('UPDATE products SET ? WHERE id = ?', [product, id], callback);
};

exports.deleteProduct = (id, callback) => {
    db.query('DELETE FROM products WHERE id = ?', [id], callback);
};
