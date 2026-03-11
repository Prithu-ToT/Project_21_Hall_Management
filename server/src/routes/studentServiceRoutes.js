const express = require("express");
const pool = require("../db");
const asyncWrapper = require("../asyncWrapper");

const router = express.Router();

// GET /student/services/:studentId
router.get("/:studentId", asyncWrapper( async (req, res) =>{
    
    const id = req.params.studentId;

    const response = await pool.query(
        `SELECT rs.service_id, service_name, 
                TO_CHAR(service_period_start, 'DD-Mon-YYYY') as service_period_start, 
                TO_CHAR(service_period_end, 'DD-Mon-YYYY') as service_period_end, 
                rsp.payment_id, service_fee_amount
        FROM resident_service rs
        LEFT JOIN resident_service_payment rsp
        ON rs.service_id = rsp.service_id
        WHERE allocation_id = $1`,
        [id]
    );

    const formattedRows = response.rows.map(row => {
        const { payment_id, ...restOfRow } = row;
        return {
            ...restOfRow,
            paid: payment_id !== null ? "true" : "false"
        };
    });

    res.status(200).json(formattedRows);

}));
