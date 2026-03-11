const express = require("express");
const router = express.Router();
const pool = require("../db");
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

module.exports = router;

// GET /student/halls
router.get("/halls", asyncWrapper(async (req, res) =>{
    const response = await pool.query(
        `
        SELECT hall_id, hall_name
        FROM hall
        `
    )

    res.status(200).json(response.rows);
}))