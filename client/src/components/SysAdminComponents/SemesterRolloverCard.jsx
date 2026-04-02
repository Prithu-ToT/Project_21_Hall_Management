import { useState } from "react";
import Button from "../Button";
import { BackendServer } from "../../App";
import { authFetch } from "../../authFetch";

const SemesterRolloverCard = () => {
    const [loading, setLoading] = useState(false);
    const [error,   setError]   = useState(null);
    const [success, setSuccess] = useState(false);

    const handleRollover = async () => {
        setError(null);
        setSuccess(false);

        if (!window.confirm(
            "This will run the semester rollover procedure across ALL halls.\n\nThis action cannot be undone. Proceed?"
        )) return;

        setLoading(true);
        try {
            const response = await authFetch(BackendServer + "sysadmin/semester-rollover", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });
            const data = await response.json();
            if (!response.ok) {
                setError(data.message || "Rollover failed.");
            } else {
                setSuccess(true);
            }
        } catch {
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.wrapper}>
            <p style={styles.description}>
                Runs the semester rollover procedure globally across all halls.
                This affects all active allocations and cannot be undone.
            </p>

            {error   && <p style={{ color: "var(--danger)",  fontSize: "0.83rem", marginBottom: "0.75rem" }}>{error}</p>}
            {success && <p style={{ color: "var(--success)", fontSize: "0.83rem", marginBottom: "0.75rem" }}>Semester rollover completed successfully.</p>}

            <Button
                variant="danger"
                className="w-100"
                onClick={handleRollover}
                disabled={loading}
            >
                {loading ? "Processing…" : "Run Semester Rollover"}
            </Button>
        </div>
    );
};

const styles = {
    wrapper: {
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
    },
    description: {
        fontSize: "0.88rem",
        color: "var(--text-muted)",
        lineHeight: 1.6,
        marginBottom: "0.75rem",
    },
};

export default SemesterRolloverCard;
