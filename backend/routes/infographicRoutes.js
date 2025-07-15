const express = require('express');
const router = express.Router();
const InfographicController = require('../controllers/InfographicController');
const rateLimiter = require('../rateLimiter');
const { requireAuth, optionalAuth } = require('../middleware/auth');

// Create a new infographic (requires auth and rate limiting)
router.post('/generate-infographic', requireAuth, rateLimiter, InfographicController.generateInfographic);

// Chat-based infographic generation (requires auth and rate limiting)
router.post('/chat/generate-infographic', requireAuth, InfographicController.chatGenerateInfographic);

// Update an existing infographic (requires auth)
router.put('/infographics/:id', requireAuth, InfographicController.updateInfographic);

// Chat with an infographic (requires auth)
router.post('/infographics/:id/chat', requireAuth, InfographicController.chatWithInfographic);

// Finalize an infographic (requires auth)
router.post('/infographics/:id/finalize', requireAuth, InfographicController.finalizeInfographic);

// Get all infographics (optional auth for filtering user's own)
router.get('/infographics', optionalAuth, InfographicController.getAllInfographics);

// Search infographics (optional auth)
router.get('/infographics/search', optionalAuth, InfographicController.searchInfographics);

// Get a specific infographic (optional auth)
router.get('/infographics/:id', optionalAuth, InfographicController.getInfographicById);

// Delete an infographic (requires auth)
router.delete('/infographics/:id', requireAuth, InfographicController.deleteInfographic);

// Image routes
router.get('/images/:filename', InfographicController.getImage);
router.get('/download/:filename', InfographicController.downloadImage);

module.exports = router; 