import { useState, useEffect } from "react";
import Button from "../Button";
import Header from "../Header";
import TextInput from "../TextInput";
import { BackendServer } from "../../App";
import AdminAllocationCard from "./AdminAllocationCard";
import AdminServiceCard from "./AdminServiceCard";

const VIEWS = {
    NONE:       "NONE",
    ALLOCATION: "ALLOCATION",
    SERVICE:    "SERVICE",
};

const PANEL_CARDS = [
    { view: VIEWS.ALLOCATION, label: "Manage Allocations" },
    { view: VIEWS.SERVICE,    label: "Manage Services"    },
];

const CARD_TITLES = {
    [VIEWS.ALLOCATION]: "Allocation Management",
    [VIEWS.SERVICE]:    "Service Management",
};

const InfoRow = ({ label, value = "—" }) => (
    <div style={styles.infoRow}>
        <span style={styles.label}>{label}</span>
        <span style={styles.value}>{value}</span>
    </div>
);

const StatTile = ({ label, value = "—", accent = "var(--navy)" }) => (
    <div style={{ ...styles.statTile, borderTop: `3px solid ${accent}` }}>
        <span style={{ ...styles.statValue, color: accent }}>{value}</span>
        <span style={styles.statLabel}>{label}</span>
    </div>
);

