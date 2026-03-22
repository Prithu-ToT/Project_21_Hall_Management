import { useState, useEffect, useMemo } from "react";
import { BackendServer } from "../../App";
import Button from "../Button";

const StatusBadge = ({ status }) => {
    const color = status === "PAID" ? "var(--success)" : "#f59e0b";
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
 * Admin service management for one hall.
 * Backend (see adminRoutes.js):
 *   GET /admin/service/names/:hallId
 *   GET /admin/service/by-name/:hallId?name=
 *   GET /admin/service/by-student/:hallId/:studentId
 */
const AdminServiceCard = ({ hallId }) => {
    const [serviceNames, setServiceNames] = useState([]);
    const [namesLoading, setNamesLoading] = useState(false);
    const [namesError, setNamesError] = useState(null);

    // --- search by service name ---
    const [nameSearch, setNameSearch] = useState("");
    const [selectedName, setSelectedName] = useState(null);
    const [showNameDropdown, setShowNameDropdown] = useState(false);

    const [servicesByName, setServicesByName] = useState([]);
    const [byNameLoading, setByNameLoading] = useState(false);
    const [byNameError, setByNameError] = useState(null);

    // --- search by student ---
    const [studentLookupId, setStudentLookupId] = useState("");
    const [lookupLoading, setLookupLoading] = useState(false);
    const [lookupError, setLookupError] = useState(null);
    const [servicesByStudent, setServicesByStudent] = useState([]);

    const loadServiceNames = async () => {
        if (!hallId) return;
        setNamesLoading(true);
        setNamesError(null);
        try {
            const res = await fetch(BackendServer + `admin/service/names/${hallId}`);
            if (!res.ok) throw new Error("Failed to load service names");
            const data = await res.json();
            setServiceNames(data);
        } catch (e) {
            setNamesError(e.message);
        } finally {
            setNamesLoading(false);
        }
    };

    useEffect(() => {
        loadServiceNames();
    }, [hallId]);

    const filteredNames = useMemo(() => {
        const q = nameSearch.trim().toLowerCase();
        if (!q) return serviceNames;
        return serviceNames.filter((n) =>
            String(n).toLowerCase().includes(q)
        );
    }, [serviceNames, nameSearch]);

    const loadServicesByName = async (name) => {
        if (!hallId || !name) return;
        setByNameLoading(true);
        setByNameError(null);
        setServicesByName([]);
        try {
            const res = await fetch(
                BackendServer + `admin/service/by-name/${hallId}?name=${encodeURIComponent(name)}`
            );
            if (!res.ok) throw new Error("Failed to load services");
            const data = await res.json();
            setServicesByName(data);
        } catch (e) {
            setByNameError(e.message);
        } finally {
            setByNameLoading(false);
        }
    };

    const handleSelectName = (name) => {
        setSelectedName(name);
        setNameSearch(name);
        setShowNameDropdown(false);
        loadServicesByName(name);
    };

    const handleStudentLookup = async () => {
        const sid = studentLookupId.trim();
        if (!sid || !hallId) {
            setLookupError("Enter a student ID.");
            return;
        }
        setLookupLoading(true);
        setLookupError(null);
        setServicesByStudent([]);
        try {
            const res = await fetch(
                BackendServer + `admin/service/by-student/${hallId}/${encodeURIComponent(sid)}`
            );
            if (!res.ok) {
                const data = await res.json();
                setLookupError(data.message || "Lookup failed.");
                return;
            }
            const data = await res.json();
            setServicesByStudent(data);
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
                    Enter a student ID to see their services in this hall.
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
                        {lookupLoading ? "Searching…" : "Find services"}
                    </Button>
                </div>
                {lookupError && (
                    <p style={{ color: "var(--danger)", fontSize: "0.85rem", marginTop: "0.5rem" }}>
                        {lookupError}
                    </p>
                )}
                {servicesByStudent.length > 0 && (
                    <div style={styles.tableWrap}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Service</th>
                                    <th style={styles.th}>Period</th>
                                    <th style={styles.th}>Room</th>
                                    <th style={styles.th}>Fee</th>
                                    <th style={styles.th}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {servicesByStudent.map((row, i) => (
                                    <tr key={i}>
                                        <td style={styles.td}>{row.service_name}</td>
                                        <td style={styles.td}>
                                            {row.service_period_start} — {row.service_period_end}
                                        </td>
                                        <td style={styles.td}>{row.room_number}</td>
                                        <td style={styles.td}>{row.service_fee_amount}</td>
                                        <td style={styles.td}>
                                            <StatusBadge status={row.status} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                {!lookupLoading && !lookupError && servicesByStudent.length === 0 && studentLookupId.trim() && (
                    <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginTop: "0.5rem" }}>
                        No services found for this student in this hall.
                    </p>
                )}
            </section>

            {/* ── Search by service name ── */}
            <section>
                <h3 style={styles.sectionTitle}>Search by service name</h3>
                <p style={styles.hint}>
                    Type a service name and pick from the list. Shows all students with that service.
                </p>

                {namesLoading && (
                    <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>Loading service names…</p>
                )}
                {namesError && (
                    <p style={{ color: "var(--danger)", fontSize: "0.88rem" }}>{namesError}</p>
                )}

                {!namesLoading && !namesError && (
                    <div style={{ position: "relative" }}>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search service name…"
                            value={nameSearch}
                            onChange={(e) => {
                                setNameSearch(e.target.value);
                                setSelectedName(null);
                                setServicesByName([]);
                                setShowNameDropdown(true);
                            }}
                            onFocus={() => setShowNameDropdown(true)}
                            onBlur={() => setTimeout(() => setShowNameDropdown(false), 120)}
                        />
                        {showNameDropdown && filteredNames.length > 0 && (
                            <div style={styles.dropdown}>
                                {filteredNames.map((name) => (
                                    <div
                                        key={name}
                                        style={styles.dropdownItem}
                                        onMouseDown={() => handleSelectName(name)}
                                    >
                                        {name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {selectedName && (
                    <div style={{ marginTop: "1rem" }}>
                        <p style={styles.selectedBanner}>
                            Selected: <strong>{selectedName}</strong>
                        </p>

                        {byNameLoading && (
                            <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
                                Loading services…
                            </p>
                        )}
                        {byNameError && (
                            <p style={{ color: "var(--danger)", fontSize: "0.88rem" }}>{byNameError}</p>
                        )}

                        {!byNameLoading && !byNameError && (
                            <>
                                {servicesByName.length === 0 ? (
                                    <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
                                        No services found with this name.
                                    </p>
                                ) : (
                                    <div style={styles.tableWrap}>
                                        <table style={styles.table}>
                                            <thead>
                                                <tr>
                                                    <th style={styles.th}>Student</th>
                                                    <th style={styles.th}>Room</th>
                                                    <th style={styles.th}>Period</th>
                                                    <th style={styles.th}>Fee</th>
                                                    <th style={styles.th}>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {servicesByName.map((row, i) => (
                                                    <tr key={i}>
                                                        <td style={styles.td}>
                                                            {row.student_name} ({row.student_id})
                                                        </td>
                                                        <td style={styles.td}>{row.room_number}</td>
                                                        <td style={styles.td}>
                                                            {row.service_period_start} — {row.service_period_end}
                                                        </td>
                                                        <td style={styles.td}>{row.service_fee_amount}</td>
                                                        <td style={styles.td}>
                                                            <StatusBadge status={row.status} />
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </section>
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
        overflowX: "auto",
        borderRadius: "var(--radius-sm)",
        border: "1px solid var(--border)",
        marginTop: "0.5rem",
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
};

export default AdminServiceCard;
