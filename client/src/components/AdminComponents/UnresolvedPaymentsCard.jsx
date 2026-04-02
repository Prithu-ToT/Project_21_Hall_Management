import { useState } from "react";
import { BackendServer } from "../../App";
import { authFetch } from "../../authFetch";
import Button from "../Button";

const ResolutionBadge = ({ status }) => {
    const color = status === "UNDERPAID" ? "#f59e0b" : "#8b5cf6";
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
            whiteSpace: "nowrap",
        }}>
            {status}
        </span>
    );
};

const TABS = { SEAT_FEES: "SEAT_FEES", SERVICES: "SERVICES" };

const UnresolvedPaymentsCard = () => {
    const [activeTab, setActiveTab] = useState(null);
    const [rows, setRows]           = useState([]);
    const [loading, setLoading]     = useState(false);
    const [error, setError]         = useState(null);

    // only one row can have the refund form open at a time
    const [refundingId, setRefundingId] = useState(null);  // allocation_id or service_id
    const [refundTxnId, setRefundTxnId] = useState("");
    const [refundError, setRefundError] = useState(null);
    const [refunding, setRefunding]     = useState(false);

    const fetchRows = async (tab) => {
        const endpoint = tab === TABS.SEAT_FEES
            ? "admin/unresolved/seat-fees"
            : "admin/unresolved/services";
        setLoading(true);
        setError(null);
        try {
            // hallId is read server-side from the JWT, no need to pass it here
            const res = await authFetch(BackendServer + endpoint);
            if (!res.ok) throw new Error("Failed to load data");
            const data = await res.json();
            setRows(data);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const loadTab = (tab) => {
        if (tab === activeTab) return;
        setActiveTab(tab);
        setRows([]);
        setRefundingId(null);
        setRefundTxnId("");
        setRefundError(null);
        fetchRows(tab);
    };

    const handleRefundSubmit = async (row) => {
        if (!refundTxnId.trim()) {
            setRefundError("Bank transaction ID is required.");
            return;
        }
        setRefunding(true);
        setRefundError(null);

        const isSeatFee = activeTab === TABS.SEAT_FEES;
        const endpoint = isSeatFee
            ? "admin/unresolved/refund/seat-fee"
            : "admin/unresolved/refund/service";
        const body = isSeatFee
            ? { allocation_id: row.allocation_id, bank_transaction_id: refundTxnId.trim() }
            : { service_id: row.service_id,       bank_transaction_id: refundTxnId.trim() };

        try {
            // post negative payment record to cancel the overpaid amount
            const res = await authFetch(BackendServer + endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (!res.ok) {
                setRefundError(data.message || "Refund failed.");
                return;
            }
            setRefundingId(null);
            setRefundTxnId("");
            // reload table so the refunded row disappears if now resolved
            await fetchRows(activeTab);
        } catch {
            setRefundError("Network error.");
        } finally {
            setRefunding(false);
        }
    };

    const cancelRefund = () => {
        setRefundingId(null);
        setRefundTxnId("");
        setRefundError(null);
    };

    // allocation_id for seat fees, service_id for services
    const rowKey = (row) => activeTab === TABS.SEAT_FEES ? row.allocation_id : row.service_id;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

            {/* Tab switcher — clicking the inactive tab loads it, active tab does nothing */}
            <div style={styles.tabRow}>
                <Button
                    variant={activeTab === TABS.SEAT_FEES ? "primary" : "outline-primary"}
                    onClick={() => loadTab(TABS.SEAT_FEES)}
                    className="flex-fill"
                >
                    Seat Fees
                </Button>
                <Button
                    variant={activeTab === TABS.SERVICES ? "primary" : "outline-primary"}
                    onClick={() => loadTab(TABS.SERVICES)}
                    className="flex-fill"
                >
                    Services
                </Button>
            </div>

            {!activeTab && (
                <p style={styles.hint}>Select a category above to view unresolved payments.</p>
            )}
            {loading && (
                <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>Loading…</p>
            )}
            {error && (
                <p style={{ color: "var(--danger)", fontSize: "0.88rem" }}>{error}</p>
            )}
            {!loading && !error && activeTab && rows.length === 0 && (
                <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>No unresolved payments found.</p>
            )}

            {!loading && !error && rows.length > 0 && (
                <div style={styles.tableWrap}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>Student ID</th>
                                <th style={styles.th}>
                                    {activeTab === TABS.SEAT_FEES ? "Room" : "Service"}
                                </th>
                                <th style={styles.th}>Required</th>
                                <th style={styles.th}>Paid</th>
                                <th style={styles.th}>Diff</th>
                                <th style={styles.th}>Status</th>
                                <th style={styles.th}> </th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.flatMap((row) => {
                                const required = activeTab === TABS.SEAT_FEES
                                    ? row.seat_fee
                                    : row.service_fee_amount;
                                const diff     = (row.paid_amount - required).toFixed(2);
                                const id       = rowKey(row);
                                const isOpen   = refundingId === id;

                                const mainRow = (
                                    <tr key={id}>
                                        <td style={styles.td}>{row.student_id}</td>
                                        <td style={styles.td}>
                                            {activeTab === TABS.SEAT_FEES ? row.room_number : row.service_name}
                                        </td>
                                        <td style={styles.td}>{required}</td>
                                        <td style={styles.td}>{row.paid_amount}</td>
                                        <td style={{
                                            ...styles.td,
                                            color:      parseFloat(diff) < 0 ? "#f59e0b" : "#8b5cf6",
                                            fontWeight: 600,
                                        }}>
                                            {parseFloat(diff) > 0 ? `+${diff}` : diff}
                                        </td>
                                        <td style={styles.td}>
                                            <ResolutionBadge status={row.status} />
                                        </td>
                                        <td style={styles.td}>
                                            {row.status === "OVERPAID" && (
                                                <button
                                                    style={styles.refundBtn}
                                                    onClick={() => isOpen ? cancelRefund() : (setRefundingId(id), setRefundTxnId(""), setRefundError(null))}
                                                >
                                                    {isOpen ? "Cancel" : "Refund"}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );

                                // inline refund form expands below the row as a full-width cell
                                const refundRow = isOpen ? (
                                    <tr key={`${id}-refund`}>
                                        <td colSpan={7} style={styles.refundCell}>
                                            <div style={styles.refundForm}>
                                                <span style={styles.refundInfo}>
                                                    Refund amount: <strong>{Math.abs(parseFloat(diff)).toFixed(2)}</strong>
                                                </span>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Bank transaction ID for refund"
                                                    value={refundTxnId}
                                                    onChange={(e) => setRefundTxnId(e.target.value)}
                                                    style={{ flex: 1 }}
                                                />
                                                {refundError && (
                                                    <p style={{ color: "var(--danger)", fontSize: "0.82rem", margin: 0 }}>
                                                        {refundError}
                                                    </p>
                                                )}
                                                <Button
                                                    variant="primary"
                                                    onClick={() => handleRefundSubmit(row)}
                                                    disabled={refunding}
                                                >
                                                    {refunding ? "Processing…" : "Confirm Refund"}
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ) : null;

                                return refundRow ? [mainRow, refundRow] : [mainRow];
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

const styles = {
    tabRow: {
        display: "flex",
        gap: "10px",
    },
    hint: {
        fontSize: "0.82rem",
        color: "var(--text-muted)",
        lineHeight: 1.5,
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
        verticalAlign: "middle",
    },
    refundBtn: {
        background: "none",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-sm)",
        color: "#8b5cf6",
        cursor: "pointer",
        padding: "0.25rem 0.6rem",
        fontSize: "0.78rem",
        fontWeight: 600,
        fontFamily: "'DM Sans', sans-serif",
    },
    refundCell: {
        padding: "0.75rem",
        background: "rgba(139, 92, 246, 0.04)",
        borderBottom: "1px solid var(--border)",
    },
    refundForm: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        flexWrap: "wrap",
    },
    refundInfo: {
        fontSize: "0.85rem",
        color: "var(--text-secondary)",
        whiteSpace: "nowrap",
    },
};

export default UnresolvedPaymentsCard;