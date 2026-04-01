const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function sanitizeUser(user) {
  return {
    id: user._id,
    fullName: user.fullName || user.name,
    email: user.email,
    phone: user.phone,
    avatar: user.avatar
  };
}

// register (legacy)
router.post("/register", async (req, res) => {
  try {
    const fullName = (req.body.fullName || req.body.name || "").trim();
    const email = (req.body.email || "").trim().toLowerCase();
    const phone = (req.body.phone || "").trim();
    const password = req.body.password || "";

    if (!fullName || !email || !password) {
      return res.status(400).json({ success: false, message: "Full name, email and password are required" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, message: "Please provide a valid email address" });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters long" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ 
      fullName,
      email,
      password: hashed,
      phone
    });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "secret", { expiresIn: "7d" });
    res.json({ success: true, message: "Account created successfully", user: sanitizeUser(user), token });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// signup (new endpoint for sign-up page)
router.post("/signup", async (req, res) => {
  try {
    const fullName = (req.body.fullName || "").trim();
    const email = (req.body.email || "").trim().toLowerCase();
    const phone = (req.body.phone || "").trim();
    const password = req.body.password || "";

    if (!fullName || !email || !password) {
      return res.status(400).json({ success: false, message: "Full name, email and password are required" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, message: "Please provide a valid email address" });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters long" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already registered" });
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
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "secret", { expiresIn: "7d" });

    res.json({ 
      success: true, 
      message: "Account created successfully",
      user: sanitizeUser(user),
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
    const email = (req.body.email || "").trim().toLowerCase();
    const password = req.body.password || "";

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false, message: "User not found" });

    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: "This account uses Google sign-in. Please continue with Google."
      });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ success: false, message: "Wrong password" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "secret", { expiresIn: "7d" });
    res.json({ success: true, user: sanitizeUser(user), token });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Google signup
router.post("/google-signup", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, message: "Google token is required" });
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({ success: false, message: "Google sign-in is not configured on the server" });
    }

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
    const authToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "secret", { expiresIn: "7d" });

    res.json({ 
      success: true, 
      message: "Signed up with Google successfully",
      user: sanitizeUser(user),
      token: authToken 
    });
  } catch (error) {
    console.error("Google signup error:", error);
    res.status(400).json({ success: false, message: "Google authentication failed" });
  }
});

// Get Google Client ID (for frontend initialization)
router.get("/google-client-id", (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return res.json({ success: false, message: "Google Client ID not configured", clientId: null });
  }
  res.json({ success: true, clientId });
});

module.exports = router;