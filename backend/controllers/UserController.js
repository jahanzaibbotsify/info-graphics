const User = require('../models/User');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

class UserController {
  static async register(req, res) {
    try {
      const { email, password, name } = req.body;
      if (!email || !password || !name) {
        return res.status(400).json({ error: 'Email, password, and name are required.' });
      }
      
      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(409).json({ error: 'Email already exists.' });
      }
      
      const ip = req.ip || req.connection.remoteAddress;
      
      const user = await User.create({ 
        email, 
        password, 
        name,
        ip
      });
      
      res.status(201).json({ message: 'User registered successfully.' });
    } catch (err) {
      console.error('Registration error:', err);
      res.status(500).json({ error: 'Registration failed.' });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
      }
      
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials.' });
      }
      
      const match = await User.comparePassword(password, user.password);
      if (!match) {
        return res.status(401).json({ error: 'Invalid credentials.' });
      }
      
      const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ token, user: { email: user.email, name: user.name } });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ error: 'Login failed.' });
    }
  }

  static async logout(req, res) {
    // For JWT, logout is handled on the client by deleting the token
    res.json({ message: 'Logged out.' });
  }
}

module.exports = UserController;
