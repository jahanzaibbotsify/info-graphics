const localStorage = require('../utils/localStorage');
const bcrypt = require('bcrypt');

class User {
  static async create(userData) {
    // Hash password before saving
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }
    
    const user = localStorage.create('users', {
      email: userData.email,
      name: userData.name,
      password: userData.password,
      ip: userData.ip || null,
      city: userData.city || null,
      stripe_id: userData.stripe_id || null,
      created_animations: userData.created_animations || 0,
      allowed_animations: userData.allowed_animations || 0
    });
    
    return user;
  }

  static async findOne(query) {
    return localStorage.findOne('users', query);
  }

  static async findById(id) {
    return localStorage.findById('users', id);
  }

  static async find(query = {}) {
    return localStorage.find('users', query);
  }

  static async updateOne(query, update) {
    return localStorage.updateOne('users', query, update);
  }

  static async deleteOne(query) {
    return localStorage.deleteOne('users', query);
  }

  static async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = User;
