const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/food", require("./routes/foodRoutes"));

app.get("/api/health", (_req, res) => {
	res.json({ success: true, message: "CampusChow backend is running" });
});

// connect DB
if (!process.env.MONGO_URI) {
	console.error("MONGO_URI is missing. Add it to backend/.env");
	process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB connected"))
.catch(err => console.log(err));

// start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
