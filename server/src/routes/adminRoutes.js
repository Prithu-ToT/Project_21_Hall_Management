const express = require("express");
const router = express.Router();
const pool = require("../db");
const bcrypt = require("bcrypt");
const asyncWrapper = require("../asyncWrapper");

// GET /admin/hall-info/:hallName
router.get("/hall-info/:hallName", asyncWrapper(async (req, res) => {
    const hallName = req.params.hallName;
    const hallRes = await pool.query(
        `SELECT hall_id, hall_name FROM hall WHERE hall_name = $1`,
        [hallName]
    );

    if (hallRes.rows.length === 0) {
        return res.status(404).json({ message: "Hall not found" });
    }

    const hall = hallRes.rows[0];

    const allocRes = await pool.query(
        `SELECT * FROM get_hall_alloc_count($1)`,
        [hall.hall_id]
    );

    const alloc = allocRes.rows[0];
    res.json({
        hall_id: hall.hall_id,
        hall_name: hall.hall_name,
        total_students: alloc.ttl_alc,
        available_seats: alloc.rem_cap,
    });
}));

// POST /admin/change-password
router.post("/change-password", asyncWrapper(async (req, res) => {
    const { hallId, currentPassword, newPassword } = req.body;

    if (!hallId || !currentPassword || !newPassword) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const pwRes = await pool.query(
        `SELECT password FROM hall_auth
         WHERE hall_id = $1`,
        [hallId]
    );

    const oldPw = pwRes.rows[0].password;
    const match = await bcrypt.compare(currentPassword, oldPw);

    if (!match) {
        return res.status(401).json({ message: "Current password is incorrect" });
    }

    const hashedPw = await bcrypt.hash(newPassword, 10);
    await pool.query(
        `UPDATE hall_auth SET password = $1 WHERE hall_id = $2`,
        [hashedPw, hallId]
    );

    return res.status(200).json({ message: "Password Changed Successfully" });
}));

module.exports = router;
