const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/", authRoutes);
app.use("/student", studentRoutes);

// Error handling middleware — must be at the bottom
app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({ message: err.message || "Internal server error" });
});

module.exports = app;
