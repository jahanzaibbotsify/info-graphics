const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class LocalStorage {
  constructor() {
    this.dataDir = path.join(__dirname, '..', 'data');
    this.ensureDataDir();
    this.initializeCollections();
  }

  ensureDataDir() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  initializeCollections() {
    const collections = ['users', 'plans', 'subscriptions', 'infographics'];
    collections.forEach(collection => {
      const filePath = path.join(this.dataDir, `${collection}.json`);
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify([], null, 2));
      }
    });
  }

  generateId() {
    return crypto.randomBytes(12).toString('hex');
  }

  readCollection(collectionName) {
    try {
      const filePath = path.join(this.dataDir, `${collectionName}.json`);
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error reading ${collectionName}:`, error);
      return [];
    }
  }

  writeCollection(collectionName, data) {
    try {
      const filePath = path.join(this.dataDir, `${collectionName}.json`);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error(`Error writing ${collectionName}:`, error);
      return false;
    }
  }

  create(collectionName, item) {
    const collection = this.readCollection(collectionName);
    const newItem = {
      ...item,
      _id: this.generateId(),
      created_at: new Date(),
      updated_at: new Date()
    };
    collection.push(newItem);
    this.writeCollection(collectionName, collection);
    return newItem;
  }

  findOne(collectionName, query) {
    const collection = this.readCollection(collectionName);
    return collection.find(item => {
      return Object.keys(query).every(key => item[key] === query[key]);
    });
  }

  findById(collectionName, id) {
    const collection = this.readCollection(collectionName);
    return collection.find(item => item._id === id);
  }

  find(collectionName, query = {}) {
    const collection = this.readCollection(collectionName);
    if (Object.keys(query).length === 0) {
      return collection;
    }
    return collection.filter(item => {
      return Object.keys(query).every(key => item[key] === query[key]);
    });
  }

  updateOne(collectionName, query, update) {
    const collection = this.readCollection(collectionName);
    const index = collection.findIndex(item => {
      return Object.keys(query).every(key => item[key] === query[key]);
    });
    
    if (index !== -1) {
      collection[index] = {
        ...collection[index],
        ...update,
        updated_at: new Date()
      };
      this.writeCollection(collectionName, collection);
      return collection[index];
    }
    return null;
  }

  deleteOne(collectionName, query) {
    const collection = this.readCollection(collectionName);
    const index = collection.findIndex(item => {
      return Object.keys(query).every(key => item[key] === query[key]);
    });
    
    if (index !== -1) {
      const deleted = collection.splice(index, 1)[0];
      this.writeCollection(collectionName, collection);
      return deleted;
    }
    return null;
  }
}

module.exports = new LocalStorage();
