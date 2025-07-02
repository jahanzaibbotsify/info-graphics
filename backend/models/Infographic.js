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
      imageFilename: data.imageFilename || null,
      imagePath: data.imagePath || null
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
}

module.exports = Infographic; 