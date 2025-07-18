const Infographic = require('../models/Infographic');
const { generateInfographic, downloadAndSaveImage, analyzeMessageForModification, generateConversationalResponse } = require('../openAiClient');
const path = require('path');
const fs = require('fs'); // Added fs module for file deletion

// Helper function to check if message is related to infographics
function isInfographicRelated(message, infographic) {
  const messageLower = message.toLowerCase();
  
  // Strict off-topic keywords that should be immediately rejected
  const offTopicKeywords = [
    'pizza', 'food', 'restaurant', 'cooking', 'recipe', 'car', 'vehicle', 'driving',
    'weather', 'sports', 'movie', 'music', 'game', 'travel', 'shopping', 'fashion',
    'politics', 'news', 'celebrity', 'entertainment', 'animal', 'pet', 'joke', 'story'
  ];
  
  // Check for strict off-topic keywords
  const hasOffTopicKeywords = offTopicKeywords.some(keyword => 
    messageLower.includes(keyword)
  );
  
  if (hasOffTopicKeywords) {
    return false;
  }
  
  const infographicKeywords = [
    'chart', 'graph', 'data', 'statistics', 'infographic', 'visualization', 'diagram',
    'number', 'percent', 'metric', 'analysis', 'report', 'dashboard', 'trend',
    'color', 'title', 'section', 'layout', 'design', 'modify', 'change', 'update',
    'add', 'remove', 'edit', 'alter', 'adjust', 'improve', 'enhance', 'diabetes',
    'health', 'medical', 'wellness', 'disease', 'treatment', 'symptoms', 'healthcare'
  ];
  
  const messageWords = messageLower.split(' ');
  const infographicTopic = infographic.userInfo.toLowerCase();
  
  // Check if message contains infographic-related keywords
  const hasInfographicKeywords = infographicKeywords.some(keyword => 
    messageWords.includes(keyword) || messageLower.includes(keyword)
  );
  
  // Check if message relates to the infographic topic
  const topicWords = infographicTopic.split(' ');
  const hasTopicRelation = topicWords.some(word => 
    word.length > 3 && messageWords.includes(word.toLowerCase())
  );
  
  return hasInfographicKeywords || hasTopicRelation;
}

