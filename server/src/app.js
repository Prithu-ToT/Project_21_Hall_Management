const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const studentBookingRoutes = require("./routes/studentBookingRoutes");
const studentServiceRoutes = require("./routes/studentServiceRoutes");


const app = express();

app.use(cors());
app.use(express.json());

// logger middlewear
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});
// Routes
app.use("/", authRoutes);
app.use("/student", studentRoutes);
app.use("/student/bookings", studentBookingRoutes);
app.use("/student/services", studentServiceRoutes);

// Error handling middleware — must be at the bottom
app.use((err, req, res, next) => {
    const status = err.status || 500;
    let message = err.message || "Internal server error";

    switch (err.code) {
        case "23505":
            return res.status(400).json({ message: "Inserted value has to be unique" });
        case "23503":
            return res.status(400).json({ message: "Inserted value violates dependencies" });
        default:
            console.error(err);
            return res.status(status).json({ message });
    }
});

module.exports = app;
