const express = require("express");
const router = express.Router();
const pool = require("../db");
const bcrypt = require("bcrypt");
const asyncWrapper = require("../asyncWrapper");

// POST /sysadmin/add-hall
router.post("/add-hall", asyncWrapper(async (req, res) => {
    const { hallName, capacity, password } = req.body;

    if (!hallName || !capacity || !password) {
        return res.status(400).json({ message: "Hall name, capacity, and password are required." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Transaction: both inserts must succeed together
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        const hallRes = await client.query(
            `INSERT INTO hall (hall_name, total_capacity) VALUES ($1, $2) RETURNING hall_id`,
            [hallName, capacity]
        );
        const hallId = hallRes.rows[0].hall_id;

        await client.query(
            `INSERT INTO hall_auth (hall_id, password) VALUES ($1, $2)`,
            [hallId, hashedPassword]
        );

        await client.query("COMMIT");
        res.status(201).json({ message: "Hall created successfully.", hall_id: hallId });
    } catch (err) {
        await client.query("ROLLBACK");
        throw err; // let asyncWrapper + error middleware handle it
    } finally {
        client.release();
    }
}));

// POST /sysadmin/semester-rollover
router.post("/semester-rollover", asyncWrapper(async (req, res) => {
    await pool.query(`CALL semester_rollover()`);
    res.json({ message: "Semester rollover completed successfully." });
}));

module.exports = router;
