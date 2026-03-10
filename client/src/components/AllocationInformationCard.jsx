import { useState, useEffect } from "react";
import { BackendServer } from "../App";
import Button from "./Button";

const InfoRow = ({ label, value = "—" }) => (
    <div style={styles.infoRow}>
        <span style={styles.label}>{label}</span>
        <span style={styles.value}>{value}</span>
    </div>
);

const StatusBadge = ({ status }) => {
    const color = status === "ACTIVE" ? "var(--success)" : "#f59e0b";
    return (
        <span style={{
            display: "inline-block",
            padding: "2px 10px",
            borderRadius: "20px",
            fontSize: "0.8rem",
            fontWeight: 600,
            marginTop: "2px",
            background: color + "22",
            color: color,
            border: `1px solid ${color}55`,
        }}>
            {status}
        </span>
    );
};

export default function AllocationInformationCard({ username }) {
    const [allocation, setAllocation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [showPayForm, setShowPayForm] = useState(false);
    const [txnId, setTxnId] = useState("");
    const [paying, setPaying] = useState(false);
    const [payError, setPayError] = useState(null);

    const fetchAllocation = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(BackendServer + `student/allocation/${username}`);
            if (!res.ok) throw new Error("Failed to fetch allocation info");
            const data = await res.json();
            setAllocation(data);         // null if student has no allocation
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (username) fetchAllocation();
    }, [username]);

    const handlePaySubmit = async () => {
        if (!txnId.trim()) {
            setPayError("Please enter a transaction ID");
            return;
        }
        setPaying(true);
        setPayError(null);
        try {
            const res = await fetch(BackendServer + "student/pay-seat-fee", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    allocation_id: allocation.allocation_id,
                    bank_transaction_id: txnId.trim(),
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                setPayError(data.message || "Invalid Transaction ID");
                return;
            }
            // Trigger on DB side changes status to ACTIVE after insert
            setShowPayForm(false);
            setTxnId("");
            await fetchAllocation();
        } catch (err) {
            setPayError("An error occurred. Please try again.");
        } finally {
            setPaying(false);
        }
    };

    const handleBackFromPay = () => {
        setShowPayForm(false);
        setTxnId("");
        setPayError(null);
    };

    if (loading) return (
        <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", padding: "0.5rem 0" }}>Loading…</p>
    );
    if (error) return (
        <p style={{ color: "var(--danger)", fontSize: "0.88rem", padding: "0.5rem 0" }}>{error}</p>
    );
    if (!allocation) return (
        <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", padding: "0.5rem 0" }}>No allocation found.</p>
    );

    // --- Pay Fee form view ---
    if (showPayForm) {
        return (
            <div style={styles.payForm}>
                <p style={styles.payTitle}>Enter Bank Transaction ID</p>
                <p style={styles.payHint}>
                    Provide the unique transaction ID from your bank payment receipt.
                </p>
                <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. TXN123456"
                    value={txnId}
                    onChange={(e) => setTxnId(e.target.value)}
                    style={{ marginBottom: "0.75rem" }}
                />
                {payError && (
                    <p style={{ color: "var(--danger)", fontSize: "0.85rem", marginBottom: "0.75rem" }}>
                        {payError}
                    </p>
                )}
                <div style={{ display: "flex", gap: "10px" }}>
                    <Button variant="outline-primary" onClick={handleBackFromPay} className="flex-fill">
                        ← Back
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handlePaySubmit}
                        className="flex-fill"
                        disabled={paying}
                    >
                        {paying ? "Processing…" : "Confirm Payment"}
                    </Button>
                </div>
            </div>
        );
    }

    // --- Main allocation info view ---
    return (
        <div>
            <div style={styles.infoGrid}>
                <InfoRow label="Hall" value={allocation.hall_name} />
                <InfoRow label="Room" value={allocation.room_number} />
                <InfoRow label="Since" value={allocation.start_date} />
                <div style={styles.infoRow}>
                    <span style={styles.label}>Status</span>
                    <StatusBadge status={allocation.status} />
                </div>
            </div>

            {allocation.status === "PENDING" && (
                <Button
                    variant="primary"
                    onClick={() => setShowPayForm(true)}
                    style={{ marginTop: "1.25rem", width: "100%" }}
                >
                    Pay Seat Fee
                </Button>
            )}
        </div>
    );
}

const styles = {
    infoGrid: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "0.5rem 1rem",
    },
    infoRow: {
        display: "flex",
        flexDirection: "column",
        gap: "2px",
        padding: "0.6rem 0.75rem",
        background: "var(--surface-2)",
        borderRadius: "var(--radius-sm)",
    },
    label: {
        fontSize: "0.72rem",
        fontWeight: 600,
        color: "var(--text-muted)",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
    },
    value: {
        fontSize: "0.95rem",
        fontWeight: 500,
        color: "var(--text-primary)",
    },
    payForm: {
        background: "var(--surface-2)",
        borderRadius: "var(--radius)",
        padding: "1.5rem",
        border: "1px solid var(--border)",
    },
    payTitle: {
        fontFamily: "'Sora', sans-serif",
        fontWeight: 600,
        fontSize: "0.95rem",
        color: "var(--navy)",
        marginBottom: "0.4rem",
    },
    payHint: {
        fontSize: "0.82rem",
        color: "var(--text-muted)",
        marginBottom: "1rem",
    },
};
