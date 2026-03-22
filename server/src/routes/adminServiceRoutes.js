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
                CASE WHEN rsp.payment_id IS NOT NULL AND rsp.amount_paid >= rs.service_fee_amount
                     THEN 'PAID' ELSE 'PENDING' END AS status,
                ha.student_id,
                p.name AS student_name,
                r.room_number
         FROM resident_service rs
         JOIN hall_allocation ha ON rs.allocation_id = ha.allocation_id
         JOIN room r ON ha.room_id = r.room_id
         JOIN student s ON ha.student_id = s.student_id
         JOIN person p ON s.person_id = p.person_id
         LEFT JOIN resident_service_payment rsp ON rs.service_id = rsp.service_id
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
                CASE WHEN rsp.payment_id IS NOT NULL AND rsp.amount_paid >= rs.service_fee_amount
                     THEN 'PAID' ELSE 'PENDING' END AS status,
                r.room_number
         FROM resident_service rs
         JOIN hall_allocation ha ON rs.allocation_id = ha.allocation_id
         JOIN room r ON ha.room_id = r.room_id
         LEFT JOIN resident_service_payment rsp ON rs.service_id = rsp.service_id
         WHERE r.hall_id = $1 AND ha.student_id = $2
         ORDER BY rs.service_period_start`,
        [hallId, studentId]
    );
    res.json(result.rows);
}));

module.exports = router;
