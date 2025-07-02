const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/PaymentController');
const auth = require('../middleware/auth');

// Create checkout session
router.post('/create-checkout-session', auth, PaymentController.createCheckoutSession);

module.exports = router; 