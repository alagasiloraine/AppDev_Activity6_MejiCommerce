const mejicoController = {
    home: (req, res) => {
        res.render('home');
    },
    about: (req, res) => {
        res.render('about');
    },
    contact: (req, res) => {
        res.render('contact');
    },
    testimonial: (req, res) => {
        res.render('testimonial');
    },
    feature: (req, res) => {
        res.render('feature');
    },
    product: (req, res) => {
        res.render('product');
    },
    howtouse: (req, res) => {
        res.render('howtouse');
    },
    blog: (req, res) => {
        res.render('blog');
    },
    blog1: (req, res) => {
        res.render('blog1');
    },
    blog2: (req, res) => {
        res.render('blog2');
    },
    blog3: (req, res) => {
        res.render('blog3');
    },
    notFound: (req, res) => {
        res.render('notFound');
    },
    admin: (req, res) => {
        res.render('admin/admin');
    },
    order: (req, res) => {
        res.render('admin/order');
    }
};

module.exports = mejicoController;