class InfographicController {
  static async generateInfographic(req, res) {
    try {
      const { userInfo, title } = req.body;
      
      if (!userInfo) {
        return res.status(400).json({ error: 'User information is required' });
      }

      // Generate infographic image using DALL-E
      const result = await generateInfographic(userInfo);
      
      // Extract title from user input or use default
      let extractedTitle = title || 'Generated Infographic';
      
      // Create a more descriptive title based on the user input
      if (!title && userInfo) {
        const words = userInfo.split(' ').slice(0, 5); // Take first 5 words
        extractedTitle = words.join(' ') + (words.length >= 5 ? '...' : '');
      }

      // Download and save image locally
      const timestamp = Date.now();
      const imageFilename = `infographic_${timestamp}.png`;
      
      const imageResult = await downloadAndSaveImage(result.imageUrl, imageFilename);

      if (!imageResult.success) {
        console.error('Image download failed:', imageResult.error);
        return res.status(500).json({ error: 'Failed to save generated image' });
      }

      // Save to database with image information
      const savedInfographic = await Infographic.create({
        userInfo,
        title: extractedTitle,
        description: userInfo, // Store original prompt as description
        imageFilename: imageFilename,
        imagePath: imageResult.imagePath,
        originalImageUrl: result.imageUrl // Store original DALL-E URL for potential re-editing
      });

      const response = {
        message: 'Infographic generated successfully',
        data: {
          id: savedInfographic._id,
          title: savedInfographic.title,
          userInfo: savedInfographic.userInfo,
          createdAt: savedInfographic.created_at,
          imageGenerated: true,
          imageFilename: imageFilename,
          imageUrl: `/generated-images/${imageFilename}`
        }
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Error generating infographic:', error);
      res.status(500).json({ 
        error: error.message || 'Failed to generate infographic' 
      });
    }
  }

  static async getAllInfographics(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = 20;
      const skip = (page - 1) * limit;
      const finalized = req.query.finalized; // Filter for finalized infographics
      
      let allInfographics = await Infographic.find({});
      
      // Filter for finalized infographics if requested
      if (finalized === 'true') {
        allInfographics = allInfographics.filter(infographic => infographic.finalized === true);
      }
      
      const totalInfographics = allInfographics.length;
      const totalPages = Math.ceil(totalInfographics / limit);
      
      // Sort by created_at descending (newest first) then apply manual pagination
      const sortedInfographics = allInfographics.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      const infographics = sortedInfographics.slice(skip, skip + limit);
      
      const formattedInfographics = infographics.map(infographic => ({
        id: infographic._id,
        title: infographic.title,
        userInfo: infographic.userInfo,
        description: infographic.description || infographic.userInfo, // Include description
        createdAt: infographic.created_at,
        imageFilename: infographic.imageFilename,
        imageUrl: infographic.imageFilename ? `/generated-images/${infographic.imageFilename}` : null,
        finalized: infographic.finalized || false,
        finalizedAt: infographic.finalizedAt
      }));
      
      res.json({
        infographics: formattedInfographics,
        pagination: {
          currentPage: page,
          totalPages,
          totalInfographics,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      });
    } catch (error) {
      console.error('Error fetching infographics:', error);
      res.status(500).json({ error: 'Failed to fetch infographics' });
    }
  }

  static async searchInfographics(req, res) {
    try {
      const searchQuery = req.query.q;
      const page = parseInt(req.query.page) || 1;
      const limit = 20;
      const skip = (page - 1) * limit;
      const finalized = req.query.finalized; // Filter for finalized infographics
      
      if (!searchQuery) {
        return res.status(400).json({ error: 'Search query is required' });
      }
      
      // Search in both userInfo and title
      let allInfographics = await Infographic.find({});
      let filteredInfographics = allInfographics.filter(infographic => 
        infographic.userInfo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        infographic.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      // Filter for finalized infographics if requested
      if (finalized === 'true') {
        filteredInfographics = filteredInfographics.filter(infographic => infographic.finalized === true);
      }
      
      const totalInfographics = filteredInfographics.length;
      const totalPages = Math.ceil(totalInfographics / limit);
      
      // Manual pagination
      const infographics = filteredInfographics.slice(skip, skip + limit);
      
      const formattedInfographics = infographics.map(infographic => ({
        id: infographic._id,
        title: infographic.title,
        userInfo: infographic.userInfo,
        description: infographic.description || infographic.userInfo, // Include description
        createdAt: infographic.created_at,
        imageFilename: infographic.imageFilename,
        imageUrl: infographic.imageFilename ? `/generated-images/${infographic.imageFilename}` : null,
        finalized: infographic.finalized || false,
        finalizedAt: infographic.finalizedAt
      }));
      
      res.json({
        infographics: formattedInfographics,
        pagination: {
          currentPage: page,
          totalPages,
          totalInfographics,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      });
    } catch (error) {
      console.error('Error searching infographics:', error);
      res.status(500).json({ error: 'Failed to search infographics' });
    }
  }

  static async getInfographicById(req, res) {
    try {
      const { id } = req.params;
      const infographic = await Infographic.findById(id);
      
      if (!infographic) {
        return res.status(404).json({ error: 'Infographic not found' });
      }
      
      res.json({
        id: infographic._id,
        title: infographic.title,
        userInfo: infographic.userInfo,
        description: infographic.description || infographic.userInfo, // Include description
        createdAt: infographic.created_at,
        imageFilename: infographic.imageFilename,
        imageUrl: infographic.imageFilename ? `/generated-images/${infographic.imageFilename}` : null,
        finalized: infographic.finalized || false,
        finalizedAt: infographic.finalizedAt
      });
    } catch (error) {
      console.error('Error fetching infographic:', error);
      res.status(500).json({ error: 'Failed to fetch infographic' });
    }
  }

  static async updateInfographic(req, res) {
    try {
      const { id } = req.params;
      const { updatePrompt } = req.body;
      
      if (!updatePrompt) {
        return res.status(400).json({ error: 'Update prompt is required' });
      }

      // Find the existing infographic
      const existingInfographic = await Infographic.findById(id);
      if (!existingInfographic) {
        return res.status(404).json({ error: 'Infographic not found' });
      }

      // Generate updated infographic using image-to-image or context-based generation
      let existingImagePath = null;
      if (existingInfographic.imagePath && fs.existsSync(existingInfographic.imagePath)) {
        existingImagePath = existingInfographic.imagePath;
      }

      // Create context for the update
      const contextualPrompt = `Original request: ${existingInfographic.userInfo}\n\nUpdate request: ${updatePrompt}`;
      
      const result = await generateInfographic(contextualPrompt, existingImagePath);
      
      // Download and save the updated image
      const timestamp = Date.now();
      const imageFilename = `infographic_${timestamp}.png`;
      
      const imageResult = await downloadAndSaveImage(result.imageUrl, imageFilename);

      if (!imageResult.success) {
        console.error('Image download failed:', imageResult.error);
        return res.status(500).json({ error: 'Failed to save updated image' });
      }

      // Delete old image if it exists
      if (existingInfographic.imageFilename) {
        const oldImagePath = path.join(__dirname, '..', 'generated-images', existingInfographic.imageFilename);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      // Update the infographic in database
      const updatedInfographic = await Infographic.findByIdAndUpdate(
        id,
        {
          imageFilename: imageFilename,
          imagePath: imageResult.imagePath,
          originalImageUrl: result.imageUrl,
          updated_at: new Date()
        },
        { new: true } // Return the updated document
      );

      if (!updatedInfographic) {
        throw new Error('Failed to update infographic in database');
      }

      const response = {
        message: 'Infographic updated successfully',
        data: {
          id: updatedInfographic._id,
          title: updatedInfographic.title,
          userInfo: updatedInfographic.userInfo,
          updatedAt: updatedInfographic.updated_at,
          imageGenerated: true,
          imageFilename: imageFilename,
          imageUrl: `/generated-images/${imageFilename}`
        }
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Error updating infographic:', error);
      res.status(500).json({ 
        error: error.message || 'Failed to update infographic' 
      });
    }
  }

  static async downloadImage(req, res) {
    try {
      const { filename } = req.params;
      const imagePath = path.join(__dirname, '..', 'generated-images', filename);
      
      if (!require('fs').existsSync(imagePath)) {
        return res.status(404).json({ error: 'Image not found' });
      }
      
      res.download(imagePath, filename, (err) => {
        if (err) {
          console.error('Error downloading image:', err);
          res.status(500).json({ error: 'Failed to download image' });
        }
      });
    } catch (error) {
      console.error('Error in downloadImage:', error);
      res.status(500).json({ error: 'Failed to download image' });
    }
  }

  static async getImage(req, res) {
    try {
      const { filename } = req.params;
      const imagePath = path.join(__dirname, '..', 'generated-images', filename);
      
      if (!require('fs').existsSync(imagePath)) {
        return res.status(404).json({ error: 'Image not found' });
      }
      
      res.sendFile(imagePath);
    } catch (error) {
      console.error('Error serving image:', error);
      res.status(500).json({ error: 'Failed to serve image' });
    }
  }

  static async deleteInfographic(req, res) {
    try {
      const { id } = req.params;
      const infographic = await Infographic.findById(id);
      
      if (!infographic) {
        return res.status(404).json({ error: 'Infographic not found' });
      }

      // Delete associated image file if it exists
      if (infographic.imageFilename) {
        const imagePath = path.join(__dirname, '..', 'generated-images', infographic.imageFilename);
        if (require('fs').existsSync(imagePath)) {
          require('fs').unlinkSync(imagePath);
        }
      }

      const deleted = await Infographic.findByIdAndDelete(id);
      
      res.json({ message: 'Infographic deleted successfully' });
    } catch (error) {
      console.error('Error deleting infographic:', error);
      res.status(500).json({ error: 'Failed to delete infographic' });
    }
  }

  static async chatGenerateInfographic(req, res) {
    try {
      const { userInfo, chatHistory } = req.body;
      
      if (!userInfo) {
        return res.status(400).json({ error: 'User information is required' });
      }

      // Check if there are existing images in the chat history
      let existingInfographic = null;
      let isUpdate = false;
      
      if (chatHistory && chatHistory.length > 0) {
        // Find the most recent image in the chat history
        for (let i = chatHistory.length - 1; i >= 0; i--) {
          if (chatHistory[i].infographic && chatHistory[i].infographic.id) {
            existingInfographic = await Infographic.findById(chatHistory[i].infographic.id);
            if (existingInfographic) {
              isUpdate = true;
              break;
            }
          }
        }
      }

      let enhancedPrompt = userInfo;
      let result;
      let savedInfographic;
      let extractedTitle;
      
      if (isUpdate && existingInfographic) {
        // This is an iteration/modification - create NEW infographic to preserve chat history
        console.log('Creating new iteration based on existing infographic:', existingInfographic._id);
        
        // Create enhanced prompt for modification
        const context = chatHistory.slice(-5).map(msg => `${msg.role}: ${msg.content}`).join('\n');
        enhancedPrompt = `Previous conversation context:\n${context}\n\nOriginal infographic: ${existingInfographic.userInfo}\n\nCurrent modification request: ${userInfo}`;
        
        // Generate updated infographic using existing image as reference
        let existingImagePath = null;
        if (existingInfographic.imagePath && fs.existsSync(existingInfographic.imagePath)) {
          existingImagePath = existingInfographic.imagePath;
        }

        try {
          result = await generateInfographic(enhancedPrompt, existingImagePath);
        } catch (error) {
          if (error.message.includes('specialize in creating factual data visualizations')) {
            return res.status(400).json({ 
              error: 'I specialize in creating factual data visualizations and infographics. Please provide requests related to statistics, data analysis, business metrics, health data, technology trends, or other factual information that can be visualized. Generic requests like recipes, entertainment, or unrelated topics are outside my expertise.',
              type: 'invalid_request'
            });
          }
          throw error;
        }
        
        // Use existing title or create new one
        extractedTitle = existingInfographic.title;
        if (userInfo.toLowerCase().includes('title') || userInfo.toLowerCase().includes('name')) {
          const words = userInfo.split(' ').slice(0, 5);
          extractedTitle = words.join(' ') + (words.length >= 5 ? '...' : '');
        }

        // Download and save new image
        const timestamp = Date.now();
        const imageFilename = `chat_iteration_${timestamp}.png`;
        
        const imageResult = await downloadAndSaveImage(result.imageUrl, imageFilename);

        if (imageResult.success) {
          // Create NEW infographic record to preserve chat history
          savedInfographic = await Infographic.create({
            userInfo: enhancedPrompt,
            title: extractedTitle,
            imageFilename: imageFilename,
            imagePath: imageResult.imagePath,
            originalImageUrl: result.imageUrl,
            description: userInfo, // Use the modification request as description
            finalized: false,
            isIteration: true,
            originalInfographicId: existingInfographic._id,
            created_at: new Date(),
            updated_at: new Date()
          });
        } else {
          throw new Error('Failed to save updated image');
        }
        
      } else {
        // This is a new infographic generation
        console.log('Creating new infographic');
        
        // If there's chat history, consider context for better generation
        if (chatHistory && chatHistory.length > 0) {
          const context = chatHistory.slice(-3).map(msg => `${msg.role}: ${msg.content}`).join('\n');
          enhancedPrompt = `Previous conversation context:\n${context}\n\nCurrent request: ${userInfo}`;
        }

        // Generate new infographic
        try {
          result = await generateInfographic(enhancedPrompt);
        } catch (error) {
          if (error.message.includes('specialize in creating factual data visualizations')) {
            return res.status(400).json({ 
              error: 'I specialize in creating factual data visualizations and infographics. Please provide requests related to statistics, data analysis, business metrics, health data, technology trends, or other factual information that can be visualized. Generic requests like recipes, entertainment, or unrelated topics are outside my expertise.',
              type: 'invalid_request'
            });
          }
          throw error;
        }
        
        // Create title from user input
        extractedTitle = 'Generated Infographic';
        if (userInfo) {
          const words = userInfo.split(' ').slice(0, 5);
          extractedTitle = words.join(' ') + (words.length >= 5 ? '...' : '');
        }

        // Download and save image
        const timestamp = Date.now();
        const imageFilename = `chat_infographic_${timestamp}.png`;
        
        const imageResult = await downloadAndSaveImage(result.imageUrl, imageFilename);

        if (!imageResult.success) {
          console.error('Image download failed:', imageResult.error);
          throw new Error('Failed to save generated image');
        }

        // Save new infographic to database
        savedInfographic = await Infographic.create({
          userInfo: enhancedPrompt,
          title: extractedTitle,
          description: userInfo, // Store original user prompt as description
          imageFilename: imageFilename,
          imagePath: imageResult.imagePath,
          originalImageUrl: result.imageUrl
        });
      }

      const response = {
        message: isUpdate ? 'Infographic iteration created successfully' : 'Infographic generated successfully',
        isUpdate: isUpdate,
        data: {
          id: savedInfographic._id,
          title: savedInfographic.title,
          userInfo: userInfo, // Return original user info, not enhanced prompt
          createdAt: savedInfographic.created_at,
          imageGenerated: true,
          imageFilename: savedInfographic.imageFilename,
          imageUrl: `/generated-images/${savedInfographic.imageFilename}`,
          isIteration: savedInfographic.isIteration || false,
          originalInfographicId: savedInfographic.originalInfographicId || null
        }
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Error generating/updating chat infographic:', error);
      res.status(500).json({ 
        error: error.message || 'Failed to generate/update infographic' 
      });
    }
  }

  static async chatWithInfographic(req, res) {
    try {
      const { id } = req.params;
      const { message, chatHistory } = req.body;
      
      if (!message || !message.trim()) {
        return res.status(400).json({ error: 'Message is required' });
      }

      // Find the existing infographic
      const existingInfographic = await Infographic.findById(id);
      if (!existingInfographic) {
        return res.status(404).json({ error: 'Infographic not found' });
      }

      // Create chat context from history
      const chatContext = chatHistory ? chatHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      })) : [];

      // First check if message is related to infographics at all
      if (!isInfographicRelated(message, existingInfographic)) {
        return res.json({
          message: "I can only help with factual data and infographic modifications. Please ask questions about your infographic data or request specific changes to your visualization.",
          isModifying: false
        });
      }

      // Analyze the message to determine if it's a modification request
      const messageAnalysis = await analyzeMessageForModification(message, chatContext);
      
      // Handle different analysis results
      if (messageAnalysis === 'invalid') {
        return res.json({
          message: "I can only help with factual data and infographic modifications. Please ask questions about your infographic data or request specific changes to your visualization.",
          isModifying: false
        });
      }

      if (messageAnalysis === 'modify') {
        // Generate updated infographic using image-to-image generation
        let existingImagePath = null;
        if (existingInfographic.imagePath && fs.existsSync(existingInfographic.imagePath)) {
          existingImagePath = existingInfographic.imagePath;
        }

        const contextualPrompt = `Original request: ${existingInfographic.userInfo}\n\nModification request: ${message}`;
        
        const result = await generateInfographic(contextualPrompt, existingImagePath);
        
        // Download and save updated image
        const timestamp = Date.now();
        const imageFilename = `infographic_${timestamp}.png`;
        
        const imageResult = await downloadAndSaveImage(result.imageUrl, imageFilename);

        if (!imageResult.success) {
          throw new Error('Failed to save updated image');
        }

        // Delete old image if it exists
        if (existingInfographic.imageFilename) {
          const oldImagePath = path.join(__dirname, '..', 'generated-images', existingInfographic.imageFilename);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }

        // Update the infographic in database
        const updatedInfographic = await Infographic.findByIdAndUpdate(
          id,
          {
            imageFilename: imageFilename,
            imagePath: imageResult.imagePath,
            originalImageUrl: result.imageUrl,
            updated_at: new Date()
          },
          { new: true }
        );

        res.json({
          message: "I've updated your infographic based on your request. Please check the preview to see the changes!",
          isModifying: true,
          updatedInfographic: {
            id: updatedInfographic._id,
            title: updatedInfographic.title,
            userInfo: updatedInfographic.userInfo,
            imageFilename: updatedInfographic.imageFilename,
            imageUrl: updatedInfographic.imageFilename ? `/generated-images/${updatedInfographic.imageFilename}` : null,
            updatedAt: updatedInfographic.updated_at
          }
        });
      } else if (messageAnalysis === 'factual') {
        // Generate factual response without modifying the infographic
        const conversationalResponse = await generateConversationalResponse(message, chatContext, existingInfographic);
        
        res.json({
          message: conversationalResponse,
          isModifying: false
        });
      } else {
        // Default case - should not reach here but handle gracefully
        res.json({
          message: "I can only help with factual data and infographic modifications. Please ask questions about your infographic data or request specific changes to your visualization.",
          isModifying: false
        });
      }
    } catch (error) {
      console.error('Error in chat with infographic:', error);
      res.status(500).json({ 
        error: error.message || 'Failed to process chat message' 
      });
    }
  }

  static async finalizeInfographic(req, res) {
    try {
      const { id } = req.params;
      
      // Find the infographic
      const infographic = await Infographic.findById(id);
      if (!infographic) {
        return res.status(404).json({ error: 'Infographic not found' });
      }

      // Check if already finalized
      if (infographic.finalized) {
        return res.status(400).json({ error: 'Infographic is already finalized' });
      }

      // Finalize the infographic
      const finalizedInfographic = await Infographic.finalize(id);
      
      // Clean up non-finalized iterations to reduce clutter
      // Find and remove iterations that weren't finalized
      if (infographic.isIteration) {
        // If finalizing an iteration, remove other iterations of the same original
        const iterations = await Infographic.find({ 
          originalInfographicId: infographic.originalInfographicId,
          finalized: false,
          _id: { $ne: id } // Don't delete the one we just finalized
        });
        
        for (const iteration of iterations) {
          // Delete the image file
          if (iteration.imageFilename) {
            const imagePath = path.join(__dirname, '..', 'generated-images', iteration.imageFilename);
            if (fs.existsSync(imagePath)) {
              fs.unlinkSync(imagePath);
            }
          }
          // Delete from database
          await Infographic.findByIdAndDelete(iteration._id);
        }
      } else {
        // If finalizing an original, remove its iterations
        const iterations = await Infographic.find({ 
          originalInfographicId: id,
          finalized: false
        });
        
        for (const iteration of iterations) {
          // Delete the image file
          if (iteration.imageFilename) {
            const imagePath = path.join(__dirname, '..', 'generated-images', iteration.imageFilename);
            if (fs.existsSync(imagePath)) {
              fs.unlinkSync(imagePath);
            }
          }
          // Delete from database
          await Infographic.findByIdAndDelete(iteration._id);
        }
      }
      
      res.json({
        message: 'Infographic finalized successfully',
        data: {
          id: finalizedInfographic._id,
          title: finalizedInfographic.title,
          description: finalizedInfographic.description,
          imageUrl: finalizedInfographic.imageFilename ? `/generated-images/${finalizedInfographic.imageFilename}` : null,
          finalized: finalizedInfographic.finalized,
          finalizedAt: finalizedInfographic.finalizedAt
        }
      });
    } catch (error) {
      console.error('Error finalizing infographic:', error);
      res.status(500).json({ 
        error: error.message || 'Failed to finalize infographic' 
      });
    }
  }
}

module.exports = InfographicController; 