import React, { useState } from "react";
import Button from "./Button";
import Header from "./Header";
import { useEffect } from "react";
import { BackendServer } from "../App";

const AllocationInformationCard = () => (
    <div style={styles.placeholderCard}>
        <p>AllocationInformationCard — Coming Soon</p>
    </div>
);

const ServiceInformationCard = () => (
    <div style={styles.placeholderCard}>
        <p>ServiceInformationCard — Coming Soon</p>
    </div>
);

const BookingInformationCard = () => (
    <div style={styles.placeholderCard}>
        <p>BookingInformationCard — Coming Soon</p>
    </div>
);

const VIEWS = {
    NONE: "NONE",
    ALLOCATION: "ALLOCATION",
    SERVICE: "SERVICE",
    BOOKING: "BOOKING",
};

const InfoRow = ({ label, value = "—" }) => (
    <div style={styles.infoRow}>
        <span style={styles.label}>{label}</span>
        <span style={styles.value}>{value}</span>
    </div>
);

const StudentDashboard = ({ username }) => {
    const [activeView, setActiveView] = useState(VIEWS.NONE);
    const [studentInfo, setStudentInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

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

    const renderActiveCard = () => {
        switch (activeView) {
            case VIEWS.ALLOCATION:
                return <AllocationInformationCard username={username} />;
            case VIEWS.SERVICE:
                return <ServiceInformationCard username={username} />;
            case VIEWS.BOOKING:
                return <BookingInformationCard username={username} />;
            default:
                return null;
        }
    };

    return (
        <div className="page-shell-top">
            <div style={styles.container} className="fade-up">
                <Header title="Student Dashboard" />

                {/* Student Information Card */}
                <div style={styles.infoCard} className="fade-up fade-up-1">
                    <div style={styles.cardHeader}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                        </svg>
                        <h2 style={styles.cardTitle}>Student Information</h2>
                    </div>

                    {loading && (
                        <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>Loading…</p>
                    )}
                    {error && (
                        <p style={{ color: "var(--danger)", fontSize: "0.88rem" }}>{error}</p>
                    )}

                    <div style={styles.infoGrid}>
                        <InfoRow label="Student ID" value={username} />
                        <InfoRow label="Name" value={studentInfo?.name} />
                        <InfoRow label="Department" value={studentInfo?.department} />
                        <InfoRow label="Semester" value={studentInfo?.semester} />
                    </div>
                </div>

                {/* Navigation Buttons */}
                <div style={styles.buttonRow} className="fade-up fade-up-2">
                    {[
                        { view: VIEWS.ALLOCATION, label: "Allocation Info" },
                        { view: VIEWS.SERVICE,    label: "Service Info"    },
                        { view: VIEWS.BOOKING,    label: "Booking Info"    },
                    ].map(({ view, label }) => (
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

                {/* Dynamic Card Area */}
                {/* <div style={styles.dynamicArea}>{renderActiveCard()}</div> */}
            </div>
        </div>
    );
};

const styles = {
    container: {
        width: "100%",
        maxWidth: "680px",
    },
    infoCard: {
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
        marginBottom: "1.5rem",
        flexWrap: "wrap",
    },
    dynamicArea: {
        minHeight: "80px",
    },
    placeholderCard: {
        backgroundColor: "#eff6ff",
        border: "1px dashed #93c5fd",
        borderRadius: "var(--radius)",
        padding: "2rem",
        textAlign: "center",
        color: "#2563eb",
        fontSize: "0.9rem",
    },
};

export default StudentDashboard;
