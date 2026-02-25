import { useEffect, useState } from "react";
import { BackendServer } from "./studentDashboardUtils";
import StudentOverview from "./StudentOverview";
import StudentBookings from "./StudentBookings";
import StudentServices from "./StudentServices";

const PAGES = [
  { key: "overview",  label: "Overview",    icon: "🏠" },
  { key: "bookings",  label: "My Bookings", icon: "📋" },
  { key: "services",  label: "My Services", icon: "⚙️" },
];

export default function StudentDashboard({ studentId, onLogout }) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [activePage, setActivePage] = useState("overview");

  useEffect(() => {
    fetch(BackendServer + "student/" + studentId)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError("Failed to load dashboard."); setLoading(false); });
  }, [studentId]);

  const wrap = {
    minHeight: "100vh",
    background: "#0f172a",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  };

  if (loading) return (
    <div style={{ ...wrap, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#64748b", fontSize: 16 }}>Loading your dashboard…</div>
    </div>
  );

  if (error) return (
    <div style={{ ...wrap, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#ef4444" }}>{error}</div>
    </div>
  );

  const { profile, allocation, bookings, services } = data;

  return (
    <div style={wrap}>

      {/* ── Top bar ── */}
      <div style={{
        background: "#0f172a",
        borderBottom: "1px solid #1e293b",
        padding: "0 1.5rem",
        position: "sticky", top: 0, zIndex: 10,
      }}>
        <div style={{
          maxWidth: 960, margin: "0 auto",
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
          height: 60,
        }}>

          {/* Identity */}
          <div>
            <span style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 16 }}>
              {profile.name}
            </span>
            <span style={{
              color: "#475569", fontSize: 12, marginLeft: 10,
              fontFamily: "monospace"
            }}>
              ID: {profile.student_id}
            </span>
          </div>

          {/* Nav buttons */}
          <nav style={{ display: "flex", gap: 4 }}>
            {PAGES.map(p => (
              <button
                key={p.key}
                onClick={() => setActivePage(p.key)}
                style={{
                  background: activePage === p.key ? "#1e293b" : "transparent",
                  border: activePage === p.key ? "1px solid #334155" : "1px solid transparent",
                  color: activePage === p.key ? "#f1f5f9" : "#64748b",
                  borderRadius: 8,
                  padding: "6px 14px",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: activePage === p.key ? 600 : 400,
                  display: "flex", alignItems: "center", gap: 6,
                  transition: "all 0.15s",
                }}
                onMouseOver={e => {
                  if (activePage !== p.key) e.currentTarget.style.color = "#cbd5e1";
                }}
                onMouseOut={e => {
                  if (activePage !== p.key) e.currentTarget.style.color = "#64748b";
                }}
              >
                <span>{p.icon}</span>
                <span>{p.label}</span>
                {p.key === "bookings" && bookings.length > 0 && (
                  <span style={{
                    background: "#f59e0b", color: "#000",
                    borderRadius: 20, fontSize: 10, fontWeight: 700,
                    padding: "0px 6px", lineHeight: "16px"
                  }}>{bookings.length}</span>
                )}
                {p.key === "services" && services.length > 0 && (
                  <span style={{
                    background: "#6366f1", color: "#fff",
                    borderRadius: 20, fontSize: 10, fontWeight: 700,
                    padding: "0px 6px", lineHeight: "16px"
                  }}>{services.length}</span>
                )}
              </button>
            ))}
          </nav>

          {/* Logout */}
          <button
            onClick={onLogout}
            style={{
              background: "transparent",
              border: "1px solid #334155",
              color: "#94a3b8",
              padding: "6px 16px", borderRadius: 8,
              cursor: "pointer", fontSize: 13,
              transition: "all 0.2s",
            }}
            onMouseOver={e => {
              e.currentTarget.style.borderColor = "#ef4444";
              e.currentTarget.style.color = "#ef4444";
            }}
            onMouseOut={e => {
              e.currentTarget.style.borderColor = "#334155";
              e.currentTarget.style.color = "#94a3b8";
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* ── Page title bar ── */}
      <div style={{
        background: "#111827",
        borderBottom: "1px solid #1e293b",
        padding: "1.25rem 1.5rem",
      }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#f1f5f9" }}>
            {PAGES.find(p => p.key === activePage)?.icon}{" "}
            {PAGES.find(p => p.key === activePage)?.label}
          </h1>
          <p style={{ margin: "4px 0 0", color: "#475569", fontSize: 13 }}>
            {profile.department} · Semester {profile.semester}
          </p>
        </div>
      </div>

      {/* ── Page content ── */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "2rem 1rem" }}>
        {activePage === "overview"  && <StudentOverview  profile={profile} allocation={allocation} />}
        {activePage === "bookings"  && <StudentBookings  bookings={bookings} />}
        {activePage === "services"  && <StudentServices  services={services} />}
      </div>

    </div>
  );
}
