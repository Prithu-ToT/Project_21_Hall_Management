const express = require("express");
const router = express.Router();
const pool = require("../db");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
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

    const result = await pool.query(
        "SELECT add_hall_with_auth($1, $2) AS hall_id",
        [hallName, hashedPassword]
    );

    const hallId = result.rows[0].hall_id;
    res.status(201).json({ message: "Hall created successfully.", hall_id: hallId });
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

// POST /sysadmin/add-student
router.post("/add-student", asyncWrapper(async (req, res) => {
    const { nid, name, phone_number, department } = req.body;

    if (!nid || !name || !phone_number || !department) {
        return res.status(400).json({ message: "NID, name, phone number, and department are required." });
    }

    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        const personResult = await client.query(
            `INSERT INTO person (nid, name, phone_number)
             VALUES ($1, $2, $3)
             RETURNING person_id`,
            [nid.trim(), name.trim(), phone_number.trim()]
        );

        const personId = personResult.rows[0].person_id;

        const studentResult = await client.query(
            `INSERT INTO student (semester, department, person_id)
             VALUES (1, $1, $2)
             RETURNING student_id`,
            [department.trim(), personId]
        );

        const studentId = studentResult.rows[0].student_id;
        const tempPassword = crypto.randomBytes(6).toString("base64url").slice(0, 8);
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        await client.query(
            `INSERT INTO student_auth (student_id, password)

            VALUES ($1, $2)`,
            [studentId, hashedPassword]
        );

        await client.query("COMMIT");

        res.status(201).json({
            message: "Student added successfully.",
            student_id: studentId,
            temp_password: tempPassword,
        });
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}));

module.exports = router;