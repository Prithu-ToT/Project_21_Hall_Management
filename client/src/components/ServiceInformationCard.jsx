import { useState, useEffect } from "react";
import { BackendServer } from "../App";
import Button from "./Button";

const PaidBadge = ({ paid }) => {
    const color = paid ? "var(--success)" : "#f59e0b";
    return (
        <span style={{
            display: "inline-block",
            padding: "2px 10px",
            borderRadius: "20px",
            fontSize: "0.78rem",
            fontWeight: 600,
            background: color + "22",
            color: color,
            border: `1px solid ${color}55`,
            whiteSpace: "nowrap",
        }}>
            {paid ? "Paid" : "Unpaid"}
        </span>
    );
};

export default function ServiceInformationCard({ username }) {
    const [services, setServices]   = useState([]);
    const [loading, setLoading]     = useState(false);
    const [error, setError]         = useState(null);

    // tracks which service_id has its pay form open
    const [activePayId, setActivePayId]     = useState(null);
    const [txnId, setTxnId]                 = useState("");
    const [amount, setAmount]               = useState("");
    const [paying, setPaying]               = useState(false);
    const [payError, setPayError]           = useState(null);

    const fetchServices = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(BackendServer + `student/services/${username}`);
            if (!res.ok) throw new Error("Failed to fetch services");
            const data = await res.json();
            setServices(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (username) fetchServices();
    }, [username]);

    const handleOpenPay = (service) => {
        setActivePayId(service.service_id);
        setAmount(service.service_fee_amount); // pre-fill with the billed amount
        setTxnId("");
        setPayError(null);
    };

    const handleCancelPay = () => {
        setActivePayId(null);
        setTxnId("");
        setAmount("");
        setPayError(null);
    };

    const handlePaySubmit = async (service_id) => {
        if (!txnId.trim() || !amount) {
            setPayError("Please fill in all fields");
            return;
        }
        setPaying(true);
        setPayError(null);
        try {
            const res = await fetch(BackendServer + "student/services/pay", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    service_id,
                    amount_paid:          parseFloat(amount),
                    bank_transaction_id:  txnId.trim(),
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                setPayError(data.message || "Payment failed");
                return;
            }
            handleCancelPay();
            await fetchServices();
        } catch {
            setPayError("An error occurred. Please try again.");
        } finally {
            setPaying(false);
        }
    };

    if (loading) return <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", padding: "0.5rem 0" }}>Loading…</p>;
    if (error)   return <p style={{ color: "var(--danger)",    fontSize: "0.88rem", padding: "0.5rem 0" }}>{error}</p>;
    if (services.length === 0) return <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", padding: "0.5rem 0" }}>No services found.</p>;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {services.map((s) => (
                <div key={s.service_id}>
                    <div style={styles.serviceRow}>
                        <div style={styles.serviceLeft}>
                            <span style={styles.serviceName}>{s.service_name}</span>
                            <span style={styles.servicePeriod}>
                                {s.service_period_start} → {s.service_period_end}
                            </span>
                        </div>
                        <div style={styles.serviceRight}>
                            <span style={styles.serviceAmount}>৳ {s.service_fee_amount}</span>
                            <PaidBadge paid={s.paid} />
                            {!s.paid && (
                                <Button
                                    variant={activePayId === s.service_id ? "outline-danger" : "outline-primary"}
                                    onClick={() => activePayId === s.service_id ? handleCancelPay() : handleOpenPay(s)}
                                >
                                    {activePayId === s.service_id ? "Cancel" : "Pay Bill"}
                                </Button>
                            )}
                        </div>
                    </div>

                    {activePayId === s.service_id && (
                        <div style={styles.payForm}>
                            <input
                                type="text"
                                placeholder="Bank Transaction ID"
                                value={txnId}
                                onChange={e => setTxnId(e.target.value)}
                                style={styles.payInput}
                            />
                            <input
                                type="number"
                                placeholder="Amount"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                style={styles.payInput}
                            />
                            {payError && <p style={{ color: "var(--danger)", fontSize: "0.82rem", margin: "2px 0" }}>{payError}</p>}
                            <Button
                                variant="primary"
                                onClick={() => handlePaySubmit(s.service_id)}
                                disabled={paying}
                            >
                                {paying ? "Submitting…" : "Confirm Payment"}
                            </Button>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

const styles = {
    serviceRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0.75rem 1rem",
        background: "var(--surface-2)",
        borderRadius: "var(--radius-sm)",
        border: "1px solid var(--border)",
        gap: "1rem",
    },
    serviceLeft: {
        display: "flex",
        flexDirection: "column",
        gap: "2px",
        minWidth: 0,
    },
    serviceName: {
        fontSize: "0.95rem",
        fontWeight: 600,
        color: "var(--text-primary)",
    },
    servicePeriod: {
        fontSize: "0.78rem",
        color: "var(--text-muted)",
    },
    serviceRight: {
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: "4px",
        flexShrink: 0,
    },
    serviceAmount: {
        fontSize: "0.9rem",
        fontWeight: 600,
        color: "var(--navy)",
    },
    payForm: {
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        marginTop: "0.4rem",
        padding: "1rem",
        background: "var(--surface-2)",
        borderRadius: "var(--radius-sm)",
        border: "1px solid var(--border)",
    },
    payInput: {
        padding: "0.5rem 0.75rem",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-sm)",
        fontSize: "0.88rem",
        background: "var(--surface)",
        color: "var(--text-primary)",
        outline: "none",
    },
};