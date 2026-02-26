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

app.post("/login", async (req, res) => {
    const { username, password, role } = req.body;

    console.log("Entered login");

    try {
        let query, values;

        if (role === "student") {
            query = `SELECT password FROM student_auth sa
                    WHERE sa.student_id = ($1)`;
            values = [username];
        } else if (role === "admin") {
            query = "SELECT password FROM hall_auth ha JOIN hall h ON ha.hall_id = h.hall_id WHERE LOWER(h.hall_name) = LOWER($1)";
            values = [username];
        } else {
            return res.status(400).json({ message: "Invalid role" });
        }

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({message: "Username not found" });
        }

        const storedPassword = result.rows[0].password;

        if (storedPassword === password) {
            return res.json({ message: "Login successful" });
        } else {
            return res.status(401).json({ message: "Wrong password" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.get("/student/basic/:id", async (req, res) => {
    const id = req.params.id;

    try {
        
        const query = 
                    `SELECT name, department, semester
                    FROM student sd
                    JOIN person ps ON sd.person_id = ps.person_id
                    WHERE sd.student_id = ($1);`
        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Student not found" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});



app.get("/", (req, res) => {
  res.send("Heartbeat");
});

