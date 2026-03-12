const express = require("express");
const pool = require("../db");
const asyncWrapper = require("../asyncWrapper");

const router = express.Router();

// GET /bookings/:studentId
router.get("/:studentId", asyncWrapper(async (req, res) => {
    const id = req.params.studentId;

    const response = await pool.query(
        `SELECT * 
        FROM room_booking
        WHERE student_id = $1;`,
        [id]
    );

    const formattedRows = await Promise.all(response.rows.map(async (row) => {
        const { room_id, ...restOfRow } = row;
        
        const roomResult = await pool.query(
            `SELECT * FROM get_room_info($1)`,
            [room_id]
        );
        
        return {
            ...restOfRow,
            ...roomResult.rows[0]
        };
    }));

    res.json(formattedRows);
}));


// DELETE /bookings/:bookingId
router.delete("/:bookingId", asyncWrapper(async (req, res) => {
    const id = req.params.bookingId;

    await pool.query(
        `DELETE FROM room_booking WHERE booking_id = $1`,
        [id]
    );

    res.status(200).json({ message: "Booking deleted" });
}));

// POST /student/bookings
router.post("/", asyncWrapper(async (req, res) => {
    const { student_id, hall_id, room_number } = req.body;
    
    const roomRes = await pool.query(
        `SELECT room_id
        FROM room
        WHERE hall_id = $1 AND  room_number = $2`,
        [hall_id, room_number]
    )

    if (roomRes.rows.length === 0) {
        return res.status(400).json({ message: "Room not found" });
    }

    const room_id = roomRes.rows[0].room_id;

    await pool.query(
        `INSERT INTO room_booking 
        (student_id, room_id)
        VALUES
        ($1, $2)`,
        [student_id, room_id]
    );

    res.status(200).json({message: "Successfully added booking"});
}));

module.exports = router;
