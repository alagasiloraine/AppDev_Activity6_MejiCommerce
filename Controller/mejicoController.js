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
    notFound: (req, res) => {
        res.render('notFound');
    }
};

module.exports = mejicoController;
