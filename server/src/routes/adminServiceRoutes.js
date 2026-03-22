const express = require("express");
const router = express.Router();
const pool = require("../db");
const asyncWrapper = require("../asyncWrapper");

// Mounted at /admin/service — see app.js

// GET /admin/service/names/:hallId
router.get("/names/:hallId", asyncWrapper(async (req, res) => {
    const { hallId } = req.params;
    const result = await pool.query(
        `SELECT DISTINCT rs.service_name
         FROM resident_service rs
         JOIN hall_allocation ha ON rs.allocation_id = ha.allocation_id
         JOIN room r ON ha.room_id = r.room_id
         WHERE r.hall_id = $1
         ORDER BY rs.service_name`,
        [hallId]
    );
    res.json(result.rows.map((r) => r.service_name));
}));

// GET /admin/service/by-name/:hallId?name=
router.get("/by-name/:hallId", asyncWrapper(async (req, res) => {
    const { hallId } = req.params;
    const { name } = req.query;
    if (!name || !name.trim()) {
        return res.status(400).json({ message: "Query param 'name' is required." });
    }
    const result = await pool.query(
        `SELECT rs.service_name,
                TO_CHAR(rs.service_period_start, 'DD-Mon-YYYY') AS service_period_start,
                TO_CHAR(rs.service_period_end, 'DD-Mon-YYYY') AS service_period_end,
                rs.service_fee_amount,
                rs.status,
                ha.student_id,
                p.name AS student_name,
                r.room_number
         FROM resident_service rs
         JOIN hall_allocation ha ON rs.allocation_id = ha.allocation_id
         JOIN room r ON ha.room_id = r.room_id
         JOIN student s ON ha.student_id = s.student_id
         JOIN person p ON s.person_id = p.person_id
         WHERE r.hall_id = $1 AND rs.service_name = $2
         ORDER BY rs.service_period_start, r.room_number`,
        [hallId, name.trim()]
    );
    res.json(result.rows);
}));

// GET /admin/service/by-student/:hallId/:studentId
router.get("/by-student/:hallId/:studentId", asyncWrapper(async (req, res) => {
    const { hallId, studentId } = req.params;
    const result = await pool.query(
        `SELECT rs.service_name,
                TO_CHAR(rs.service_period_start, 'DD-Mon-YYYY') AS service_period_start,
                TO_CHAR(rs.service_period_end, 'DD-Mon-YYYY') AS service_period_end,
                rs.service_fee_amount,
                rs.status,
                r.room_number
         FROM resident_service rs
         JOIN hall_allocation ha ON rs.allocation_id = ha.allocation_id
         JOIN room r ON ha.room_id = r.room_id
         WHERE r.hall_id = $1 AND ha.student_id = $2
         ORDER BY rs.service_period_start`,
        [hallId, studentId]
    );
    res.json(result.rows);
}));

// POST /admin/service — add service for one student (student_id resolves to allocation_id in this hall)
router.post("/", asyncWrapper(async (req, res) => {
    const { hallId, student_id, service_name, service_period_start, service_period_end, service_fee_amount } = req.body;

    if (!hallId || !student_id || !service_name || !service_period_start || !service_period_end || service_fee_amount == null) {
        return res.status(400).json({ message: "hallId, student_id, service_name, service_period_start, service_period_end, and service_fee_amount are required." });
    }

    const allocRes = await pool.query(
        `SELECT ha.allocation_id
         FROM hall_allocation ha
         JOIN room r ON ha.room_id = r.room_id
         WHERE ha.student_id = $1 AND r.hall_id = $2`,
        [student_id, hallId]
    );
    if (allocRes.rows.length === 0) {
        return res.status(404).json({ message: "No allocation for this student in this hall." });
    }
    const allocation_id = allocRes.rows[0].allocation_id;

    const fee = parseFloat(service_fee_amount);
    if (isNaN(fee) || fee < 0) {
        return res.status(400).json({ message: "service_fee_amount must be a non-negative number." });
    }

    const ins = await pool.query(
        `INSERT INTO resident_service (allocation_id, service_name, service_period_start, service_period_end, service_fee_amount)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING service_id`,
        [allocation_id, service_name.trim(), service_period_start, service_period_end, fee]
    );

    res.status(201).json({
        message: "Service added.",
        service_id: ins.rows[0].service_id,
    });
}));

// POST /admin/service/add-for-all — add service to all allocations in this hall
router.post("/add-for-all", asyncWrapper(async (req, res) => {
    const { hallId, service_name, service_period_start, service_period_end, service_fee_amount } = req.body;

    if (!hallId || !service_name || !service_period_start || !service_period_end || service_fee_amount == null) {
        return res.status(400).json({ message: "hallId, service_name, service_period_start, service_period_end, and service_fee_amount are required." });
    }

    const fee = parseFloat(service_fee_amount);
    if (isNaN(fee) || fee < 0) {
        return res.status(400).json({ message: "service_fee_amount must be a non-negative number." });
    }

    await pool.query(
        `CALL add_service_to_all_in_hall($1, $2, $3, $4, $5)`,
        [hallId, service_name.trim(), service_period_start, service_period_end, fee]
    );

    res.json({ message: "Service added to all allocations in this hall." });
}));

module.exports = router;
