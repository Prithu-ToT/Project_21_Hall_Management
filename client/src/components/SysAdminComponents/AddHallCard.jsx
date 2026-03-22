import { useState } from "react";
import Button from "../Button";
import TextInput from "../TextInput";
import { BackendServer } from "../../App";

const AddHallCard = () => {
    const [hallName, setHallName] = useState("");
    const [password, setPassword] = useState("");
    const [loading,  setLoading]  = useState(false);
    const [error,    setError]    = useState(null);
    const [success,  setSuccess]  = useState(null);

    const handleSubmit = async () => {
        setError(null);
        setSuccess(null);

        if (!hallName.trim() || !password) {
            setError("All fields are required.");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(BackendServer + "sysadmin/add-hall", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    hallName: hallName.trim(),
                    password,
                }),
            });
            const data = await response.json();
            if (!response.ok) {
                setError(data.message || "Failed to create hall.");
            } else {
                setSuccess(`Hall "${hallName.trim()}" created (ID: ${data.hall_id}).`);
                setHallName("");
                setPassword("");
            }
        } catch {
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.wrapper}>
            <TextInput
                label="Hall Name"
                value={hallName}
                onChange={(e) => setHallName(e.target.value)}
                placeholder="e.g. Shaheed Smriti Hall"
            />
            <TextInput
                label="Initial Admin Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Set a password for this hall's admin"
            />

            {error   && <p style={{ color: "var(--danger)",  fontSize: "0.83rem", margin: "0.25rem 0" }}>{error}</p>}
            {success && <p style={{ color: "var(--success)", fontSize: "0.83rem", margin: "0.25rem 0" }}>{success}</p>}

            <Button
                variant="primary"
                className="w-100"
                onClick={handleSubmit}
                disabled={loading}
            >
                {loading ? "Creating…" : "Create Hall"}
            </Button>
        </div>
    );
};

const styles = {
    wrapper: {
        display: "flex",
        flexDirection: "column",
        gap: "0.25rem",
    },
};

export default AddHallCard;
