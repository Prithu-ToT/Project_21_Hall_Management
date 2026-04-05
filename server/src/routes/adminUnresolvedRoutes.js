const express = require("express");
const router = express.Router();
const pool = require("../db");
const asyncWrapper = require("../asyncWrapper");

// GET /admin/unresolved/seat-fees
router.get("/seat-fees", asyncWrapper(async (req, res) => {
    const hallId = req.user.hallId;

    const result = await pool.query(
        `SELECT
            ha.allocation_id,
            ha.student_id,
            r.room_number,
            h.seat_fee,
            COALESCE(SUM(
                CASE WHEN sfp.direction = 'STUDENT_TO_HALL' THEN sfp.amount
                     ELSE -sfp.amount END
            ), 0) AS net_paid
         FROM hall_allocation ha
         JOIN room r ON ha.room_id = r.room_id
         JOIN hall h ON r.hall_id = h.hall_id
         LEFT JOIN seat_fee_payment sfp ON sfp.allocation_id = ha.allocation_id
         WHERE r.hall_id = $1
         GROUP BY ha.allocation_id, ha.student_id, r.room_number, h.seat_fee
         HAVING COALESCE(SUM(
                    CASE WHEN sfp.direction = 'STUDENT_TO_HALL' THEN sfp.amount
                         ELSE -sfp.amount END
                ), 0) > 0
            AND COALESCE(SUM(
                    CASE WHEN sfp.direction = 'STUDENT_TO_HALL' THEN sfp.amount
                         ELSE -sfp.amount END
                ), 0) != h.seat_fee
         ORDER BY ha.student_id`,
        [hallId]
    );

    const rows = result.rows.map(row => {
        const net = parseFloat(row.net_paid);
        const fee = parseFloat(row.seat_fee);
        return {
            allocation_id: row.allocation_id,
            student_id:    row.student_id,
            room_number:   row.room_number,
            seat_fee:      fee,
            paid_amount:   net,
            status:        net < fee ? "UNDERPAID" : "OVERPAID",
        };
    });

    res.json(rows);
}));

// GET /admin/unresolved/services
router.get("/services", asyncWrapper(async (req, res) => {
    const hallId = req.user.hallId;

    const result = await pool.query(
        `SELECT
            rs.service_id, ha.student_id, rs.service_name, rs.service_fee_amount,
            COALESCE(SUM(
                CASE WHEN rsp.direction = 'STUDENT_TO_HALL' THEN rsp.amount_paid
                     ELSE -rsp.amount_paid END
            ), 0) AS net_paid

         FROM resident_service rs
         JOIN hall_allocation ha ON rs.allocation_id = ha.allocation_id
         JOIN room r ON ha.room_id = r.room_id
         LEFT JOIN resident_service_payment rsp ON rsp.service_id = rs.service_id
         WHERE r.hall_id = $1
         GROUP BY rs.service_id, ha.student_id, rs.service_name, rs.service_fee_amount
         HAVING COALESCE(SUM(
                    CASE WHEN rsp.direction = 'STUDENT_TO_HALL' THEN rsp.amount_paid
                         ELSE -rsp.amount_paid END
                ), 0) != rs.service_fee_amount
         ORDER BY ha.student_id, rs.service_name`,
        [hallId]
    );

    const rows = result.rows.map(row => {
        const net = parseFloat(row.net_paid);
        const fee = parseFloat(row.service_fee_amount);
        return {
            service_id:         row.service_id,
            student_id:         row.student_id,
            service_name:       row.service_name,
            service_fee_amount: fee,
            paid_amount:        net,
            status:             net < fee ? "UNDERPAID" : "OVERPAID",
        };
    });

    res.json(rows);
}));

// POST /admin/unresolved/refund/seat-fee
// Body: { allocation_id, bank_transaction_id }
router.post("/refund/seat-fee", asyncWrapper(async (req, res) => {
    const hallId = req.user.hallId;
    const { allocation_id, bank_transaction_id } = req.body;

    if (!allocation_id || !bank_transaction_id) {
        return res.status(400).json({ message: "allocation_id and bank_transaction_id are required." });
    }

    // verify allocation belongs to this hall and compute net paid
    const check = await pool.query(
        `SELECT ha.allocation_id, h.seat_fee,
                COALESCE(SUM(
                    CASE WHEN sfp.direction = 'STUDENT_TO_HALL' THEN sfp.amount
                         ELSE -sfp.amount END
                ), 0) AS net_paid
         FROM hall_allocation ha
         JOIN room r ON ha.room_id = r.room_id
         JOIN hall h ON r.hall_id = h.hall_id
         LEFT JOIN seat_fee_payment sfp ON sfp.allocation_id = ha.allocation_id
         WHERE ha.allocation_id = $1 AND r.hall_id = $2
         GROUP BY ha.allocation_id, h.seat_fee`,
        [allocation_id, hallId]
    );

    if (check.rows.length === 0) {
        return res.status(404).json({ message: "Allocation not found in this hall." });
    }

    const overpaid = parseFloat(check.rows[0].net_paid) - parseFloat(check.rows[0].seat_fee);

    if (overpaid <= 0) {
        return res.status(400).json({ message: "No overpayment to refund." });
    }

    // positive amount, direction marks it as hall paying back the student
    await pool.query(
        `INSERT INTO seat_fee_payment (allocation_id, amount, bank_transaction_id, direction)
         VALUES ($1, $2, $3, 'HALL_TO_STUDENT')`,
        [allocation_id, overpaid, bank_transaction_id]
    );

    res.json({ message: "Refund recorded.", refund_amount: overpaid });
}));

// POST /admin/unresolved/refund/service
// Body: { service_id, bank_transaction_id }
router.post("/refund/service", asyncWrapper(async (req, res) => {
    const hallId = req.user.hallId;
    const { service_id, bank_transaction_id } = req.body;

    if (!service_id || !bank_transaction_id) {
        return res.status(400).json({ message: "service_id and bank_transaction_id are required." });
    }

    // verify service belongs to this hall and compute net paid
    const check = await pool.query(
        `SELECT rs.service_id, rs.service_fee_amount,
                COALESCE(SUM(
                    CASE WHEN rsp.direction = 'STUDENT_TO_HALL' THEN rsp.amount_paid
                         ELSE -rsp.amount_paid END
                ), 0) AS net_paid
         FROM resident_service rs
         JOIN hall_allocation ha ON rs.allocation_id = ha.allocation_id
         JOIN room r ON ha.room_id = r.room_id
         LEFT JOIN resident_service_payment rsp ON rsp.service_id = rs.service_id
         WHERE rs.service_id = $1 AND r.hall_id = $2
         GROUP BY rs.service_id, rs.service_fee_amount`,
        [service_id, hallId]
    );

    if (check.rows.length === 0) {
        return res.status(404).json({ message: "Service not found in this hall." });
    }

    const overpaid = parseFloat(check.rows[0].net_paid) - parseFloat(check.rows[0].service_fee_amount);

    if (overpaid <= 0) {
        return res.status(400).json({ message: "No overpayment to refund." });
    }

    await pool.query(
        `INSERT INTO resident_service_payment (service_id, amount_paid, bank_transaction_id, direction)
         VALUES ($1, $2, $3, 'HALL_TO_STUDENT')`,
        [service_id, overpaid, bank_transaction_id]
    );

    res.json({ message: "Refund recorded.", refund_amount: overpaid });
}));

module.exports = router;