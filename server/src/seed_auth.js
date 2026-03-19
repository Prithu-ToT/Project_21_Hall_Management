// =====================================================
// ONE-TIME AUTH SEED SCRIPT
// Run from the server/src directory: node seed_auth.js
// Inserts bcrypt-hashed passwords for all students and halls.
//
// Student passwords : pass1 .. pass15   (login with student_id 1..15)
// Hall passwords    : th@123 | auh@123 | swh@123
// temp_password     : same plain-text value — this is what you hand to the student
// =====================================================

const bcrypt = require("bcrypt");
const pool   = require("./db");

const SALT_ROUNDS = 10;

const students = Array.from({ length: 15 }, (_, i) => ({
    student_id:    i + 1,
    plain_password: `pass${i + 1}`,
    temp_password:  `pass${i + 1}`,   // plain text record of what was issued
}));

const halls = [
    { hall_id: 1, plain_password: "th1"  },
    { hall_id: 2, plain_password: "auh2" },
    { hall_id: 3, plain_password: "swh3" },
    { hall_id: 4, plain_password: "sys4" },
];

async function seed() {
    try {
        console.log("Seeding student_auth...");
        for (const s of students) {
            const hashed = await bcrypt.hash(s.plain_password, SALT_ROUNDS);
            await pool.query(
                `INSERT INTO student_auth (student_id, password, temp_password)
                 VALUES ($1, $2, $3)
                 ON CONFLICT (student_id) DO UPDATE
                     SET password = EXCLUDED.password,
                         temp_password = EXCLUDED.temp_password`,
                [s.student_id, hashed, s.temp_password]
            );
            console.log(`  student ${s.student_id} — done`);
        }

        console.log("Seeding hall_auth...");
        for (const h of halls) {
            const hashed = await bcrypt.hash(h.plain_password, SALT_ROUNDS);
            await pool.query(
                `INSERT INTO hall_auth (hall_id, password)
                 VALUES ($1, $2)
                 ON CONFLICT (hall_id) DO UPDATE
                     SET password = EXCLUDED.password`,
                [h.hall_id, hashed]
            );
            console.log(`  hall ${h.hall_id} — done`);
        }

        console.log("Auth seed complete.");
    } catch (err) {
        console.error("Seed failed:", err.message);
    } finally {
        await pool.end();
    }
}

seed();