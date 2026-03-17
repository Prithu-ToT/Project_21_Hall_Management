const express = require("express");
const pool = require("../db");
const asyncWrapper = require("../asyncWrapper");

const router = express.Router();

// GET /student/services/:studentId
router.get("/:studentId", asyncWrapper(async (req, res) => {

    const id = req.params.studentId;

    const allocResponse = await pool.query(
        `SELECT allocation_id FROM hall_allocation WHERE student_id = $1`,
        [id]
    );

    if (allocResponse.rows.length === 0) {
        return res.status(404).json({ message: "No allocation found for this student" });
    }

    const aid = allocResponse.rows[0].allocation_id;

    const response = await pool.query(
        `SELECT rs.service_id, service_name,
                TO_CHAR(service_period_start, 'DD-Mon-YYYY') AS service_period_start,
                TO_CHAR(service_period_end,   'DD-Mon-YYYY') AS service_period_end,
                service_fee_amount, rsp.payment_id
         FROM resident_service rs
         LEFT JOIN resident_service_payment rsp ON rs.service_id = rsp.service_id
         WHERE rs.allocation_id = $1`,
        [aid]                           // fix: was passing student_id here instead of allocation_id
    );

    const formattedRows = response.rows.map(({ payment_id, ...rest }) => ({
        ...rest,
        paid: payment_id !== null,      // fix: was returning response.rows, not formattedRows
    }));

    res.status(200).json(formattedRows);
}));

// POST /student/services/pay
router.post("/pay", asyncWrapper(async (req, res) => {
    const { service_id, amount_paid, bank_transaction_id } = req.body;

    await pool.query(
        `INSERT INTO resident_service_payment (service_id, amount_paid, bank_transaction_id)
         VALUES ($1, $2, $3)`,
        [service_id, amount_paid, bank_transaction_id]
    );

    res.status(200).json({ message: "Payment recorded" });
}));

module.exports = router;