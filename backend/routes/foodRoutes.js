const router = require("express").Router();
const Food = require("../models/Food");

// get all food
router.get("/", async (req, res) => {
  const foods = await Food.find();
  res.json(foods);
});

// add food
router.post("/", async (req, res) => {
  const food = new Food(req.body);
  await food.save();
  res.json(food);
});

module.exports = router;