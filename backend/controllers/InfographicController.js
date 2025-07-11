const Infographic = require('../models/Infographic');
const { generateInfographic } = require('../openAiClient');
const htmlToImageService = require('../services/htmlToImageService');
const path = require('path');
const fs = require('fs'); // Added fs module for file deletion

class InfographicController {
  static async generateInfographic(req, res) {
    try {
      const { userInfo, title } = req.body;
      
      if (!userInfo) {
        return res.status(400).json({ error: 'User information is required' });
      }

      // Generate infographic using OpenAI
      const htmlContent = await generateInfographic(userInfo);
      
      // Extract title from the generated HTML if not provided
      let extractedTitle = title;
      if (!extractedTitle) {
        const titleMatch = htmlContent.match(/<h1[^>]*class="title"[^>]*>([^<]+)<\/h1>/);
        extractedTitle = titleMatch ? titleMatch[1].replace(/\[|\]/g, '') : 'Generated Infographic';
      }

      // Convert HTML to image
      const timestamp = Date.now();
      const imageFilename = `infographic_${timestamp}.png`;
      
      // Get template-specific options for image generation
      const imageOptions = htmlToImageService.getTemplateOptions('default');
      
      const imageResult = await htmlToImageService.convertAndSave(
        htmlContent, 
        imageFilename, 
        imageOptions
      );

      if (!imageResult.success) {
        console.error('Image generation failed:', imageResult.error);
        // Continue without image if generation fails
      }

      // Save to database with image information
      const savedInfographic = await Infographic.create({
        userInfo,
        htmlContent,
        title: extractedTitle,
        imageFilename: imageResult.success ? imageFilename : null,
        imagePath: imageResult.success ? imageResult.imagePath : null
      });

      const response = {
        message: 'Infographic generated successfully',
        data: {
          id: savedInfographic._id,
          htmlContent: savedInfographic.htmlContent,
          title: savedInfographic.title,
          userInfo: savedInfographic.userInfo,
          createdAt: savedInfographic.created_at,
          imageGenerated: imageResult.success
        }
      };

      // Add image data if generation was successful
      if (imageResult.success) {
        response.data.imageFilename = imageFilename;
        response.data.imageUrl = `/images/${imageFilename}`;
      }

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
      
      const allInfographics = await Infographic.find({});
      const totalInfographics = allInfographics.length;
      const totalPages = Math.ceil(totalInfographics / limit);
      
      // Sort by created_at descending (newest first) then apply manual pagination
      const sortedInfographics = allInfographics.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      const infographics = sortedInfographics.slice(skip, skip + limit);
      
      const formattedInfographics = infographics.map(infographic => ({
        id: infographic._id,
        title: infographic.title,
        userInfo: infographic.userInfo,
        htmlContent: infographic.htmlContent,
        createdAt: infographic.created_at,
        imageFilename: infographic.imageFilename,
        imageUrl: infographic.imageFilename ? `/images/${infographic.imageFilename}` : null
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
      
      if (!searchQuery) {
        return res.status(400).json({ error: 'Search query is required' });
      }
      
      // Search in both userInfo and title
      const allInfographics = await Infographic.find({});
      const filteredInfographics = allInfographics.filter(infographic => 
        infographic.userInfo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        infographic.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      const totalInfographics = filteredInfographics.length;
      const totalPages = Math.ceil(totalInfographics / limit);
      
      // Manual pagination
      const infographics = filteredInfographics.slice(skip, skip + limit);
      
      const formattedInfographics = infographics.map(infographic => ({
        id: infographic._id,
        title: infographic.title,
        userInfo: infographic.userInfo,
        htmlContent: infographic.htmlContent,
        createdAt: infographic.created_at,
        imageFilename: infographic.imageFilename,
        imageUrl: infographic.imageFilename ? `/images/${infographic.imageFilename}` : null
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
        htmlContent: infographic.htmlContent,
        createdAt: infographic.created_at,
        imageFilename: infographic.imageFilename,
        imageUrl: infographic.imageFilename ? `/images/${infographic.imageFilename}` : null
      });
    } catch (error) {
      console.error('Error fetching infographic:', error);
      res.status(500).json({ error: 'Failed to fetch infographic' });
    }
  }

  static async updateInfographic(req, res) {
    try {
      const { id } = req.params;
      const { updatePrompt, imageOptions } = req.body;
      
      if (!updatePrompt) {
        return res.status(400).json({ error: 'Update prompt is required' });
      }

      // Find the existing infographic
      const existingInfographic = await Infographic.findById(id);
      if (!existingInfographic) {
        return res.status(404).json({ error: 'Infographic not found' });
      }

      // Generate updated infographic using OpenAI with existing HTML and update prompt
      const updatedHtmlContent = await generateInfographic(updatePrompt, existingInfographic.htmlContent);
      
      // Convert updated HTML to image
      const timestamp = Date.now();
      const imageFilename = `infographic_${timestamp}.png`;
      
      // Get template-specific options and merge with custom options if provided
      const templateOptions = htmlToImageService.getTemplateOptions(existingInfographic.template || 'default');
      const finalImageOptions = imageOptions ? { ...templateOptions, ...imageOptions } : templateOptions;
      
      const imageResult = await htmlToImageService.convertAndSave(
        updatedHtmlContent, 
        imageFilename, 
        finalImageOptions
      );

      if (!imageResult.success) {
        console.error('Image generation failed:', imageResult.error);
        // Continue without image if generation fails
      }

      // Delete old image if it exists
      if (existingInfographic.imageFilename) {
        const oldImagePath = path.join(__dirname, '..', 'generated-images', existingInfographic.imageFilename);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      // Update the infographic in database using findByIdAndUpdate
      const updatedInfographic = await Infographic.findByIdAndUpdate(
        id,
        {
          htmlContent: updatedHtmlContent,
          imageFilename: imageResult.success ? imageFilename : existingInfographic.imageFilename,
          imagePath: imageResult.success ? imageResult.imagePath : existingInfographic.imagePath,
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
          htmlContent: updatedInfographic.htmlContent,
          title: updatedInfographic.title,
          userInfo: updatedInfographic.userInfo,
          updatedAt: updatedInfographic.updated_at,
          imageGenerated: imageResult.success
        }
      };

      // Add image data if generation was successful
      if (imageResult.success) {
        response.data.imageFilename = imageFilename;
        response.data.imageUrl = `/images/${imageFilename}`;
      }

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
}

module.exports = InfographicController; 