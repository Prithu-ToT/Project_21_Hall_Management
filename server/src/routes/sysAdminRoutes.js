const express = require("express");
const router = express.Router();
const pool = require("../db");
const bcrypt = require("bcrypt");
const asyncWrapper = require("../asyncWrapper");

// GET /sysadmin/halls
router.get("/halls", asyncWrapper(async (req, res) => {
    const result = await pool.query(
        `SELECT hall_id, hall_name FROM hall
         WHERE LOWER(hall_name) != 'sysadmin'
         ORDER BY hall_name ASC`
    );
    res.json(result.rows);
}));

// POST /sysadmin/add-hall
router.post("/add-hall", asyncWrapper(async (req, res) => {
    const { hallName, password } = req.body;

    if (!hallName || !password) {
        return res.status(400).json({ message: "Hall name and password are required." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        const hallRes = await client.query(
            `INSERT INTO hall (hall_name) VALUES ($1) RETURNING hall_id`,
            [hallName]
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
        throw err;
    } finally {
        client.release();
    }
}));

// POST /sysadmin/add-room
router.post("/add-room", asyncWrapper(async (req, res) => {
    const { hallId, roomNumber, capacity } = req.body;

    if (!hallId || !roomNumber || !capacity) {
        return res.status(400).json({ message: "Hall, room number, and capacity are required." });
    }

    const result = await pool.query(
        `INSERT INTO room (hall_id, room_number, capacity)
         VALUES ($1, $2, $3)
         RETURNING room_id`,
        [hallId, roomNumber, capacity]
    );

    res.status(201).json({
        message: "Room added successfully.",
        room_id: result.rows[0].room_id,
    });
}));

// POST /sysadmin/semester-rollover
router.post("/semester-rollover", asyncWrapper(async (req, res) => {
    await pool.query(`CALL semester_rollover()`);
    res.json({ message: "Semester rollover completed successfully." });
}));

module.exports = router;