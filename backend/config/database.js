const localStorage = require('../utils/localStorage');

const initializeStorage = () => {
  console.log('✅ Local storage initialized successfully!');
  return Promise.resolve();
};

module.exports = initializeStorage;
