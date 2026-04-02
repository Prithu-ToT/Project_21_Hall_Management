require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const studentBookingRoutes = require("./routes/studentBookingRoutes");
const studentServiceRoutes = require("./routes/studentServiceRoutes");
const adminRoutes = require("./routes/adminRoutes");
const adminAllocationRoutes = require("./routes/adminAllocationRoutes");
const adminServiceRoutes = require("./routes/adminServiceRoutes");
const sysAdminRoutes = require("./routes/sysAdminRoutes");  
const { requireAuth, requireRole } = require("./authMiddleware");
const app = express();

app.use(cors());
app.use(express.json());

// logger middlewear
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});
// Routes
app.use("/", authRoutes);   // this creates the token

// token needs verification for the later endpoints
app.use(requireAuth);

app.use("/student", requireRole("student"), studentRoutes);
app.use("/student/bookings", requireRole("student"), studentBookingRoutes);
app.use("/student/services", requireRole("student"), studentServiceRoutes);

app.use("/admin", requireRole("admin"), adminRoutes);
app.use("/admin/allocation", requireRole("admin"), adminAllocationRoutes);
app.use("/admin/service", requireRole("admin"), adminServiceRoutes);

app.use("/sysadmin", requireRole("sysadmin"), sysAdminRoutes);

// Error handling middleware — must be at the bottom
app.use((err, req, res, next) => {
    const status = err.status || 500;
    let message = err.message || "Internal server error";

    console.log(`Error happened : Code=${err.code} Msg=${err.message}`);

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
