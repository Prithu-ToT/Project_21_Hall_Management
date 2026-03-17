import { useState, useEffect } from "react";
import Button from "../Button";
import Header from "../Header";
import { BackendServer } from "../../App";
import AllocationInformationCard from "./AllocationInformationCard";
import ServiceInformationCard from "./ServiceInformationCard";
import BookingInformationCard from "./BookingInformationCard";

const VIEWS = {
    NONE:       "NONE",
    ALLOCATION: "ALLOCATION",
    SERVICE:    "SERVICE",
    BOOKING:    "BOOKING",
};

const INFO_CARDS = [
    { view: VIEWS.ALLOCATION, label: "Allocation Info" },
    { view: VIEWS.SERVICE,    label: "Service Info"    },
    { view: VIEWS.BOOKING,    label: "Booking Info"    },
];

const CARD_TITLES = {
    [VIEWS.ALLOCATION]: "Hall Allocation",
    [VIEWS.SERVICE]:    "Resident Services",
    [VIEWS.BOOKING]:    "Room Bookings",
};

const InfoRow = ({ label, value = "—" }) => (
    <div style={styles.infoRow}>
        <span style={styles.label}>{label}</span>
        <span style={styles.value}>{value}</span>
    </div>
);

const StudentDashboard = ({ username, onLogout }) => {
    const [activeView, setActiveView] = useState(VIEWS.NONE);
    const [studentInfo, setStudentInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Change password state
    const [showPwForm, setShowPwForm]   = useState(false);
    const [currentPw, setCurrentPw]     = useState("");
    const [newPw, setNewPw]             = useState("");
    const [confirmPw, setConfirmPw]     = useState("");
    const [pwLoading, setPwLoading]     = useState(false);
    const [pwError, setPwError]         = useState(null);
    const [pwSuccess, setPwSuccess]     = useState(false);

    useEffect(() => {
        const fetchStudentInfo = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(BackendServer + `student/basic/${username}`);
                if (!response.ok) throw new Error("Failed to fetch student info");
                const data = await response.json();
                setStudentInfo(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        if (username) fetchStudentInfo();
    }, [username]);

    const handleViewToggle = (view) => {
        setActiveView((prev) => (prev === view ? VIEWS.NONE : view));
    };

    const handleChangePassword = async () => {
        if (!currentPw || !newPw || !confirmPw) {
            setPwError("All fields are required");
            return;
        }
        if (newPw !== confirmPw) {
            setPwError("New passwords do not match");
            return;
        }

        setPwLoading(true);
        setPwError(null);
        setPwSuccess(false);

        try {
            const res = await fetch(BackendServer + "student/change-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    student_id:       username,
                    current_password: currentPw,
                    new_password:     newPw,
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                setPwError(data.message || "Failed to change password");
                return;
            }
            setPwSuccess(true);
            setCurrentPw(""); setNewPw(""); setConfirmPw("");
            setTimeout(() => {
                setShowPwForm(false);
                setPwSuccess(false);
            }, 1500);
        } catch {
            setPwError("An error occurred. Please try again.");
        } finally {
            setPwLoading(false);
        }
    };

    const handleTogglePwForm = () => {
        setShowPwForm(prev => !prev);
        setPwError(null);
        setPwSuccess(false);
        setCurrentPw(""); setNewPw(""); setConfirmPw("");
    };

    const renderActiveCard = () => {
        switch (activeView) {
            case VIEWS.ALLOCATION: return <AllocationInformationCard username={username} />;
            case VIEWS.SERVICE:    return <ServiceInformationCard    username={username} />;
            case VIEWS.BOOKING:    return <BookingInformationCard    username={username} />;
            default:               return null;
        }
    };

    return (
        <div className="page-shell-top">
            <div style={styles.container} className="fade-up">
                <Header title="Student Dashboard" />

                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "0.75rem" }}>
                    <Button variant="outline-danger" onClick={onLogout}>
                        Sign Out
                    </Button>
                </div>

                {/* Student Information Card */}
                <div style={styles.card} className="fade-up fade-up-1">
                    <div style={styles.cardHeader}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                        </svg>
                        <h2 style={styles.cardTitle}>Student Information</h2>
                    </div>

                    {loading && <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>Loading…</p>}
                    {error   && <p style={{ color: "var(--danger)",    fontSize: "0.88rem" }}>{error}</p>}

                    <div style={styles.infoGrid}>
                        <InfoRow label="Student ID"  value={username}                />
                        <InfoRow label="Name"        value={studentInfo?.name}       />
                        <InfoRow label="Department"  value={studentInfo?.department} />
                        <InfoRow label="Semester"    value={studentInfo?.semester}   />
                    </div>

                    {/* Change Password */}
                    <div style={{ marginTop: "1rem" }}>
                        <Button
                            variant={showPwForm ? "outline-danger" : "outline-secondary"}
                            onClick={handleTogglePwForm}
                        >
                            {showPwForm ? "Cancel" : "Change Password"}
                        </Button>

                        {showPwForm && (
                            <div style={styles.pwForm}>
                                {[
                                    ["Current Password", currentPw, setCurrentPw],
                                    ["New Password",     newPw,     setNewPw    ],
                                    ["Confirm Password", confirmPw, setConfirmPw],
                                ].map(([label, val, setter]) => (
                                    <input
                                        key={label}
                                        type="password"
                                        placeholder={label}
                                        value={val}
                                        onChange={e => setter(e.target.value)}
                                        style={styles.pwInput}
                                    />
                                ))}

                                {pwError   && <p style={{ color: "var(--danger)",  fontSize: "0.82rem", margin: "2px 0" }}>{pwError}</p>}
                                {pwSuccess && <p style={{ color: "var(--success)", fontSize: "0.82rem", margin: "2px 0" }}>Password changed!</p>}

                                <Button
                                    variant="primary"
                                    onClick={handleChangePassword}
                                    disabled={pwLoading}
                                >
                                    {pwLoading ? "Saving…" : "Confirm Change"}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation Buttons */}
                <div style={styles.buttonRow} className="fade-up fade-up-2">
                    {INFO_CARDS.map(({ view, label }) => (
                        <Button
                            key={view}
                            variant={activeView === view ? "primary" : "outline-primary"}
                            onClick={() => handleViewToggle(view)}
                            className="flex-fill"
                        >
                            {label}
                        </Button>
                    ))}
                </div>

                {/* Dynamic Card — only rendered when a tab is active */}
                {activeView !== VIEWS.NONE && (
                    <div style={styles.card} className="fade-up">
                        <div style={styles.cardHeader}>
                            <h2 style={styles.cardTitle}>{CARD_TITLES[activeView]}</h2>
                        </div>
                        {renderActiveCard()}
                    </div>
                )}
            </div>
        </div>
    );
};

const styles = {
    container: {
        width: "100%",
        maxWidth: "680px",
    },
    card: {
        backgroundColor: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        padding: "1.75rem",
        marginBottom: "1.25rem",
        boxShadow: "var(--shadow-md)",
    },
    cardHeader: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        color: "var(--navy)",
        marginBottom: "1.25rem",
        paddingBottom: "1rem",
        borderBottom: "1px solid var(--border)",
    },
    cardTitle: {
        fontSize: "1rem",
        fontWeight: 600,
        color: "var(--navy)",
        margin: 0,
        fontFamily: "'Sora', sans-serif",
        letterSpacing: "-0.01em",
    },
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
    buttonRow: {
        display: "flex",
        gap: "10px",
        marginBottom: "1.25rem",
        flexWrap: "wrap",
    },
    pwForm: {
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        marginTop: "0.75rem",
        padding: "1rem",
        background: "var(--surface-2)",
        borderRadius: "var(--radius-sm)",
        border: "1px solid var(--border)",
    },
    pwInput: {
        padding: "0.5rem 0.75rem",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-sm)",
        fontSize: "0.88rem",
        background: "var(--surface)",
        color: "var(--text-primary)",
        outline: "none",
    },
};

export default StudentDashboard;