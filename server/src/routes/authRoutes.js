const express = require("express");
const router = express.Router();
const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const asyncWrapper = require("../asyncWrapper");
const { JWT_SECRET } = require("../authMiddleware");

router.post("/login", asyncWrapper(async (req, res) => {
    const { username, password, role } = req.body;

    let query, values;

    if (role === "student") {
        query = `SELECT password FROM student_auth WHERE student_id = $1`;
        values = [username];
    } else if (role === "admin") {
        query = `
            SELECT ha.password, h.hall_id FROM hall_auth ha
            JOIN hall h ON ha.hall_id = h.hall_id
            WHERE LOWER(h.hall_name) = LOWER($1)
        `;
        values = [username];
    } else {
        return res.status(400).json({ message: "Invalid role" });
    }

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
        return res.status(404).json({ message: "Username not found" });
    }

    const { password: storedPassword, hall_id } = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, storedPassword);

    if (!passwordMatch) {
        return res.status(401).json({ message: "Wrong password" });
    }

    const resolvedRole = (role === "admin" && username.toLowerCase() === "sysadmin")
        ? "sysadmin"
        : role;

    // Build payload based on role
    // hall_id embedded here means admin routes no longer trust client-sent hallId
    const payload =
        resolvedRole === "student"  ? { sub: username,    role: "student"  } :
        resolvedRole === "admin"    ? { sub: username,    role: "admin",    hallId: hall_id } :
        /* sysadmin */                { sub: "sysadmin",  role: "sysadmin" };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "8h" });

    res.json({ message: "Login successful", role: resolvedRole, token });
}));

module.exports = router;

// Pera hoilo amdr tocken je kew curi korte pare, we need to implement refresh token to prevent that, jeta korar tel amar ar nai  