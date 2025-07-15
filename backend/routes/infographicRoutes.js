const express = require('express');
const router = express.Router();
const InfographicController = require('../controllers/InfographicController');
const { rateLimiter } = require('../rateLimiter');
const auth = require('../middleware/auth');

// Generate infographic route
router.post('/generate-infographic', InfographicController.generateInfographic);

// Get all infographics
router.get('/infographics', InfographicController.getAllInfographics);

// Get infographic by ID
router.get('/infographics/:id', InfographicController.getInfographicById);

// Update infographic
router.put('/infographics/:id', InfographicController.updateInfographic);

// Finalize infographic
router.post('/infographics/:id/finalize', InfographicController.finalizeInfographic);

// Delete infographic
router.delete('/infographics/:id', InfographicController.deleteInfographic);

// Search infographics
router.get('/infographics/search', InfographicController.searchInfographics);

// Chat endpoint for infographic modifications
router.post('/infographics/:id/chat', InfographicController.chatWithInfographic);

// Chat-style infographic generation
router.post('/chat/generate-infographic', InfographicController.chatGenerateInfographic);

// Image routes
router.get('/images/:filename', InfographicController.getImage);
router.get('/download/:filename', InfographicController.downloadImage);

module.exports = router; 