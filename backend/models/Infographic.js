const storage = require('../utils/localStorage');

class Infographic {
  static async create(data) {
    // Initialize infographics collection if it doesn't exist
    const infographicsFile = require('path').join(__dirname, '..', 'data', 'infographics.json');
    const fs = require('fs');
    if (!fs.existsSync(infographicsFile)) {
      fs.writeFileSync(infographicsFile, JSON.stringify([], null, 2));
    }

    const newInfographic = storage.create('infographics', {
      userInfo: data.userInfo,
      htmlContent: data.htmlContent,
      title: data.title || 'Untitled Infographic',
      description: data.description || data.userInfo || '', // Store original prompt as description
      imageFilename: data.imageFilename || null,
      imagePath: data.imagePath || null,
      finalized: data.finalized || false, // Track if infographic is finalized for explore section
      finalizedAt: data.finalized ? new Date() : null // Track when it was finalized
    });
    
    return newInfographic;
  }

  static async find(query = {}) {
    return storage.find('infographics', query);
  }

  static async findById(id) {
    return storage.findById('infographics', id);
  }

  static async findByIdAndUpdate(id, updateData) {
    return storage.updateOne('infographics', { _id: id }, updateData);
  }

  static async findByIdAndDelete(id) {
    return storage.deleteOne('infographics', { _id: id });
  }

  // Method to finalize an infographic
  static async finalize(id) {
    return storage.updateOne('infographics', { _id: id }, {
      finalized: true,
      finalizedAt: new Date()
    });
  }
}

module.exports = Infographic; 