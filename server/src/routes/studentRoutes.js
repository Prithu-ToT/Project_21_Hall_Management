const express = require("express");
const router = express.Router();
const pool = require("../db");
const bcrypt = require("bcrypt");
const asyncWrapper = require("../asyncWrapper");

// GET /student/basic/:id
router.get("/basic/:id", asyncWrapper(async (req, res) => {
    const id = req.params.id;

    const result = await pool.query(
        `SELECT name, department, semester
         FROM student sd
         JOIN person ps ON sd.person_id = ps.person_id
         WHERE sd.student_id = $1`,
        [id]
    );

    if (result.rows.length === 0) {
        return res.status(404).json({ message: "Student not found" });
    }

    res.json(result.rows[0]);
}));

// GET /student/allocation/:id
router.get("/allocation/:id", asyncWrapper(async (req, res) => {
    const id = req.params.id;

    const allocationResult = await pool.query(
        `SELECT * FROM hall_allocation WHERE student_id = $1`,
        [id]
    );

    if (allocationResult.rows.length === 0) {
        return res.status(404).json({ message: "Allocation not found" });
    }
    const { room_id, ...restOfAlloc } = allocationResult.rows[0];

    const roomResult = await pool.query(
        `SELECT * FROM get_room_info($1)`,
        [room_id]
    );

    const room_info = roomResult.rows[0];

    res.json({ ...restOfAlloc, ...room_info });
}));

// POST /student/pay-seat-fee
router.post("/pay-seat-fee", asyncWrapper(async (req, res) => {
    const { allocation_id, bank_transaction_id, amount } = req.body;

    await pool.query(
        `INSERT INTO seat_fee_payment
        (allocation_id, amount, bank_transaction_id)
        VALUES ($1, $2, $3)`,
        [allocation_id, amount, bank_transaction_id]
    );

    res.status(200).json({ message: "Payment recorded" });
}));

// GET /student/halls
router.get("/halls", asyncWrapper(async (req, res) => {
    const response = await pool.query(
        `SELECT hall_id, hall_name FROM hall`
    );

    res.status(200).json(response.rows);
}));

// POST /student/change-password
router.post("/change-password", asyncWrapper(async (req, res) => {
    const { student_id, current_password, new_password } = req.body;

    if (!student_id || !current_password || !new_password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const result = await pool.query(
        `SELECT password FROM student_auth WHERE student_id = $1`,
        [student_id]
    );

    if (result.rows.length === 0) {
        return res.status(404).json({ message: "Student not found" });
    }

    const match = await bcrypt.compare(current_password, result.rows[0].password);
    if (!match) {
        return res.status(401).json({ message: "Current password is incorrect" });
    }

    const hashed = await bcrypt.hash(new_password, 10);

    await pool.query(
        `UPDATE student_auth SET password = $1 WHERE student_id = $2`,
        [hashed, student_id]
    );

    res.json({ message: "Password changed successfully" });
}));

module.exports = router;