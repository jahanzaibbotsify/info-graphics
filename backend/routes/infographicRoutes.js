const express = require('express');
const router = express.Router();
const InfographicController = require('../controllers/InfographicController');
const { rateLimiter } = require('../rateLimiter');
const auth = require('../middleware/auth');

router.get('/infographics', InfographicController.getAllInfographics);
router.get('/infographics/search', InfographicController.searchInfographics);
router.get('/infographics/:id', InfographicController.getInfographicById);
router.post('/generate-infographic', rateLimiter, InfographicController.generateInfographic);
router.put('/infographics/:id', auth, InfographicController.updateInfographic);
router.delete('/infographics/:id', InfographicController.deleteInfographic);

// Image routes
router.get('/images/:filename', InfographicController.getImage);
router.get('/download/:filename', InfographicController.downloadImage);

module.exports = router; 