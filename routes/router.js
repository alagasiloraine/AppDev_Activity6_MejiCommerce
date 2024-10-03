const express = require('express');
const router = express.Router();
const mejicoController = require('../Controller/mejicoController.js');

router.get('/', mejicoController.home);
router.get('/about', mejicoController.about);
router.get('/contact', mejicoController.contact);
router.get('/testimonial', mejicoController.testimonial); 
router.get('/feature', mejicoController.feature); 
router.get('/product', mejicoController.product); 
router.get('/howtouse', mejicoController.howtouse); 
router.get('/blog', mejicoController.blog); 
router.get('/notFound', mejicoController.notFound);

module.exports = router;
