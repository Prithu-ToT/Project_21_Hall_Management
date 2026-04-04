import { useState, useEffect } from "react";
import { BackendServer } from "../../App";
import { authFetch } from "../../authFetch";
import Button from "../Button";

// Fetches GET /admin/allocation/pending  (hallId resolved server-side from JWT)
// Deletes via DELETE /admin/allocation/allocations/:hallId/:allocationId
const AdminPendingAllocation = ({ hallId }) => {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [confirmDeleteId, setConfirmDeleteId] = useState(null); // holds allocation_id while confirming
    const [deleting, setDeleting] = useState(false);

    const fetchPending = async () => {
        if (!hallId) return;
        setLoading(true);
        setError(null);
        try {
            // GET /admin/allocation/pending — hallId comes from JWT on backend
            const res = await authFetch(BackendServer + "admin/allocation/pending");
            if (!res.ok) throw new Error("Failed to load pending allocations");
            const data = await res.json();
            setRows(data);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPending();
    }, [hallId]);

    const handleDelete = async () => {
        if (!confirmDeleteId || !hallId) return;
        setDeleting(true);
        try {
            // DELETE /admin/allocation/allocations/:hallId/:allocationId
            const res = await authFetch(
                BackendServer + `admin/allocation/allocations/${hallId}/${confirmDeleteId}`,
                { method: "DELETE" }
            );
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Delete failed");
            setConfirmDeleteId(null);
            await fetchPending();
        } catch (e) {
            setError(e.message);
        } finally {
            setDeleting(false);
        }
    };

    if (!hallId) return (
        <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
            Hall information is not loaded yet.
        </p>
    );

    if (loading) return (
        <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>Loading…</p>
    );

    if (error) return (
        <p style={{ color: "var(--danger)", fontSize: "0.88rem" }}>{error}</p>
    );

    if (rows.length === 0) return (
        <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
            No pending allocations found.
        </p>
    );

    return (
        <div style={styles.tableWrap}>
            <table style={styles.table}>
                <thead>
                    <tr>
                        <th style={styles.th}>Name</th>
                        <th style={styles.th}>Student ID</th>
                        <th style={styles.th}>Room</th>
                        <th style={styles.th}>Contact</th>
                        <th style={styles.th}> </th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => (
                        <tr key={row.allocation_id}>
                            <td style={styles.td}>{row.name}</td>
                            <td style={styles.td}>{row.student_id}</td>
                            <td style={styles.td}>{row.room_number}</td>
                            <td style={styles.td}>{row.phone_number ?? "—"}</td>
                            <td style={styles.td}>
                                {confirmDeleteId !== row.allocation_id ? (
                                    <button
                                        type="button"
                                        style={styles.deleteBtn}
                                        onClick={() => setConfirmDeleteId(row.allocation_id)}
                                    >
                                        Delete
                                    </button>
                                ) : (
                                    <div style={styles.inlineConfirm}>
                                        <span style={styles.confirmLabel}>Remove?</span>
                                        <button
                                            type="button"
                                            style={styles.smallBtn}
                                            onClick={() => setConfirmDeleteId(null)}
                                        >
                                            No
                                        </button>
                                        <Button
                                            variant="danger"
                                            onClick={handleDelete}
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
    );
};

const styles = {
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
};

export default AdminPendingAllocation;
