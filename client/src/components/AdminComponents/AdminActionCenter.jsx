import { useEffect, useMemo, useState } from "react";
import { BackendServer } from "../../App";
import { authFetch } from "../../authFetch";
import Button from "../Button";

const AdminActionCenter = ({ hallId }) => {
    const [rooms, setRooms] = useState([]);
    const [roomsLoading, setRoomsLoading] = useState(false);
    const [roomsError, setRoomsError] = useState(null);

    const [roomSearch, setRoomSearch] = useState("");
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [showRoomDropdown, setShowRoomDropdown] = useState(false);

    const [historyRows, setHistoryRows] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyError, setHistoryError] = useState(null);

    const [studentLookupId, setStudentLookupId] = useState("");
    const [studentHistoryRows, setStudentHistoryRows] = useState([]);
    const [lookupLoading, setLookupLoading] = useState(false);
    const [lookupError, setLookupError] = useState(null);

    const [beforeDate, setBeforeDate] = useState("");
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteError, setDeleteError] = useState(null);
    const [deleteSuccess, setDeleteSuccess] = useState(null);

    const [showHistory, setShowHistory] = useState(false);

    useEffect(() => {
        const loadRooms = async () => {
            if (!hallId) return;
            setRoomsLoading(true);
            setRoomsError(null);
            try {
                const res = await authFetch(BackendServer + `admin/allocation/rooms/${hallId}`);
                if (!res.ok) throw new Error("Failed to load rooms");
                const data = await res.json();
                setRooms(data);
            } catch (e) {
                setRoomsError(e.message);
            } finally {
                setRoomsLoading(false);
            }
        };
        loadRooms();
    }, [hallId]);

    const filteredRooms = useMemo(() => {
        const q = roomSearch.trim().toLowerCase();
        if (!q) return rooms;
        return rooms.filter((r) => String(r.room_number).toLowerCase().includes(q));
    }, [rooms, roomSearch]);

    const fetchBasicForStudent = async (studentId) => {
        const res = await authFetch(BackendServer + `student/basic/${studentId}`);
        if (!res.ok) return null;
        return res.json();
    };

    const loadRoomHistory = async (room) => {
        if (!hallId || !room) return;
        setHistoryLoading(true);
        setHistoryError(null);
        setHistoryRows([]);
        try {
            const res = await authFetch(
                BackendServer + `admin/allocation/history-room/${hallId}/${room.room_id}`
            );
            if (!res.ok) throw new Error("Failed to load allocation history");
            const rows = await res.json();
            const enriched = await Promise.all(
                rows.map(async (row) => {
                    const basic = await fetchBasicForStudent(row.student_id);
                    return {
                        ...row,
                        name: basic?.name ?? "—",
                        department: basic?.department ?? "—",
                    };
                })
            );
            setHistoryRows(enriched);
        } catch (e) {
            setHistoryError(e.message);
        } finally {
            setHistoryLoading(false);
        }
    };

    const handleSelectRoom = (room) => {
        setSelectedRoom(room);
        setRoomSearch(String(room.room_number));
        setShowRoomDropdown(false);
        loadRoomHistory(room);
    };

    const handleStudentHistoryLookup = async () => {
        const sid = studentLookupId.trim();
        if (!sid || !hallId) {
            setLookupError("Enter a student ID.");
            return;
        }
        setLookupLoading(true);
        setLookupError(null);
        setStudentHistoryRows([]);
        try {
            const res = await authFetch(
                BackendServer + `admin/allocation/history-student/${hallId}/${encodeURIComponent(sid)}`
            );
            const data = await res.json();
            if (!res.ok) {
                setLookupError(data.message || "Lookup failed.");
                return;
            }
            setStudentHistoryRows(data);
        } catch {
            setLookupError("Network error.");
        } finally {
            setLookupLoading(false);
        }
    };

    const handleDeleteHistory = async () => {
        setDeleteError(null);
        setDeleteSuccess(null);

        if (!beforeDate) {
            setDeleteError("Please select a date.");
            return;
        }

        if (!window.confirm(`Delete all history with start_date before ${beforeDate}?`)) {
            return;
        }

        setDeleteLoading(true);
        try {
            const response = await authFetch(BackendServer + `admin/allocation/history-before/${hallId}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ beforeDate }),
            });
            const data = await response.json();
            if (!response.ok) {
                setDeleteError(data.message || "Failed to delete history.");
            } else {
                setDeleteSuccess(`Deleted ${data.deleted_count} history row(s).`);
                if (selectedRoom) {
                    await loadRoomHistory(selectedRoom);
                }
            }
        } catch {
            setDeleteError("Network error. Please try again.");
        } finally {
            setDeleteLoading(false);
        }
    };

    if (!hallId) {
        return (
            <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
                Hall information is not loaded yet.
            </p>
        );
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

            <Button
                variant={showHistory ? "primary" : "outline-primary"}
                onClick={() => setShowHistory(prev => !prev)}
                style={{ marginBottom: "1rem" }}
            >
                {showHistory ? "Hide Allocation History" : "Show Allocation History"}
            </Button>

            {showHistory && (
                <>
                    <section>
                        <h3 style={styles.sectionTitle}>Search history by student</h3>
                        <section>
                <h3 style={styles.sectionTitle}>Search history by student</h3>
                <div style={styles.row}>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Student ID"
                        value={studentLookupId}
                        onChange={(e) => setStudentLookupId(e.target.value)}
                        style={{ flex: 1 }}
                    />
                    <Button variant="primary" onClick={handleStudentHistoryLookup} disabled={lookupLoading}>
                        {lookupLoading ? "Searching..." : "Find history"}
                    </Button>
                </div>
                {lookupError && <p style={{ color: "var(--danger)", fontSize: "0.85rem", marginTop: "0.5rem" }}>{lookupError}</p>}
                {studentHistoryRows.length > 0 && (
                    <div style={styles.tableWrap}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>History ID</th>
                                    <th style={styles.th}>Room</th>
                                    <th style={styles.th}>Start Date</th>
                                    <th style={styles.th}>End Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {studentHistoryRows.map((row) => (
                                    <tr key={row.history_id}>
                                        <td style={styles.td}>{row.history_id}</td>
                                        <td style={styles.td}>{row.room_number}</td>
                                        <td style={styles.td}>{row.start_date}</td>
                                        <td style={styles.td}>{row.end_date}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
                    </section>

                    <section>
                        <h3 style={styles.sectionTitle}>Search history by room</h3>
                        
            <section>
                <h3 style={styles.sectionTitle}>Search history by room</h3>
                {roomsLoading && <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>Loading rooms...</p>}
                {roomsError && <p style={{ color: "var(--danger)", fontSize: "0.88rem" }}>{roomsError}</p>}
                {!roomsLoading && !roomsError && (
                    <div style={{ position: "relative" }}>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search room number..."
                            value={roomSearch}
                            onChange={(e) => {
                                setRoomSearch(e.target.value);
                                setSelectedRoom(null);
                                setHistoryRows([]);
                                setShowRoomDropdown(true);
                            }}
                            onFocus={() => setShowRoomDropdown(true)}
                            onBlur={() => setTimeout(() => setShowRoomDropdown(false), 120)}
                        />
                        {showRoomDropdown && filteredRooms.length > 0 && (
                            <div style={styles.dropdown}>
                                {filteredRooms.map((r) => (
                                    <div
                                        key={r.room_id}
                                        style={styles.dropdownItem}
                                        onMouseDown={() => handleSelectRoom(r)}
                                    >
                                        Room {r.room_number}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {selectedRoom && (
                    <div style={{ marginTop: "1rem" }}>
                        <p style={styles.selectedBanner}>Selected room: <strong>{selectedRoom.room_number}</strong></p>
                        {historyLoading && <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>Loading history...</p>}
                        {historyError && <p style={{ color: "var(--danger)", fontSize: "0.88rem" }}>{historyError}</p>}
                        {!historyLoading && !historyError && (
                            historyRows.length === 0 ? (
                                <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>No history found for this room.</p>
                            ) : (
                                <div style={styles.tableWrap}>
                                    <table style={styles.table}>
                                        <thead>
                                            <tr>
                                                <th style={styles.th}>History ID</th>
                                                <th style={styles.th}>Student ID</th>
                                                <th style={styles.th}>Name</th>
                                                <th style={styles.th}>Department</th>
                                                <th style={styles.th}>Start Date</th>
                                                <th style={styles.th}>End Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {historyRows.map((row) => (
                                                <tr key={row.history_id}>
                                                    <td style={styles.td}>{row.history_id}</td>
                                                    <td style={styles.td}>{row.student_id}</td>
                                                    <td style={styles.td}>{row.name}</td>
                                                    <td style={styles.td}>{row.department}</td>
                                                    <td style={styles.td}>{row.start_date}</td>
                                                    <td style={styles.td}>{row.end_date}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )
                        )}
                    </div>
                )}
            </section>
            <section style={styles.deleteSection}>
                <h3 style={styles.sectionTitle}>Delete history</h3>
                <p style={styles.hint}>Delete all entries with `start_date` before selected date.</p>
                <div style={styles.row}>
                    <input
                        type="date"
                        className="form-control"
                        value={beforeDate}
                        onChange={(e) => setBeforeDate(e.target.value)}
                        style={{ flex: 1 }}
                    />
                    <Button variant="danger" onClick={handleDeleteHistory} disabled={deleteLoading}>
                        {deleteLoading ? "Deleting..." : "Delete history"}
                    </Button>
                </div>
                {deleteError && <p style={{ color: "var(--danger)", fontSize: "0.85rem", marginTop: "0.5rem" }}>{deleteError}</p>}
                {deleteSuccess && <p style={{ color: "var(--success)", fontSize: "0.85rem", marginTop: "0.5rem" }}>{deleteSuccess}</p>}
            </section>
                    </section>
                </>
            )}

        </div>
    );
};

const styles = {
    sectionTitle: {
        fontFamily: "'Sora', sans-serif",
        fontSize: "0.95rem",
        fontWeight: 600,
        color: "var(--navy)",
        marginBottom: "0.35rem",
    },
    hint: {
        fontSize: "0.8rem",
        color: "var(--text-muted)",
        marginBottom: "0.65rem",
        lineHeight: 1.45,
    },
    row: {
        display: "flex",
        gap: "10px",
        alignItems: "stretch",
        flexWrap: "wrap",
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
        maxHeight: "200px",
        overflowY: "auto",
    },
    dropdownItem: {
        padding: "0.6rem 1rem",
        fontSize: "0.9rem",
        color: "var(--text-primary)",
        cursor: "pointer",
    },
    selectedBanner: {
        fontSize: "0.88rem",
        color: "var(--text-secondary)",
        marginBottom: "0.75rem",
    },
    tableWrap: {
        marginTop: "0.75rem",
        overflowX: "auto",
        borderRadius: "var(--radius-sm)",
        border: "1px solid var(--border)",
    },
    table: {
        width: "100%",
        borderCollapse: "collapse",
        fontSize: "0.85rem",
        background: "var(--surface)",
    },
    th: {
        textAlign: "left",
        padding: "0.65rem 0.75rem",
        background: "var(--surface-2)",
        color: "var(--text-muted)",
        fontWeight: 600,
        fontSize: "0.7rem",
        textTransform: "uppercase",
        letterSpacing: "0.04em",
        borderBottom: "1px solid var(--border)",
    },
    td: {
        padding: "0.6rem 0.75rem",
        borderBottom: "1px solid var(--border)",
        verticalAlign: "middle",
    },
    deleteSection: {
        borderTop: "1px solid var(--border)",
        paddingTop: "1rem",
    },
};

export default AdminActionCenter;
