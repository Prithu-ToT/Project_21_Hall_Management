import { useState, useEffect } from "react";
import { BackendServer } from "../App";

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
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
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
        if (username) fetchServices();
    }, [username]);

    if (loading) return (
        <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", padding: "0.5rem 0" }}>Loading…</p>
    );
    if (error) return (
        <p style={{ color: "var(--danger)", fontSize: "0.88rem", padding: "0.5rem 0" }}>{error}</p>
    );
    if (services.length === 0) return (
        <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", padding: "0.5rem 0" }}>No services found.</p>
    );

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {services.map((s) => (
                <div key={s.service_id} style={styles.serviceRow}>
                    <div style={styles.serviceLeft}>
                        <span style={styles.serviceName}>{s.service_name}</span>
                        <span style={styles.servicePeriod}>
                            {s.service_period_start} → {s.service_period_end}
                        </span>
                    </div>
                    <div style={styles.serviceRight}>
                        <span style={styles.serviceAmount}>৳ {s.service_fee_amount}</span>
                        <PaidBadge paid={s.paid} />
                    </div>
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
        minWidth: 0,             // lets long text truncate instead of blowing out the layout
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
};
