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
    
    // concurrent booking insertion will be placed here
        
}));

module.exports = router;
