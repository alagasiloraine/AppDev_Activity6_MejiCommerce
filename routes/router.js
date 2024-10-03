const express = require('express');
const router = express.Router();
const mejicoController = require('../Controller/mejicoController.js');

router.get('/', mejicoController.home);
router.get('/about', mejicoController.about);
router.get('/contact', mejicoController.contact);
router.get('/testimonial', mejicoController.testimonial); // Keep only one
router.get('/feature', mejicoController.feature); // Move feature to its own route
router.get('/product', mejicoController.product); // Move product to its own route
router.get('/howtouse', mejicoController.howtouse); // Move howtouse to its own route
router.get('/blog', mejicoController.blog);
router.get('/blog1', mejicoController.blog1); 
router.get('/blog2', mejicoController.blog2);
router.get('/blog3', mejicoController.blog3);
router.get('/notFound', mejicoController.notFound); // Move home to its own route

module.exports = router;