const AdminDashboard = ({ username, onLogout }) => {
    const [activeView, setActiveView]   = useState(VIEWS.NONE);
    const [hallInfo, setHallInfo]       = useState(null);
    const [loading, setLoading]         = useState(false);
    const [error, setError]             = useState(null);

    // Change-password form state
    const [showPwForm, setShowPwForm]   = useState(false);
    const [currentPw, setCurrentPw]     = useState("");
    const [newPw, setNewPw]             = useState("");
    const [confirmPw, setConfirmPw]     = useState("");
    const [pwLoading, setPwLoading]     = useState(false);
    const [pwError, setPwError]         = useState(null);
    const [pwSuccess, setPwSuccess]     = useState(false);

    useEffect(() => {
        const fetchHallInfo = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(
                    BackendServer + `admin/hall-info/${encodeURIComponent(username)}`
                );
                if (!response.ok) throw new Error("Failed to fetch hall info");
                const data = await response.json();
                setHallInfo(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        if (username) fetchHallInfo();
    }, [username]);

    const handleViewToggle = (view) => {
        setActiveView((prev) => (prev === view ? VIEWS.NONE : view));
    };

    const handlePasswordChange = async () => {
        setPwError(null);
        setPwSuccess(false);

        if (!hallInfo?.hall_id) {
            setPwError("Hall information not loaded. Please refresh.");
            return;
        }

        if (!currentPw || !newPw || !confirmPw) {
            setPwError("All fields are required.");
            return;
        }
        if (newPw !== confirmPw) {
            setPwError("New passwords do not match.");
            return;
        }

        setPwLoading(true);
        try {
            const response = await fetch(BackendServer + "admin/change-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    hallId:        hallInfo.hall_id,
                    currentPassword: currentPw,
                    newPassword:     newPw,
                }),
            });
            const data = await response.json();
            if (!response.ok) {
                setPwError(data.message || "Password change failed.");
            } else {
                setPwSuccess(true);
                setCurrentPw("");
                setNewPw("");
                setConfirmPw("");
                setTimeout(() => {
                    setShowPwForm(false);
                    setPwSuccess(false);
                }, 1800);
            }
        } catch {
            setPwError("Network error. Please try again.");
        } finally {
            setPwLoading(false);
        }
    };

    const renderActiveCard = () => {
        switch (activeView) {
            case VIEWS.ALLOCATION: return <AdminAllocationCard hallId={hallInfo?.hall_id} />;
            case VIEWS.SERVICE:    return <AdminServiceCard    hallId={hallInfo?.hall_id} />;
            default:               return null;
        }
    };

    return (
        <div className="page-shell-top">
            <div style={styles.container} className="fade-up">
                <Header title="Admin Dashboard" />

                {/* Hall Information Card */}
                <div style={styles.card} className="fade-up fade-up-1">
                    <div style={styles.cardHeader}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/>
                        </svg>
                        <h2 style={styles.cardTitle}>Hall Information</h2>
                        <button style={styles.logoutBtn} onClick={onLogout}>Sign out</button>
                    </div>

                    {loading && <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>Loading…</p>}
                    {error   && <p style={{ color: "var(--danger)",    fontSize: "0.88rem" }}>{error}</p>}

                    <div style={styles.infoGrid}>
                        <InfoRow label="Hall Name" value={hallInfo?.hall_name} />
                    </div>

                    <div style={styles.statRow}>
                        <StatTile
                            label="Total Students"
                            value={hallInfo?.total_students}
                            accent="var(--accent)"
                        />
                        <StatTile
                            label="Available Seats"
                            value={hallInfo?.available_seats}
                            accent="var(--success)"
                        />
                    </div>

                    {/* Change Password section */}
                    <div style={styles.pwSection}>
                        <button
                            style={styles.pwToggleBtn}
                            onClick={() => {
                                setShowPwForm((v) => !v);
                                setPwError(null);
                                setPwSuccess(false);
                            }}
                        >
                            {showPwForm ? "Cancel" : "Change Password"}
                        </button>

                        {showPwForm && (
                            <div style={styles.pwForm}>
                                <TextInput
                                    label="Current Password"
                                    type="password"
                                    value={currentPw}
                                    onChange={(e) => setCurrentPw(e.target.value)}
                                    placeholder="Enter current password"
                                />
                                <TextInput
                                    label="New Password"
                                    type="password"
                                    value={newPw}
                                    onChange={(e) => setNewPw(e.target.value)}
                                    placeholder="Enter new password"
                                />
                                <TextInput
                                    label="Confirm New Password"
                                    type="password"
                                    value={confirmPw}
                                    onChange={(e) => setConfirmPw(e.target.value)}
                                    placeholder="Confirm new password"
                                />

                                {pwError   && <p style={{ color: "var(--danger)",  fontSize: "0.83rem", margin: "0.25rem 0" }}>{pwError}</p>}
                                {pwSuccess  && <p style={{ color: "var(--success)", fontSize: "0.83rem", margin: "0.25rem 0" }}>Password updated successfully.</p>}

                                <Button
                                    variant="primary"
                                    className="w-100"
                                    onClick={handlePasswordChange}
                                    disabled={pwLoading}
                                >
                                    {pwLoading ? "Updating…" : "Update Password"}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation Buttons */}
                <div style={styles.buttonRow} className="fade-up fade-up-2">
                    {PANEL_CARDS.map(({ view, label }) => (
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
        flexGrow: 1,
    },
    logoutBtn: {
        background: "none",
        border: "1.5px solid var(--border)",
        borderRadius: "var(--radius-sm)",
        padding: "0.3rem 0.85rem",
        fontSize: "0.78rem",
        fontWeight: 600,
        color: "var(--text-muted)",
        cursor: "pointer",
        fontFamily: "'DM Sans', sans-serif",
        letterSpacing: "0.02em",
        transition: "all 0.18s ease",
    },
    infoGrid: {
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: "0.5rem",
        marginBottom: "1rem",
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
    statRow: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "0.5rem 1rem",
        marginBottom: "1.25rem",
    },
    statTile: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "4px",
        padding: "0.9rem 1rem",
        background: "var(--surface-2)",
        borderRadius: "var(--radius-sm)",
        border: "1px solid var(--border)",
    },
    statValue: {
        fontSize: "1.6rem",
        fontWeight: 700,
        fontFamily: "'Sora', sans-serif",
        lineHeight: 1,
    },
    statLabel: {
        fontSize: "0.72rem",
        fontWeight: 600,
        color: "var(--text-muted)",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
    },
    buttonRow: {
        display: "flex",
        gap: "10px",
        marginBottom: "1.25rem",
        flexWrap: "wrap",
    },
    pwSection: {
        borderTop: "1px solid var(--border)",
        paddingTop: "1rem",
    },
    pwToggleBtn: {
        background: "none",
        border: "none",
        padding: 0,
        fontSize: "0.83rem",
        fontWeight: 600,
        color: "var(--accent)",
        cursor: "pointer",
        fontFamily: "'DM Sans', sans-serif",
        letterSpacing: "0.01em",
    },
    pwForm: {
        marginTop: "1rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.25rem",
    },
};

export default AdminDashboard;