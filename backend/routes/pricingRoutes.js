const express = require('express');
const router = express.Router();
const PricingController = require('../controllers/PricingController');

router.get('/api/plans', PricingController.getAllPlans);

module.exports = router; 