const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_oBXHILVhM12D@ep-frosty-sunset-a1vkkssk-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: { rejectUnauthorized: false }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});

// ─── Auth ────────────────────────────────────────────────────────────────────

app.post("/login", async (req, res) => {
  const { username, password, role } = req.body;
  console.log("Entered login");

  try {
    let query, values;

    if (role === "student") {
      query = `SELECT password FROM student_auth sa WHERE sa.student_id = ($1)`;
      values = [username];
    } else if (role === "admin") {
      query = `SELECT password FROM hall_auth ha
               JOIN hall h ON ha.hall_id = h.hall_id
               WHERE LOWER(h.hall_name) = LOWER($1)`;
      values = [username];
    } else {
      return res.status(400).json({ message: "Invalid role" });
    }

    const result = await pool.query(query, values);

    if (result.rows.length === 0)
      return res.status(404).json({ message: "Username not found" });

    if (result.rows[0].password === password)
      return res.json({ message: "Login successful" });
    else
      return res.status(401).json({ message: "Wrong password" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ─── Student Dashboard ───────────────────────────────────────────────────────

/**
 * GET /student/:id
 * Returns full profile: person info, allocation, room, hall, services, payments
 */
app.get("/student/:id", async (req, res) => {
  const studentId = req.params.id;

  try {
    // Profile
    const profileResult = await pool.query(
      `SELECT s.student_id, s.semester, s.department,
              p.name, p.phone_number, p.nid
       FROM student s
       JOIN person p ON s.person_id = p.person_id
       WHERE s.student_id = $1`,
      [studentId]
    );

    if (profileResult.rows.length === 0)
      return res.status(404).json({ message: "Student not found" });

    const profile = profileResult.rows[0];

    // Allocation + Room + Hall
    const allocResult = await pool.query(
      `SELECT ha.allocation_id, ha.status AS alloc_status,
              r.room_number, h.hall_name,
              sfp.amount AS seat_fee_paid, sfp.bank_transaction_id
       FROM hall_allocation ha
       JOIN room r ON ha.room_id = r.room_id
       JOIN hall h ON r.hall_id = h.hall_id
       LEFT JOIN seat_fee_payment sfp ON sfp.allocation_id = ha.allocation_id
       WHERE ha.student_id = $1`,
      [studentId]
    );

    const allocation = allocResult.rows[0] || null;

    // Active / upcoming room bookings
    const bookingResult = await pool.query(
      `SELECT rb.booking_id, rb.status, rb.created_at,
              r.room_number, h.hall_name
       FROM room_booking rb
       JOIN room r ON rb.room_id = r.room_id
       JOIN hall h ON r.hall_id = h.hall_id
       WHERE rb.student_id = $1
       ORDER BY rb.created_at DESC
       LIMIT 10`,
      [studentId]
    );

    // Services (and whether paid)
    let services = [];
    if (allocation) {
      const serviceResult = await pool.query(
        `SELECT rs.service_id, rs.service_name,
                rs.service_period_start, rs.service_period_end,
                rs.service_fee_amount,
                rsp.amount_paid, rsp.bank_transaction_id
         FROM resident_service rs
         LEFT JOIN resident_service_payment rsp ON rs.service_id = rsp.service_id
         WHERE rs.allocation_id = $1
         ORDER BY rs.service_period_start DESC`,
        [allocation.allocation_id]
      );
      services = serviceResult.rows;
    }

    res.json({
      profile,
      allocation,
      bookings: bookingResult.rows,
      services
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ─── Admin Dashboard ─────────────────────────────────────────────────────────

/**
 * GET /admin/:hallName
 * Returns hall overview: hall info, room stats, pending bookings, recent allocations
 */
app.get("/admin/:hallName", async (req, res) => {
  const hallName = req.params.hallName;

  try {
    // Hall info
    const hallResult = await pool.query(
      `SELECT hall_id, hall_name, is_active
       FROM hall WHERE LOWER(hall_name) = LOWER($1)`,
      [hallName]
    );

    if (hallResult.rows.length === 0)
      return res.status(404).json({ message: "Hall not found" });

    const hall = hallResult.rows[0];
    const hallId = hall.hall_id;

    // Room summary
    const roomStatsResult = await pool.query(
      `SELECT
         COUNT(*) AS total_rooms,
         COUNT(*) FILTER (WHERE is_active) AS active_rooms
       FROM room WHERE hall_id = $1`,
      [hallId]
    );

    // Allocation stats
    const allocStatsResult = await pool.query(
      `SELECT
         COUNT(*) AS total_allocations,
         COUNT(*) FILTER (WHERE ha.status = 'ACTIVE')   AS active_count,
         COUNT(*) FILTER (WHERE ha.status = 'PENDING')  AS pending_count,
         COUNT(*) FILTER (WHERE ha.status = 'EXPIRED')  AS expired_count
       FROM hall_allocation ha
       JOIN room r ON ha.room_id = r.room_id
       WHERE r.hall_id = $1`,
      [hallId]
    );

    // Pending bookings (most actionable)
    const pendingBookings = await pool.query(
      `SELECT rb.booking_id, rb.status, rb.created_at,
              r.room_number, p.name AS student_name,
              s.student_id, s.department, s.semester
       FROM room_booking rb
       JOIN room r ON rb.room_id = r.room_id
       JOIN student s ON rb.student_id = s.student_id
       JOIN person p ON s.person_id = p.person_id
       WHERE r.hall_id = $1 AND rb.status = 'PENDING'
       ORDER BY rb.created_at ASC`,
      [hallId]
    );

    // Recent allocations
    const recentAllocations = await pool.query(
      `SELECT ha.allocation_id, ha.status AS alloc_status,
              r.room_number, p.name AS student_name,
              s.student_id, s.department, s.semester,
              sfp.amount AS seat_fee_paid
       FROM hall_allocation ha
       JOIN room r ON ha.room_id = r.room_id
       JOIN student s ON ha.student_id = s.student_id
       JOIN person p ON s.person_id = p.person_id
       LEFT JOIN seat_fee_payment sfp ON sfp.allocation_id = ha.allocation_id
       WHERE r.hall_id = $1
       ORDER BY ha.allocation_id DESC
       LIMIT 20`,
      [hallId]
    );

    // Rooms with occupancy count
    const roomOccupancy = await pool.query(
      `SELECT r.room_number, r.room_id, r.is_active,
              COUNT(ha.allocation_id) FILTER (WHERE ha.status = 'ACTIVE') AS occupants
       FROM room r
       LEFT JOIN hall_allocation ha ON r.room_id = ha.room_id
       WHERE r.hall_id = $1
       GROUP BY r.room_id, r.room_number, r.is_active
       ORDER BY r.room_number`,
      [hallId]
    );

    res.json({
      hall,
      roomStats: roomStatsResult.rows[0],
      allocStats: allocStatsResult.rows[0],
      pendingBookings: pendingBookings.rows,
      recentAllocations: recentAllocations.rows,
      rooms: roomOccupancy.rows
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/", (req, res) => {
  res.send("Heartbeat");
});
