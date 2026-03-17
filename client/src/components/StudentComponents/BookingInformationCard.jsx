import { useState, useEffect } from "react";
import { BackendServer } from "../../App";
import Button from "../Button";

const statusColor = (status) => {
    switch (status) {
        case "CONFIRMED": return "var(--success)";
        case "DENIED":    return "var(--danger)";
        default:          return "#f59e0b";
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
    const [bookings, setBookings]                 = useState([]);
    const [loading, setLoading]                   = useState(false);
    const [error, setError]                       = useState(null);

    // --- delete state ---
    const [confirmDeleteId, setConfirmDeleteId]   = useState(null); // booking_id awaiting confirm
    const [deleting, setDeleting]                 = useState(false);

    // --- add booking state ---
    const [showAddForm, setShowAddForm]           = useState(false);
    const [halls, setHalls]                       = useState([]);       // [{hall_id, hall_name}]
    const [hallSearch, setHallSearch]             = useState("");       // text in the hall search input
    const [selectedHall, setSelectedHall]         = useState(null);     // {hall_id, hall_name}
    const [showHallDropdown, setShowHallDropdown] = useState(false);
    const [roomNumber, setRoomNumber]             = useState("");
    const [addError, setAddError]                 = useState(null);
    const [adding, setAdding]                     = useState(false);

    // ─── fetch bookings ───────────────────────────────────────────────────────
    const fetchBookings = async () => {
        setLoading(true);
        setError(null);
        try {
            // BACKEND: GET /student/bookings/:studentId
            // Returns: [{ booking_id, hall_name, room_number, status, created_at }]
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

    // ─── fetch hall list for dropdown ─────────────────────────────────────────
    const fetchHalls = async () => {
        try {
            // BACKEND: GET /student/halls
            // Returns: [{ hall_id, hall_name }]
            const res = await fetch(BackendServer + "student/halls");
            if (!res.ok) throw new Error("Failed to fetch halls");
            const data = await res.json();
            setHalls(data);
        } catch (err) {
            setAddError("Could not load hall list.");
        }
    };

    useEffect(() => {
        if (username) fetchBookings();
    }, [username]);

    // ─── delete handlers ──────────────────────────────────────────────────────
    const handleDeleteConfirm = async () => {
        setDeleting(true);
        try {
            // BACKEND: DELETE /student/bookings/:bookingId
            // Returns: 200 { message: "Booking deleted" }
            const res = await fetch(BackendServer + `student/bookings/${confirmDeleteId}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Failed to delete booking");
            setConfirmDeleteId(null);
            await fetchBookings();
        } catch (err) {
            setError(err.message);
        } finally {
            setDeleting(false);
        }
    };

    // ─── add booking handlers ─────────────────────────────────────────────────
    const handleOpenAddForm = () => {
        setShowAddForm(true);
        setAddError(null);
        fetchHalls();
    };

    const handleCloseAddForm = () => {
        setShowAddForm(false);
        setSelectedHall(null);
        setHallSearch("");
        setRoomNumber("");
        setAddError(null);
        setShowHallDropdown(false);
    };

    const handleSelectHall = (hall) => {
        setSelectedHall(hall);
        setHallSearch(hall.hall_name);
        setShowHallDropdown(false);
    };

    const handleAddSubmit = async () => {
        if (!selectedHall || !roomNumber.trim()) {
            setAddError("Please select a hall and enter a room number.");
            return;
        }
        setAdding(true);
        setAddError(null);
        try {
            // BACKEND: POST /student/bookings
            // Body:    { student_id, hall_id, room_number }
            // Returns: 201 { message: "Booking created" }
            //          400 { message: "Room not found" } or similar
            const res = await fetch(BackendServer + "student/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    student_id:  username,
                    hall_id:     selectedHall.hall_id,
                    room_number: roomNumber.trim(),
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                setAddError(data.message || "Failed to create booking.");
                return;
            }
            handleCloseAddForm();
            await fetchBookings();
        } catch (err) {
            setAddError("An error occurred. Please try again.");
        } finally {
            setAdding(false);
        }
    };

    // ─── filter hall list as user types ──────────────────────────────────────
    const filteredHalls = halls.filter((h) =>
        h.hall_name.toLowerCase().includes(hallSearch.toLowerCase())
    );

    // ─── render ───────────────────────────────────────────────────────────────
    if (loading) return (
        <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", padding: "0.5rem 0" }}>Loading…</p>
    );
    if (error) return (
        <p style={{ color: "var(--danger)", fontSize: "0.88rem", padding: "0.5rem 0" }}>{error}</p>
    );

    return (
        <div>
            {/* ── booking list ── */}
            {bookings.length === 0 && (
                <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginBottom: "1rem" }}>
                    No bookings found.
                </p>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginBottom: "1rem" }}>
                {bookings.map((b) => (
                    <div key={b.booking_id}>

                        {/* normal row */}
                        {confirmDeleteId !== b.booking_id && (
                            <div style={styles.bookingRow}>
                                <div style={styles.bookingLeft}>
                                    <span style={styles.roomInfo}>{b.hall_name} — Room {b.room_number}</span>
                                    <span style={styles.bookingDate}>Booked on {b.created_at}</span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                                    <StatusBadge status={b.status} />
                                    <button
                                        onClick={() => setConfirmDeleteId(b.booking_id)}
                                        style={styles.deleteBtn}
                                        title="Delete booking"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* inline confirmation — replaces the row */}
                        {confirmDeleteId === b.booking_id && (
                            <div style={styles.confirmRow}>
                                <span style={styles.confirmText}>Delete this booking?</span>
                                <div style={{ display: "flex", gap: "8px" }}>
                                    <Button
                                        variant="outline-primary"
                                        onClick={() => setConfirmDeleteId(null)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="danger"
                                        onClick={handleDeleteConfirm}
                                        disabled={deleting}
                                    >
                                        {deleting ? "Deleting…" : "Yes, Delete"}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* ── add booking form ── */}
            {showAddForm ? (
                <div style={styles.addForm}>
                    <p style={styles.addTitle}>New Room Booking</p>

                    {/* searchable hall dropdown */}
                    <div style={{ position: "relative", marginBottom: "0.75rem" }}>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search hall name…"
                            value={hallSearch}
                            onChange={(e) => {
                                setHallSearch(e.target.value);
                                setSelectedHall(null);
                                setShowHallDropdown(true);
                            }}
                            onFocus={() => setShowHallDropdown(true)}
                            onBlur={() => setTimeout(() => setShowHallDropdown(false), 100)}
                            // setTimeout so onMouseDown on a dropdown item fires before onBlur hides it
                        />
                        {showHallDropdown && filteredHalls.length > 0 && (
                            <div style={styles.dropdown}>
                                {filteredHalls.map((h) => (
                                    <div
                                        key={h.hall_id}
                                        style={styles.dropdownItem}
                                        onMouseDown={() => handleSelectHall(h)}
                                    >
                                        {h.hall_name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <input
                        type="text"
                        className="form-control"
                        placeholder="Room number (e.g. 101)"
                        value={roomNumber}
                        onChange={(e) => setRoomNumber(e.target.value)}
                        style={{ marginBottom: "0.75rem" }}
                    />

                    {addError && (
                        <p style={{ color: "var(--danger)", fontSize: "0.85rem", marginBottom: "0.75rem" }}>
                            {addError}
                        </p>
                    )}

                    <div style={{ display: "flex", gap: "10px" }}>
                        <Button variant="outline-primary" onClick={handleCloseAddForm} className="flex-fill">
                            ← Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleAddSubmit}
                            disabled={adding}
                            className="flex-fill"
                        >
                            {adding ? "Booking…" : "Confirm Booking"}
                        </Button>
                    </div>
                </div>
            ) : (
                <Button variant="outline-primary" onClick={handleOpenAddForm} style={{ width: "100%" }}>
                    + Add Booking
                </Button>
            )}
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
    deleteBtn: {
        background: "none",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-sm)",
        color: "var(--text-muted)",
        cursor: "pointer",
        padding: "2px 8px",
        fontSize: "0.8rem",
        lineHeight: "1.6",
        transition: "all 0.15s",
    },
    confirmRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0.75rem 1rem",
        background: "#fef2f2",
        borderRadius: "var(--radius-sm)",
        border: "1px solid #fecaca",
        gap: "1rem",
        flexWrap: "wrap",
    },
    confirmText: {
        fontSize: "0.9rem",
        fontWeight: 500,
        color: "var(--danger)",
    },
    addForm: {
        background: "var(--surface-2)",
        borderRadius: "var(--radius)",
        padding: "1.5rem",
        border: "1px solid var(--border)",
    },
    addTitle: {
        fontFamily: "'Sora', sans-serif",
        fontWeight: 600,
        fontSize: "0.95rem",
        color: "var(--navy)",
        marginBottom: "1rem",
    },
    dropdown: {
        position: "absolute",
        top: "100%",
        left: 0,
        right: 0,
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-sm)",
        boxShadow: "var(--shadow-md)",
        zIndex: 10,
        maxHeight: "180px",
        overflowY: "auto",
    },
    dropdownItem: {
        padding: "0.6rem 1rem",
        fontSize: "0.9rem",
        color: "var(--text-primary)",
        cursor: "pointer",
    },
};
