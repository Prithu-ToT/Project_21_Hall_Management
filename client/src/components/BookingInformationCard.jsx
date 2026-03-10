import { useState, useEffect } from "react";
import { BackendServer } from "../App";

const statusColor = (status) => {
    switch (status) {
        case "CONFIRMED": return "var(--success)";
        case "DENIED":    return "var(--danger)";
        default:          return "#f59e0b";          // PENDING
    }
};

const StatusBadge = ({ status }) => {
    const color = statusColor(status);
    return (
        <span style={{
            display: "inline-block",
            padding: "2px 10px",
            borderRadius: "20px",
            fontSize: "0.78rem",
            fontWeight: 600,
            whiteSpace: "nowrap",
            background: color + "22",
            color: color,
            border: `1px solid ${color}55`,
        }}>
            {status}
        </span>
    );
};

export default function BookingInformationCard({ username }) {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBookings = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(BackendServer + `student/bookings/${username}`);
                if (!res.ok) throw new Error("Failed to fetch bookings");
                const data = await res.json();
                setBookings(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        if (username) fetchBookings();
    }, [username]);

    if (loading) return (
        <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", padding: "0.5rem 0" }}>Loading…</p>
    );
    if (error) return (
        <p style={{ color: "var(--danger)", fontSize: "0.88rem", padding: "0.5rem 0" }}>{error}</p>
    );
    if (bookings.length === 0) return (
        <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", padding: "0.5rem 0" }}>No bookings found.</p>
    );

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {bookings.map((b) => (
                <div key={b.booking_id} style={styles.bookingRow}>
                    <div style={styles.bookingLeft}>
                        <span style={styles.roomInfo}>{b.hall_name} — Room {b.room_number}</span>
                        <span style={styles.bookingDate}>Booked on {b.created_at}</span>
                    </div>
                    <StatusBadge status={b.status} />
                </div>
            ))}
        </div>
    );
}

const styles = {
    bookingRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0.75rem 1rem",
        background: "var(--surface-2)",
        borderRadius: "var(--radius-sm)",
        border: "1px solid var(--border)",
        gap: "1rem",
    },
    bookingLeft: {
        display: "flex",
        flexDirection: "column",
        gap: "2px",
        minWidth: 0,
    },
    roomInfo: {
        fontSize: "0.95rem",
        fontWeight: 600,
        color: "var(--text-primary)",
    },
    bookingDate: {
        fontSize: "0.78rem",
        color: "var(--text-muted)",
    },
};
