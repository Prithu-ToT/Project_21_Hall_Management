const express = require("express");
const router = express.Router();
const pool = require("../db");
const bcrypt = require("bcrypt");
const asyncWrapper = require("../asyncWrapper");

router.post("/login", asyncWrapper(async (req, res) => {
    const { username, password, role } = req.body;

    let query, values;

    if (role === "student") {
        query = `SELECT password FROM student_auth WHERE student_id = $1`;
        values = [username];
    } else if (role === "admin") {
        query = `
            SELECT password FROM hall_auth ha
            JOIN hall h ON ha.hall_id = h.hall_id
            WHERE LOWER(h.hall_name) = LOWER($1)
        `;
        values = [username];
    } else {
        return res.status(400).json({ message: "Invalid role" });
    }

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
        return res.status(404).json({ message: "Username not found" });
    }

    const match = await bcrypt.compare(password, result.rows[0].password);
    if (!match) {
        return res.status(401).json({ message: "Wrong password" });
    }

    res.json({ message: "Login successful" });
}));

module.exports = router;