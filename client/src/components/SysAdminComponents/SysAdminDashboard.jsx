import { useState } from "react";
import Button from "../Button";
import Header from "../Header";
import AddHallCard from "./AddHallCard";
import AddRoomCard from "./AddRoomCard";
import SemesterRolloverCard from "./SemesterRolloverCard";
import AddStudentCard from "./AddStudentCard";

const VIEWS = {
    NONE:     "NONE",
    ADD_HALL: "ADD_HALL",
    ADD_ROOM: "ADD_ROOM",
    ADD_STUDENT: "ADD_STUDENT",
    ROLLOVER: "ROLLOVER",
};

const PANEL_CARDS = [
    { view: VIEWS.ADD_HALL, label: "Add New Hall"      },
    { view: VIEWS.ADD_ROOM, label: "Add New Room"      },
    { view: VIEWS.ADD_STUDENT, label: "Add New Student" },
    { view: VIEWS.ROLLOVER, label: "Semester Rollover" },
];

const CARD_TITLES = {
    [VIEWS.ADD_HALL]: "Add New Hall",
    [VIEWS.ADD_ROOM]: "Add New Room",
    [VIEWS.ADD_STUDENT]: "Add New Student",
    [VIEWS.ROLLOVER]: "Semester Rollover",
};

const SysAdminDashboard = ({ onLogout }) => {
    const [activeView, setActiveView] = useState(VIEWS.NONE);

    const handleViewToggle = (view) => {
        setActiveView((prev) => (prev === view ? VIEWS.NONE : view));
    };

    const renderActiveCard = () => {
        switch (activeView) {
            case VIEWS.ADD_HALL: return <AddHallCard />;
            case VIEWS.ADD_ROOM: return <AddRoomCard />;
            case VIEWS.ADD_STUDENT: return <AddStudentCard />;
            case VIEWS.ROLLOVER: return <SemesterRolloverCard />;
            default:             return null;
        }
    };

    return (
        <div className="page-shell-top">
            <div style={styles.container} className="fade-up">
                <Header title="System Administration" />

                <div style={styles.card} className="fade-up fade-up-1">
                    <div style={styles.cardHeader}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                        </svg>
                        <h2 style={styles.cardTitle}>System Administrator</h2>
                        <button style={styles.logoutBtn} onClick={onLogout}>Sign out</button>
                    </div>
                    <div style={styles.infoRow}>
                        <span style={styles.label}>Access Level</span>
                        <span style={{ ...styles.value, color: "var(--danger)", fontWeight: 700 }}>
                            Global · All Halls
                        </span>
                    </div>
                </div>

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
};

export default SysAdminDashboard;
