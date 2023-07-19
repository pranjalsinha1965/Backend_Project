const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('C:/Users/KIIT/Desktop/Rest-Api-Express-MongoDB/models/user/user.js'); // Assuming you have a User model
const secretKey = 'your-secret-key'; // Replace with your own secret key

// Endpoint: Sign up
router.post('/api/signup', async (req, res) => {
  const { name, email, password, phone_number } = req.body;

  // Perform validation
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  try {
    // Check if user with the same email already exists in the database
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    // Encrypt the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phone_number
    });

    // Save the user to the database
    await newUser.save();

    res.status(200).json({
      success: true,
      message: 'Signed up successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// Endpoint: Sign in
router.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user in the database
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }

    // Compare the provided password with the stored hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }

    // Generate a JWT token
    const token = jwt.sign({ userId: user._id }, secretKey);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// Endpoint: Edit or Add Phone Number
router.put('/api/edit/phonenumber', authenticateToken, async (req, res) => {
  const { phone_number } = req.body;
  const { userId } = req.user; // Extracted from the token during authentication

  try {
    // Find the user in the database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Update or add the phone number
    user.phone_number = phone_number;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Phone number changed / added successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// Middleware: Authenticate Token
function authenticateToken(req, res, next) {
  const authToken = req.headers.authorization;

  if (!authToken) {
    return res.status(401).json({ success: false, message: 'Authentication token missing' });
  }

  jwt.verify(authToken, secretKey, (error, user) => {
    if (error) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    req.user = user;
    next();
  });
}

module.exports = router;
