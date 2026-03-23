const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// register
router.post("/register", async (req, res) => {
  const hashed = await bcrypt.hash(req.body.password, 10);
  const user = new User({ ...req.body, password: hashed });
  await user.save();
  res.json(user);
});

// login
router.post("/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).json("User not found");

  const valid = await bcrypt.compare(req.body.password, user.password);
  if (!valid) return res.status(400).json("Wrong password");

  const token = jwt.sign({ id: user._id }, "secret");
  res.json({ user, token });
});

module.exports = router;