import { useState } from "react";
import Button from "../Button";
import TextInput from "../TextInput";
import { BackendServer } from "../../App";
import { authFetch } from "../../authFetch";

const AddStudentCard = () => {
    const [nid, setNid] = useState("");
    const [name, setName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [department, setDepartment] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleSubmit = async () => {
        setError(null);
        setSuccess(null);

        if (!nid.trim() || !name.trim() || !phoneNumber.trim() || !department.trim()) {
            setError("All fields are required.");
            return;
        }

        setLoading(true);
        try {
            const response = await authFetch(BackendServer + "sysadmin/add-student", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nid: nid.trim(),
                    name: name.trim(),
                    phone_number: phoneNumber.trim(),
                    department: department.trim(),
                }),
            });
            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Failed to add student.");
            } else {
                setSuccess(`Student added. ID = "${data.student_id}", temp_password = "${data.temp_password}"`);
                setNid("");
                setName("");
                setPhoneNumber("");
                setDepartment("");
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
                label="NID"
                value={nid}
                onChange={(e) => setNid(e.target.value)}
                placeholder="e.g. 1234567890123456"
            />
            <TextInput
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rahim Uddin"
            />
            <TextInput
                label="Phone Number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g. 017XXXXXXXX"
            />
            <TextInput
                label="Department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. CSE"
            />

            {error && <p style={{ color: "var(--danger)", fontSize: "0.83rem", margin: "0.25rem 0" }}>{error}</p>}
            {success && <p style={{ color: "var(--success)", fontSize: "0.83rem", margin: "0.25rem 0" }}>{success}</p>}

            <Button
                variant="primary"
                className="w-100"
                onClick={handleSubmit}
                disabled={loading}
            >
                {loading ? "Adding..." : "Add Student"}
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

export default AddStudentCard;
