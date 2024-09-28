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
router.get('/blog', mejicoController.blog); // Move blog to its own route
router.get('/notFound', mejicoController.notFound); // Move home to its own route

module.exports = router;
