import { useState, useEffect, useMemo } from "react";
import { BackendServer } from "../../App";
import Button from "../Button";
import TextInput from "../TextInput";

const StatusBadge = ({ status }) => {
    const color = status === "ACTIVE" ? "var(--success)" : "#f59e0b";
    return (
        <span style={{
            display: "inline-block",
            padding: "2px 8px",
            borderRadius: "20px",
            fontSize: "0.75rem",
            fontWeight: 600,
            background: color + "22",
            color,
            border: `1px solid ${color}55`,
        }}>
            {status ?? "—"}
        </span>
    );
};

/**
 * Admin allocation management for one hall.
 * Backend (see adminRoutes.js):
 *   GET    /admin/allocation/rooms/:hallId
 *   GET    /admin/allocation/room-allocations/:hallId/:roomId
 *   DELETE /admin/allocation/allocations/:hallId/:allocationId
 *   POST   /admin/allocation/allocations  { hallId, room_id, student_id }
 *   GET    /admin/allocation/student-location/:hallId/:studentId
 * Student profile: GET /student/basic/:id
 */
const AdminAllocationCard = ({ hallId }) => {
    const [rooms, setRooms] = useState([]);
    const [roomsLoading, setRoomsLoading] = useState(false);
    const [roomsError, setRoomsError] = useState(null);

    // --- search by room ---
    const [roomSearch, setRoomSearch] = useState("");
    const [selectedRoom, setSelectedRoom] = useState(null); // { room_id, room_number, capacity }
    const [showRoomDropdown, setShowRoomDropdown] = useState(false);

    const [allocRows, setAllocRows] = useState([]); // [{ allocation_id, student_id, name, department, semester }]
    const [allocLoading, setAllocLoading] = useState(false);
    const [allocError, setAllocError] = useState(null);

    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const [showAddModal, setShowAddModal] = useState(false);
    const [newStudentId, setNewStudentId] = useState("");
    const [addError, setAddError] = useState(null);
    const [adding, setAdding] = useState(false);

    // --- search by student ---
    const [studentLookupId, setStudentLookupId] = useState("");
    const [lookupLoading, setLookupLoading] = useState(false);
    const [lookupError, setLookupError] = useState(null);
    const [lookupResult, setLookupResult] = useState(null); // { room_number }

    const loadRooms = async () => {
        if (!hallId) return;
        setRoomsLoading(true);
        setRoomsError(null);
        try {
            const res = await fetch(BackendServer + `admin/allocation/rooms/${hallId}`);
            if (!res.ok) throw new Error("Failed to load rooms");
            const data = await res.json();
            setRooms(data);
        } catch (e) {
            setRoomsError(e.message);
        } finally {
            setRoomsLoading(false);
        }
    };

    useEffect(() => {
        loadRooms();
    }, [hallId]);

    const filteredRooms = useMemo(() => {
        const q = roomSearch.trim().toLowerCase();
        if (!q) return rooms;
        return rooms.filter((r) =>
            String(r.room_number).toLowerCase().includes(q)
        );
    }, [rooms, roomSearch]);

    const fetchBasicForStudent = async (studentId) => {
        const res = await fetch(BackendServer + `student/basic/${studentId}`);
        if (!res.ok) return null;
        return res.json();
    };

    const loadAllocationsForRoom = async (room) => {
        if (!hallId || !room) return;
        setAllocLoading(true);
        setAllocError(null);
        setAllocRows([]);
        try {
            const res = await fetch(
                BackendServer + `admin/allocation/room-allocations/${hallId}/${room.room_id}`
            );
            if (!res.ok) throw new Error("Failed to load allocations");
            const rows = await res.json();

            const enriched = await Promise.all(
                rows.map(async (row) => {
                    const basic = await fetchBasicForStudent(row.student_id);
                    return {
                        allocation_id: row.allocation_id,
                        student_id: row.student_id,
                        status: row.status,
                        name: basic?.name ?? "—",
                        department: basic?.department ?? "—",
                        semester: basic?.semester ?? "—",
                    };
                })
            );
            setAllocRows(enriched);
        } catch (e) {
            setAllocError(e.message);
        } finally {
            setAllocLoading(false);
        }
    };

    const handleSelectRoom = (room) => {
        setSelectedRoom(room);
        setRoomSearch(String(room.room_number));
        setShowRoomDropdown(false);
        loadAllocationsForRoom(room);
    };

    const handleDeleteAllocation = async () => {
        if (!confirmDeleteId || !hallId) return;
        setDeleting(true);
        try {
            const res = await fetch(
                BackendServer + `admin/allocation/allocations/${hallId}/${confirmDeleteId}`,
                { method: "DELETE" }
            );
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Delete failed");
            setConfirmDeleteId(null);
            if (selectedRoom) await loadAllocationsForRoom(selectedRoom);
        } catch (e) {
            setAllocError(e.message);
        } finally {
            setDeleting(false);
        }
    };

    const handleAddAllocation = async () => {
        const sid = newStudentId.trim();
        if (!sid || !selectedRoom || !hallId) {
            setAddError("Enter a student ID.");
            return;
        }
        setAdding(true);
        setAddError(null);
        try {
            const res = await fetch(BackendServer + "admin/allocation/allocations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    hallId: Number(hallId),
                    room_id: selectedRoom.room_id,
                    student_id: sid,
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                setAddError(data.message || "Could not add allocation.");
                return;
            }
            setShowAddModal(false);
            setNewStudentId("");
            await loadAllocationsForRoom(selectedRoom);
        } catch {
            setAddError("Network error. Try again.");
        } finally {
            setAdding(false);
        }
    };

    const handleStudentLookup = async () => {
        const sid = studentLookupId.trim();
        if (!sid || !hallId) {
            setLookupError("Enter a student ID.");
            return;
        }
        setLookupLoading(true);
        setLookupError(null);
        setLookupResult(null);
        try {
            const res = await fetch(
                BackendServer + `admin/allocation/student-location/${hallId}/${encodeURIComponent(sid)}`
            );
            const data = await res.json();
            if (!res.ok) {
                setLookupError(data.message || "Lookup failed.");
                return;
            }
            setLookupResult(data);

            // Highlight matching room in "search by room" flow
            const match = rooms.find((r) => r.room_number === data.room_number);
            if (match) {
                setSelectedRoom(match);
                setRoomSearch(String(match.room_number));
                await loadAllocationsForRoom(match);
            }
        } catch {
            setLookupError("Network error.");
        } finally {
            setLookupLoading(false);
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
            {/* ── Search by student ── */}
            <section>
                <h3 style={styles.sectionTitle}>Search by student</h3>
                <p style={styles.hint}>
                    Enter a student ID. If they have an allocation in this hall, their room is shown.
                </p>
                <div style={styles.row}>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Student ID"
                        value={studentLookupId}
                        onChange={(e) => setStudentLookupId(e.target.value)}
                        style={{ flex: 1 }}
                    />
                    <Button
                        variant="primary"
                        onClick={handleStudentLookup}
                        disabled={lookupLoading}
                    >
                        {lookupLoading ? "Searching…" : "Find room"}
                    </Button>
                </div>
                {lookupError && (
                    <p style={{ color: "var(--danger)", fontSize: "0.85rem", marginTop: "0.5rem" }}>
                        {lookupError}
                    </p>
                )}
                {lookupResult && (
                    <div style={styles.lookupCard}>
                        <p style={styles.lookupTitle}>Room in this hall</p>
                        <p style={styles.lookupRoom}>
                            Room <strong>{lookupResult.room_number}</strong>
                        </p>
                    </div>
                )}
            </section>

            {/* ── Search by room ── */}
            <section>
                <h3 style={styles.sectionTitle}>Search by room</h3>
                <p style={styles.hint}>
                    Type a room number and pick from the list. Manage allocations for that room below.
                </p>

                {roomsLoading && (
                    <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>Loading rooms…</p>
                )}
                {roomsError && (
                    <p style={{ color: "var(--danger)", fontSize: "0.88rem" }}>{roomsError}</p>
                )}

                {!roomsLoading && !roomsError && (
                    <div style={{ position: "relative" }}>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search room number…"
                            value={roomSearch}
                            onChange={(e) => {
                                setRoomSearch(e.target.value);
                                setSelectedRoom(null);
                                setAllocRows([]);
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
                                        <span style={styles.dropdownSub}>
                                            {" "}
                                            · cap {r.capacity ?? "—"}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {selectedRoom && (
                    <div style={{ marginTop: "1rem" }}>
                        <p style={styles.selectedBanner}>
                            Selected: <strong>Room {selectedRoom.room_number}</strong> (capacity{" "}
                            {selectedRoom.capacity ?? "—"})
                        </p>

                        {allocLoading && (
                            <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
                                Loading allocations…
                            </p>
                        )}
                        {allocError && (
                            <p style={{ color: "var(--danger)", fontSize: "0.88rem" }}>{allocError}</p>
                        )}

                        {!allocLoading && !allocError && (
                            <>
                                {allocRows.length === 0 ? (
                                    <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
                                        No students allocated to this room.
                                    </p>
                                ) : (
                                    <div style={styles.tableWrap}>
                                        <table style={styles.table}>
                                            <thead>
                                                <tr>
                                                    <th style={styles.th}>Student ID</th>
                                                    <th style={styles.th}>Name</th>
                                                    <th style={styles.th}>Department</th>
                                                    <th style={styles.th}>Semester</th>
                                                    <th style={styles.th}>Status</th>
                                                    <th style={styles.th}> </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {allocRows.map((row) => (
                                                    <tr key={row.allocation_id}>
                                                        <td style={styles.td}>{row.student_id}</td>
                                                        <td style={styles.td}>{row.name}</td>
                                                        <td style={styles.td}>{row.department}</td>
                                                        <td style={styles.td}>{row.semester}</td>
                                                        <td style={styles.td}>
                                                            <StatusBadge status={row.status} />
                                                        </td>
                                                        <td style={styles.td}>
                                                            {confirmDeleteId !== row.allocation_id ? (
                                                                <button
                                                                    type="button"
                                                                    style={styles.deleteBtn}
                                                                    onClick={() =>
                                                                        setConfirmDeleteId(row.allocation_id)
                                                                    }
                                                                    title="Remove allocation"
                                                                >
                                                                    Delete
                                                                </button>
                                                            ) : (
                                                                <div style={styles.inlineConfirm}>
                                                                    <span style={styles.confirmLabel}>
                                                                        Remove?
                                                                    </span>
                                                                    <button
                                                                        type="button"
                                                                        style={styles.smallBtn}
                                                                        onClick={() =>
                                                                            setConfirmDeleteId(null)
                                                                        }
                                                                    >
                                                                        No
                                                                    </button>
                                                                    <Button
                                                                        variant="danger"
                                                                        onClick={handleDeleteAllocation}
                                                                        disabled={deleting}
                                                                        style={{ padding: "0.25rem 0.6rem" }}
                                                                    >
                                                                        {deleting ? "…" : "Yes"}
                                                                    </Button>
                                                                </div>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                <Button
                                    variant="outline-primary"
                                    onClick={() => {
                                        setShowAddModal(true);
                                        setNewStudentId("");
                                        setAddError(null);
                                    }}
                                    style={{ width: "100%", marginTop: "0.75rem" }}
                                >
                                    + Add allocation to this room
                                </Button>
                            </>
                        )}
                    </div>
                )}
            </section>

            {/* ── Modal: add allocation ── */}
            {showAddModal && selectedRoom && (
                <div style={styles.modalBackdrop} onClick={() => !adding && setShowAddModal(false)}>
                    <div
                        style={styles.modal}
                        onClick={(e) => e.stopPropagation()}
                        className="fade-up"
                    >
                        <div style={styles.modalHeader}>
                            <span>Add allocation — Room {selectedRoom.room_number}</span>
                            <button
                                type="button"
                                style={styles.modalClose}
                                onClick={() => !adding && setShowAddModal(false)}
                                aria-label="Close"
                            >
                                ×
                            </button>
                        </div>
                        <TextInput
                            label="Student ID"
                            value={newStudentId}
                            onChange={(e) => setNewStudentId(e.target.value)}
                            placeholder="Enter student_id"
                        />
                        {addError && (
                            <p style={{ color: "var(--danger)", fontSize: "0.85rem", marginTop: "0.5rem" }}>
                                {addError}
                            </p>
                        )}
                        <div style={{ display: "flex", gap: "10px", marginTop: "1rem" }}>
                            <Button
                                variant="outline-primary"
                                className="flex-fill"
                                onClick={() => setShowAddModal(false)}
                                disabled={adding}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                className="flex-fill"
                                onClick={handleAddAllocation}
                                disabled={adding}
                            >
                                {adding ? "Adding…" : "Add"}
                            </Button>
                        </div>
                    </div>
                </div>
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
    lookupCard: {
        marginTop: "0.75rem",
        padding: "1rem 1.1rem",
        background: "linear-gradient(135deg, rgba(59,130,246,0.08) 0%, var(--surface-2) 100%)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-sm)",
        borderLeft: "4px solid var(--accent)",
    },
    lookupTitle: {
        fontSize: "0.72rem",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        color: "var(--text-muted)",
        marginBottom: "0.35rem",
    },
    lookupRoom: {
        fontSize: "1rem",
        color: "var(--text-primary)",
        margin: 0,
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
    dropdownSub: {
        color: "var(--text-muted)",
        fontSize: "0.8rem",
    },
    selectedBanner: {
        fontSize: "0.88rem",
        color: "var(--text-secondary)",
        marginBottom: "0.75rem",
    },
    tableWrap: {
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
        borderColor: "var(--border)",
        borderStyle: "solid",
        borderWidth: "0 0 1px 0",
        verticalAlign: "middle",
    },
    deleteBtn: {
        background: "none",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-sm)",
        color: "var(--danger)",
        cursor: "pointer",
        padding: "0.25rem 0.6rem",
        fontSize: "0.78rem",
        fontWeight: 600,
        fontFamily: "'DM Sans', sans-serif",
    },
    inlineConfirm: {
        display: "flex",
        alignItems: "center",
        gap: "6px",
        flexWrap: "wrap",
    },
    confirmLabel: {
        fontSize: "0.78rem",
        color: "var(--danger)",
        fontWeight: 600,
    },
    smallBtn: {
        background: "var(--surface-2)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-sm)",
        padding: "0.2rem 0.5rem",
        fontSize: "0.75rem",
        cursor: "pointer",
    },
    modalBackdrop: {
        position: "fixed",
        inset: 0,
        background: "rgba(15, 31, 61, 0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "1rem",
    },
    modal: {
        width: "100%",
        maxWidth: "400px",
        background: "var(--surface)",
        borderRadius: "var(--radius)",
        padding: "1.5rem",
        boxShadow: "var(--shadow-lg)",
        border: "1px solid var(--border)",
    },
    modalHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "1rem",
        fontFamily: "'Sora', sans-serif",
        fontWeight: 600,
        fontSize: "0.95rem",
        color: "var(--navy)",
    },
    modalClose: {
        background: "none",
        border: "none",
        fontSize: "1.5rem",
        lineHeight: 1,
        color: "var(--text-muted)",
        cursor: "pointer",
        padding: "0 0.25rem",
    },
};

export default AdminAllocationCard;
