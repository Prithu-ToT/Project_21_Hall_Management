const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_in_prod";

// tocken verification fuction
function requireAuth(req, res, next) {
    const header = req.headers["authorization"];

    // Expected format: "Bearer <token>"
    if (!header || !header.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Missing or malformed token" });
    }

    const token = header.slice(7); // strip "Bearer "

    try {
        req.user = jwt.verify(token, JWT_SECRET);  // stateless, sathe sathe verify kora jay
        next();
    } catch (err) {
        // jwt.verify throws if expired or tampered
        return res.status(401).json({ message: "Invalid or expired token" });
    }
}


// verifies if user roll is for this endpoint
function requireRole(...roles) {
    return (req, res, next) => {
        if (!roles.includes(req.user?.role)) {
            return res.status(403).json({ message: "Forbidden" });
        }
        next();
    };
}

module.exports = { requireAuth, requireRole, JWT_SECRET };