import { useState, useEffect } from "react";
import Button from "../Button";
import TextInput from "../TextInput";
import { BackendServer } from "../../App";

const AddRoomCard = () => {
    const [halls,       setHalls]       = useState([]);
    const [hallsError,  setHallsError]  = useState(null);
    const [selectedHall, setSelectedHall] = useState(null);
    const [roomNumber,  setRoomNumber]  = useState("");
    const [capacity,    setCapacity]    = useState("");
    const [loading,     setLoading]     = useState(false);
    const [error,       setError]       = useState(null);
    const [success,     setSuccess]     = useState(null);

    useEffect(() => {
        const fetchHalls = async () => {
            try {
                const res = await fetch(BackendServer + "sysadmin/halls");
                if (!res.ok) throw new Error("Failed to load halls.");
                const data = await res.json();
                setHalls(data);
            } catch {
                setHallsError("Could not load hall list.");
            }
        };
        fetchHalls();
    }, []);

    const handleSubmit = async () => {
        setError(null);
        setSuccess(null);

        if (!selectedHall) {
            setError("Please select a hall.");
            return;
        }
        if (!roomNumber.trim()) {
            setError("Room number is required.");
            return;
        }
        if (!capacity || isNaN(capacity) || Number(capacity) <= 0) {
            setError("Capacity must be a positive number.");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(BackendServer + "sysadmin/add-room", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    hallId:     selectedHall.hall_id,
                    roomNumber: roomNumber.trim(),
                    capacity:   Number(capacity),
                }),
            });
            const data = await response.json();
            if (!response.ok) {
                setError(data.message || "Failed to create room.");
            } else {
                setSuccess(`Room "${roomNumber.trim()}" added to ${selectedHall.hall_name}.`);
                setRoomNumber("");
                setCapacity("");
                setSelectedHall(null);
            }
        } catch {
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.wrapper}>
            {/* Hall Dropdown */}
            <div style={styles.fieldGroup}>
                <label style={styles.fieldLabel}>Hall</label>
                {hallsError ? (
                    <p style={{ color: "var(--danger)", fontSize: "0.83rem" }}>{hallsError}</p>
                ) : (
                    <select
                        style={styles.select}
                        value={selectedHall?.hall_id ?? ""}
                        onChange={(e) => {
                            const found = halls.find(h => h.hall_id === Number(e.target.value));
                            setSelectedHall(found ?? null);
                        }}
                    >
                        <option value="" disabled>Select a hall…</option>
                        {halls.map((h) => (
                            <option key={h.hall_id} value={h.hall_id}>
                                {h.hall_name}
                            </option>
                        ))}
                    </select>
                )}
            </div>

            <TextInput
                label="Room Number"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                placeholder="e.g. 301"
            />
            <TextInput
                label="Capacity"
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                placeholder="e.g. 4"
            />

            {error   && <p style={{ color: "var(--danger)",  fontSize: "0.83rem", margin: "0.25rem 0" }}>{error}</p>}
            {success && <p style={{ color: "var(--success)", fontSize: "0.83rem", margin: "0.25rem 0" }}>{success}</p>}

            <Button
                variant="primary"
                className="w-100"
                onClick={handleSubmit}
                disabled={loading}
            >
                {loading ? "Adding…" : "Add Room"}
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
    fieldGroup: {
        display: "flex",
        flexDirection: "column",
        gap: "0.4rem",
        marginBottom: "0.5rem",
    },
    fieldLabel: {
        fontSize: "0.85rem",
        fontWeight: 600,
        color: "var(--text-secondary)",
        textTransform: "uppercase",
        letterSpacing: "0.02em",
        fontFamily: "'DM Sans', sans-serif",
    },
    select: {
        border: "1.5px solid var(--border)",
        borderRadius: "var(--radius-sm)",
        padding: "0.65rem 1rem",
        fontFamily: "'DM Sans', sans-serif",
        fontSize: "0.95rem",
        color: "var(--text-primary)",
        backgroundColor: "#fff",
        width: "100%",
        cursor: "pointer",
        outline: "none",
        transition: "border-color 0.2s, box-shadow 0.2s",
    },
};

export default AddRoomCard;
