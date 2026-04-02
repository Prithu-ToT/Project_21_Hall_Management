import { useState, useEffect, useMemo } from "react";
import { BackendServer } from "../../App";
import { authFetch } from "../../authFetch";
import Button from "../Button";
import TextInput from "../TextInput";

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

    // --- Add Service form ---
    const [showAddForm, setShowAddForm] = useState(false);
    const [addStudentId, setAddStudentId] = useState("");
    const [addServiceName, setAddServiceName] = useState("");
    const [addPeriodStart, setAddPeriodStart] = useState("");
    const [addPeriodEnd, setAddPeriodEnd] = useState("");
    const [addFeeAmount, setAddFeeAmount] = useState("");
    const [addError, setAddError] = useState(null);
    const [adding, setAdding] = useState(false);
    const [addForAllLoading, setAddForAllLoading] = useState(false);

    const loadServiceNames = async () => {
        if (!hallId) return;
        setNamesLoading(true);
        setNamesError(null);
        try {
            const res = await authFetch(BackendServer + `admin/service/names/${hallId}`);
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
            const res = await authFetch(
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
            const res = await authFetch(
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

    const validateServiceFields = () => {
        if (!addServiceName.trim()) return "Service name is required.";
        if (!addPeriodStart) return "Period start is required.";
        if (!addPeriodEnd) return "Period end is required.";
        const fee = parseFloat(addFeeAmount);
        if (isNaN(fee) || fee < 0) return "Enter a valid non-negative fee.";
        if (addPeriodStart > addPeriodEnd) return "Period end must be on or after period start.";
        return null;
    };

    const handleAddService = async () => {
        const err = validateServiceFields();
        if (err) {
            setAddError(err);
            return;
        }
        const sid = addStudentId.trim();
        if (!sid) {
            setAddError("Student ID is required for adding to one student.");
            return;
        }
        setAdding(true);
        setAddError(null);
        try {
            const res = await authFetch(BackendServer + "admin/service", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    hallId: Number(hallId),
                    student_id: sid,
                    service_name: addServiceName.trim(),
                    service_period_start: addPeriodStart,
                    service_period_end: addPeriodEnd,
                    service_fee_amount: parseFloat(addFeeAmount),
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                setAddError(data.message || "Failed to add service.");
                return;
            }
            setShowAddForm(false);
            resetAddForm();
            loadServiceNames();
            if (selectedName) loadServicesByName(selectedName);
        } catch {
            setAddError("Network error.");
        } finally {
            setAdding(false);
        }
    };

    const handleAddForAll = async () => {
        const err = validateServiceFields();
        if (err) {
            setAddError(err);
            return;
        }
        setAddForAllLoading(true);
        setAddError(null);
        try {
            const res = await authFetch(BackendServer + "admin/service/add-for-all", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    hallId: Number(hallId),
                    service_name: addServiceName.trim(),
                    service_period_start: addPeriodStart,
                    service_period_end: addPeriodEnd,
                    service_fee_amount: parseFloat(addFeeAmount),
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                setAddError(data.message || "Failed to add service for all.");
                return;
            }
            setShowAddForm(false);
            resetAddForm();
            loadServiceNames();
            if (selectedName) loadServicesByName(selectedName);
        } catch {
            setAddError("Network error.");
        } finally {
            setAddForAllLoading(false);
        }
    };

    const resetAddForm = () => {
        setAddStudentId("");
        setAddServiceName("");
        setAddPeriodStart("");
        setAddPeriodEnd("");
        setAddFeeAmount("");
        setAddError(null);
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

            {/* ── Add Services ── */}
            <section>
                <h3 style={styles.sectionTitle}>Add Services</h3>
                {showAddForm ? (
                    <div style={styles.addForm}>
                        <TextInput
                            label="Student ID"
                            value={addStudentId}
                            onChange={(e) => setAddStudentId(e.target.value)}
                            placeholder="Required for adding to one student"
                        />
                        <TextInput
                            label="Service Name"
                            value={addServiceName}
                            onChange={(e) => setAddServiceName(e.target.value)}
                            placeholder="e.g. Laundry"
                        />
                        <div style={styles.row}>
                            <TextInput
                                label="Period Start"
                                type="date"
                                value={addPeriodStart}
                                onChange={(e) => setAddPeriodStart(e.target.value)}
                            />
                            <TextInput
                                label="Period End"
                                type="date"
                                value={addPeriodEnd}
                                onChange={(e) => setAddPeriodEnd(e.target.value)}
                            />
                        </div>
                        <TextInput
                            label="Fee Amount"
                            type="number"
                            value={addFeeAmount}
                            onChange={(e) => setAddFeeAmount(e.target.value)}
                            placeholder="e.g. 500"
                        />
                        {addError && (
                            <p style={{ color: "var(--danger)", fontSize: "0.85rem", margin: "0.5rem 0" }}>
                                {addError}
                            </p>
                        )}
                        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                            <Button
                                variant="outline-primary"
                                onClick={() => {
                                    setShowAddForm(false);
                                    resetAddForm();
                                }}
                                disabled={adding || addForAllLoading}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleAddService}
                                disabled={adding || addForAllLoading}
                            >
                                {adding ? "Adding…" : "Add for this student"}
                            </Button>
                            <Button
                                variant="outline-primary"
                                onClick={handleAddForAll}
                                disabled={adding || addForAllLoading}
                            >
                                {addForAllLoading ? "Adding…" : "Add for all"}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <Button
                        variant="outline-primary"
                        onClick={() => {
                            setShowAddForm(true);
                            setAddError(null);
                        }}
                        style={{ width: "100%" }}
                    >
                        + Add Service
                    </Button>
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
    addForm: {
        background: "var(--surface-2)",
        borderRadius: "var(--radius)",
        padding: "1.25rem",
        border: "1px solid var(--border)",
    },
};

export default AdminServiceCard;
