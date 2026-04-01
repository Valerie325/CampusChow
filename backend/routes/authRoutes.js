const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// register (legacy)
router.post("/register", async (req, res) => {
  try {
    const hashed = await bcrypt.hash(req.body.password, 10);
    const user = new User({ 
      fullName: req.body.fullName || req.body.name,
      email: req.body.email, 
      password: hashed,
      phone: req.body.phone
    });
    await user.save();
    res.json({ success: true, user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// signup (new endpoint for sign-up page)
router.post("/signup", async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({ 
      fullName, 
      email, 
      phone,
      password: hashed
    });

    await user.save();

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "secret");

    res.json({ 
      success: true, 
      message: "Account created successfully",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone
      },
      token 
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(400).json({ success: false, message: error.message });
  }
});

// login
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const valid = await bcrypt.compare(req.body.password, user.password);
    if (!valid) return res.status(400).json({ message: "Wrong password" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "secret");
    res.json({ success: true, user, token });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Google signup
router.post("/google-signup", async (req, res) => {
  try {
    const { token } = req.body;

    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    // Check if user exists
    let user = await User.findOne({ email });

    if (user) {
      // Update Google ID if not set
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
    } else {
      // Create new user from Google data
      user = new User({
        fullName: name,
        email,
        googleId,
        avatar: picture
      });
      await user.save();
    }

    // Generate token
    const authToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "secret");

    res.json({ 
      success: true, 
      message: "Signed up with Google successfully",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        avatar: user.avatar
      },
      token: authToken 
    });
  } catch (error) {
    console.error("Google signup error:", error);
    res.status(400).json({ success: false, message: "Google authentication failed" });
  }
});

module.exports = router;