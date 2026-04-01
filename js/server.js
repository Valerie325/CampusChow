// backend/server.js

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors()); // Allow frontend requests
app.use(bodyParser.json()); // Parse JSON body

// Temporary in-memory user storage
const users = [];

// Signup route
app.post('/api/auth/signup', (req, res) => {
  const { fullName, email, phone, password } = req.body;

  // Basic validation
  if (!fullName || !email || !phone || !password) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  // Check if email already exists
  const existingUser = users.find(user => user.email === email);
  if (existingUser) {
    return res.status(400).json({ success: false, message: 'Email already registered' });
  }

  // Save user
  const newUser = { fullName, email, phone, password }; // For now, plain text
  users.push(newUser);

  console.log('Users:', users); // For debugging
  return res.json({ success: true, message: 'Signup successful' });
});

// Login route
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  // Create a simple token (for demo purposes)
  const token = btoa(`${email}:${password}`);

  return res.json({
    success: true,
    message: 'Login successful',
    token,
    user: { fullName: user.fullName, email: user.email, phone: user.phone }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});