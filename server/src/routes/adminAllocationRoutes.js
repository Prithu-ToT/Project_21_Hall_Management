const express = require("express");
const router = express.Router();
const pool = require("../db");
const asyncWrapper = require("../asyncWrapper");

// GET /admin/allocation/rooms/:hallId
router.get(
  "/rooms/:hallId",
  asyncWrapper(async (req, res) => {
    const hallId = req.user.hallId;
    if (!hallId) {
      return res
        .status(403)
        .json({ message: "Hall access is not available for this token." });
    }
    const result = await pool.query(
      `SELECT room_id, room_number, capacity
         FROM room
         WHERE hall_id = $1 AND is_active = TRUE
         ORDER BY room_number`,
      [hallId],
    );
    res.json(result.rows);
  }),
);

// GET /admin/allocation/room-allocations/:hallId/:roomId
router.get(
  "/room-allocations/:hallId/:roomId",
  asyncWrapper(async (req, res) => {
    const { roomId } = req.params;
    const hallId = req.user.hallId;
    if (!hallId) {
      return res
        .status(403)
        .json({ message: "Hall access is not available for this token." });
    }
    const result = await pool.query(
      `SELECT ha.allocation_id, ha.student_id, ha.status
         FROM hall_allocation ha
         JOIN room r ON r.room_id = ha.room_id
         WHERE ha.room_id = $1 AND r.hall_id = $2`,
      [roomId, hallId],
    );
    res.json(result.rows);
  }),
);

// DELETE /admin/allocation/allocations/:hallId/:allocationId
router.delete(
  "/allocations/:hallId/:allocationId",
  asyncWrapper(async (req, res) => {
    const { allocationId } = req.params;
    const hallId = req.user.hallId;
    if (!hallId) {
      return res
        .status(403)
        .json({ message: "Hall access is not available for this token." });
    }
    const del = await pool.query(
      `DELETE FROM hall_allocation ha
         USING room r
         WHERE ha.allocation_id = $1
           AND ha.room_id = r.room_id
           AND r.hall_id = $2
         RETURNING ha.allocation_id`,
      [allocationId, hallId],
    );
    if (del.rowCount === 0) {
      return res
        .status(404)
        .json({ message: "Allocation not found in this hall." });
    }
    res.json({ message: "Allocation removed." });
  }),
);

// POST /admin/allocation/allocations
router.post(
  "/allocations",
  asyncWrapper(async (req, res) => {
    const { room_id, student_id } = req.body;
    const hallId = req.user.hallId;
    if (!hallId) {
      return res
        .status(403)
        .json({ message: "Hall access is not available for this token." });
    }
    if (!room_id || !student_id) {
      return res
        .status(400)
        .json({ message: "room_id and student_id are required." });
    }
    const check = await pool.query(
      `SELECT r.room_id FROM room r
         WHERE r.room_id = $1 AND r.hall_id = $2 AND r.is_active = TRUE`,
      [room_id, hallId],
    );
    if (check.rows.length === 0) {
      return res.status(400).json({ message: "Room not found in this hall." });
    }
    const ins = await pool.query(
      `INSERT INTO hall_allocation (student_id, room_id)
         VALUES ($1, $2)
         RETURNING allocation_id`,
      [student_id, room_id],
    );
    res.status(201).json({
      message: "Allocation created.",
      allocation_id: ins.rows[0].allocation_id,
    });
  }),
);

// GET /admin/allocation/student-location/:hallId/:studentId
router.get(
  "/student-location/:hallId/:studentId",
  asyncWrapper(async (req, res) => {
    const { studentId } = req.params;
    const hallId = req.user.hallId;
    if (!hallId) {
      return res
        .status(403)
        .json({ message: "Hall access is not available for this token." });
    }
    const result = await pool.query(
      `SELECT r.room_number
         FROM hall_allocation ha
         JOIN room r ON r.room_id = ha.room_id
         WHERE ha.student_id = $1 AND r.hall_id = $2`,
      [studentId, hallId],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "No allocation for this student in this hall.",
      });
    }
    res.json(result.rows[0]);
  }),
);

// GET /admin/allocation/history-room/:hallId/:roomId
router.get(
  "/history-room/:hallId/:roomId",
  asyncWrapper(async (req, res) => {
    const { roomId } = req.params;
    const hallId = req.user.hallId;
    if (!hallId) {
      return res
        .status(403)
        .json({ message: "Hall access is not available for this token." });
    }
    const result = await pool.query(
      `SELECT ah.history_id, ah.student_id, ah.start_date, ah.end_date
         FROM allocation_history ah
         JOIN room r ON r.room_id = ah.room_id
         WHERE ah.room_id = $1 AND r.hall_id = $2
         ORDER BY ah.start_date DESC, ah.history_id DESC`,
      [roomId, hallId],
    );
    res.json(result.rows);
  }),
);

// GET /admin/allocation/history-student/:hallId/:studentId
router.get(
  "/history-student/:hallId/:studentId",
  asyncWrapper(async (req, res) => {
    const { studentId } = req.params;
    const hallId = req.user.hallId;
    if (!hallId) {
      return res
        .status(403)
        .json({ message: "Hall access is not available for this token." });
    }
    const result = await pool.query(
      `SELECT ah.history_id, ah.room_id, r.room_number, ah.start_date, ah.end_date
         FROM allocation_history ah
         JOIN room r ON r.room_id = ah.room_id
         WHERE ah.student_id = $1 AND r.hall_id = $2
         ORDER BY ah.start_date DESC, ah.history_id DESC`,
      [studentId, hallId],
    );
    res.json(result.rows);
  }),
);

// DELETE /admin/allocation/history-before/:hallId
router.delete(
  "/history-before/:hallId",
  asyncWrapper(async (req, res) => {
    const hallId = req.user.hallId;
    const { beforeDate } = req.body;

    if (!hallId) {
      return res
        .status(403)
        .json({ message: "Hall access is not available for this token." });
    }

    if (!beforeDate) {
      return res.status(400).json({ message: "beforeDate is required." });
    }

    const del = await pool.query(
      `DELETE FROM allocation_history ah
         USING room r
         WHERE ah.room_id = r.room_id
           AND r.hall_id = $1
           AND ah.start_date < $2::date
         RETURNING ah.history_id`,
      [hallId, beforeDate],
    );

    res.json({
      message: "History cleanup completed.",
      deleted_count: del.rowCount,
    });
  }),
);

// GET /admin/allocation/pending
router.get(
  "/pending",
  asyncWrapper(async (req, res) => {
    const hallId = req.user.hallId;
    const result = await pool.query(
      `
        SELECT ha.allocation_id, ha.student_id, p.name, r.room_number, p.phone_number
        FROM hall_allocation ha
        JOIN ROOM r ON ha.room_id = r.room_id
        JOIN STUDENT s ON ha.student_id = s.student_id
        JOIN PERSON p ON s.person_id = p.person_id
        WHERE ha.status = 'PENDING' AND r.hall_id = $1
        `,
      [hallId],
    );

    res.json(result.rows);
  }),
);

module.exports = router;
