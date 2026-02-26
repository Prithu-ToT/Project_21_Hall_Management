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
        <span style={styles.label}>{label}:</span>
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
        
        <div style={styles.container}>
            <Header title="Student Dashboard" />

            {/* Student Information Card */}
            <div style={styles.infoCard}>
                <h2 style={styles.cardTitle}>Student Information</h2>
                <InfoRow label="Student ID" value={username} />
                <InfoRow label="Name" value={studentInfo?.name}/>
                <InfoRow label="Department" value={studentInfo?.department} />
                <InfoRow label="Semester" value={studentInfo?.semester}/>
            
            </div>

            {/* Navigation Buttons */}
            <div style={styles.buttonRow}>
                <Button
                    variant={activeView === VIEWS.ALLOCATION ? "primary" : "outline-primary"}
                    onClick={() => handleViewToggle(VIEWS.ALLOCATION)}
                >
                    Allocation Info
                </Button>
                <Button
                    variant={activeView === VIEWS.SERVICE ? "primary" : "outline-primary"}
                    onClick={() => handleViewToggle(VIEWS.SERVICE)}
                >
                    Service Info
                </Button>
                <Button
                    variant={activeView === VIEWS.BOOKING ? "primary" : "outline-primary"}
                    onClick={() => handleViewToggle(VIEWS.BOOKING)}
                >
                    Booking Info
                </Button>
            </div>

            {/* Dynamic Card Area */}
            {/* <div style={styles.dynamicArea}>{renderActiveCard()}</div> */}
        </div>
    );
};

const styles = {
    container: {
        maxWidth: "800px",
        margin: "40px auto",
        padding: "24px",
        fontFamily: "sans-serif",
    },
    infoCard: {
        backgroundColor: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "8px",
        padding: "24px",
        marginBottom: "24px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
    },
    cardTitle: {
        fontSize: "18px",
        marginBottom: "16px",
        color: "#2d3748",
        borderBottom: "1px solid #e2e8f0",
        paddingBottom: "8px",
    },
    infoRow: {
        display: "flex",
        marginBottom: "10px",
        gap: "12px",
    },
    label: {
        fontWeight: "600",
        color: "#4a5568",
        width: "120px",
    },
    value: {
        color: "#2d3748",
    },
    buttonRow: {
        display: "flex",
        gap: "12px",
        marginBottom: "24px",
        flexWrap: "wrap",
    },
    dynamicArea: {
        minHeight: "80px",
    },
    placeholderCard: {
        backgroundColor: "#ebf8ff",
        border: "1px dashed #90cdf4",
        borderRadius: "8px",
        padding: "24px",
        textAlign: "center",
        color: "#2b6cb0",
        fontSize: "15px",
    },
};

export default StudentDashboard;
