import { useEffect, useState } from "react";

const BackendServer = "http://localhost:5000/";

const STATUS_BADGE = {
  ACTIVE:    { bg: "#22c55e", label: "Active" },
  PENDING:   { bg: "#f59e0b", label: "Pending" },
  EXPIRED:   { bg: "#ef4444", label: "Expired" },
  CONFIRMED: { bg: "#22c55e", label: "Confirmed" },
  DENIED:    { bg: "#ef4444", label: "Denied" },
};

function Badge({ status }) {
  const cfg = STATUS_BADGE[status] || { bg: "#6b7280", label: status };
  return (
    <span style={{
      background: cfg.bg, color: "#fff", borderRadius: 6,
      padding: "2px 10px", fontSize: 12, fontWeight: 600, letterSpacing: 0.5
    }}>
      {cfg.label}
    </span>
  );
}

function StatCard({ icon, label, value, color = "#3b82f6", sub }) {
  return (
    <div style={{
      background: "#1e293b", border: "1px solid #334155", borderRadius: 14,
      padding: "1.25rem 1.5rem", position: "relative", overflow: "hidden"
    }}>
      <div style={{
        position: "absolute", bottom: -10, right: -10,
        fontSize: 64, opacity: 0.07, lineHeight: 1
      }}>{icon}</div>
      <div style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase",
        letterSpacing: 1, marginBottom: 8 }}>{label}</div>
      <div style={{ color, fontSize: 32, fontWeight: 800, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ color: "#64748b", fontSize: 12, marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

function SectionHeader({ title, icon }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10,
      margin: "2rem 0 1rem", paddingBottom: "0.75rem", borderBottom: "1px solid #1e293b" }}>
      <span style={{ fontSize: 20 }}>{icon}</span>
      <h2 style={{ margin: 0, color: "#94a3b8", fontSize: 14, fontWeight: 700,
        textTransform: "uppercase", letterSpacing: 1.2 }}>{title}</h2>
    </div>
  );
}

export default function AdminDashboard({ hallName, onLogout }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roomFilter, setRoomFilter] = useState("all");

  useEffect(() => {
    fetch(BackendServer + "admin/" + encodeURIComponent(hallName))
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError("Failed to load dashboard."); setLoading(false); });
  }, [hallName]);

  const tableStyles = {
    table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
    th: {
      color: "#64748b", fontWeight: 600, textAlign: "left",
      padding: "8px 12px", borderBottom: "1px solid #273449",
      textTransform: "uppercase", fontSize: 11, letterSpacing: 0.8
    },
    td: { color: "#e2e8f0", padding: "11px 12px", borderBottom: "1px solid #1e293b" },
  };

  const wrapStyle = {
    minHeight: "100vh", background: "#0f172a",
    fontFamily: "'Segoe UI', system-ui, sans-serif", padding: "2rem 1rem",
  };

  if (loading) return (
    <div style={{ ...wrapStyle, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#64748b", fontSize: 16 }}>Loading hall dashboard…</div>
    </div>
  );

  if (error) return (
    <div style={{ ...wrapStyle, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#ef4444" }}>{error}</div>
    </div>
  );

  const { hall, roomStats, allocStats, pendingBookings, recentAllocations, rooms } = data;
  const occupancyRate = roomStats.total_rooms > 0
    ? Math.round((allocStats.active_count / roomStats.total_rooms) * 100)
    : 0;

  const filteredRooms = rooms.filter(r => {
    if (roomFilter === "occupied") return parseInt(r.occupants) > 0;
    if (roomFilter === "available") return parseInt(r.occupants) === 0 && r.is_active;
    if (roomFilter === "inactive") return !r.is_active;
    return true;
  });

  return (
    <div style={wrapStyle}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* Header */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          marginBottom: "2rem", paddingBottom: "1.5rem", borderBottom: "1px solid #1e293b"
        }}>
          <div>
            <div style={{ color: "#475569", fontSize: 12, textTransform: "uppercase",
              letterSpacing: 1.5, marginBottom: 4 }}>Hall Administration</div>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: "#f1f5f9" }}>
              🏛️ {hall.hall_name}
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
              <span style={{
                background: hall.is_active ? "#14532d" : "#450a0a",
                color: hall.is_active ? "#22c55e" : "#ef4444",
                borderRadius: 20, padding: "2px 12px", fontSize: 12, fontWeight: 600
              }}>
                {hall.is_active ? "● Operational" : "● Inactive"}
              </span>
            </div>
          </div>
          <button
            onClick={onLogout}
            style={{
              background: "transparent", border: "1px solid #334155",
              color: "#94a3b8", padding: "8px 18px", borderRadius: 8,
              cursor: "pointer", fontSize: 13
            }}
          >
            Logout
          </button>
        </div>

        {/* Stat Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
          <StatCard icon="🏠" label="Total Rooms" value={roomStats.total_rooms} color="#60a5fa" />
          <StatCard icon="👥" label="Active Residents" value={allocStats.active_count} color="#34d399"
            sub={`${occupancyRate}% occupancy`} />
          <StatCard icon="⏳" label="Pending Allocations" value={allocStats.pending_count} color="#fbbf24" />
          <StatCard icon="📋" label="Pending Bookings" value={pendingBookings.length} color="#f87171" />
          <StatCard icon="📦" label="Total Allocations" value={allocStats.total_allocations} color="#a78bfa" />
        </div>

        {/* Pending Bookings */}
        {pendingBookings.length > 0 && (
          <>
            <SectionHeader title={`Pending Bookings (${pendingBookings.length})`} icon="🔔" />
            <div style={{ background: "#1e293b", borderRadius: 12, border: "1px solid #334155", overflow: "hidden" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={tableStyles.table}>
                  <thead>
                    <tr style={{ background: "#172033" }}>
                      {["Booking ID", "Student", "Dept", "Sem", "Room", "Requested"].map(h => (
                        <th key={h} style={tableStyles.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pendingBookings.map(b => (
                      <tr key={b.booking_id}
                        style={{ transition: "background 0.15s" }}
                        onMouseOver={e => e.currentTarget.style.background = "#273449"}
                        onMouseOut={e => e.currentTarget.style.background = "transparent"}
                      >
                        <td style={{ ...tableStyles.td, fontFamily: "monospace" }}>#{b.booking_id}</td>
                        <td style={tableStyles.td}>
                          <div style={{ fontWeight: 600 }}>{b.student_name}</div>
                          <div style={{ color: "#64748b", fontSize: 11 }}>ID: {b.student_id}</div>
                        </td>
                        <td style={tableStyles.td}>{b.department}</td>
                        <td style={tableStyles.td}>{b.semester}</td>
                        <td style={{ ...tableStyles.td, fontFamily: "monospace", fontWeight: 600 }}>{b.room_number}</td>
                        <td style={{ ...tableStyles.td, color: "#94a3b8" }}>
                          {new Date(b.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Room Overview */}
        <SectionHeader title="Room Overview" icon="🗂️" />
        <div style={{ display: "flex", gap: 8, marginBottom: "1rem", flexWrap: "wrap" }}>
          {[
            { key: "all", label: `All (${rooms.length})` },
            { key: "occupied", label: `Occupied` },
            { key: "available", label: `Available` },
            { key: "inactive", label: `Inactive` },
          ].map(f => (
            <button key={f.key} onClick={() => setRoomFilter(f.key)} style={{
              background: roomFilter === f.key ? "#3b82f6" : "#1e293b",
              color: roomFilter === f.key ? "#fff" : "#94a3b8",
              border: `1px solid ${roomFilter === f.key ? "#3b82f6" : "#334155"}`,
              borderRadius: 8, padding: "6px 16px", cursor: "pointer",
              fontSize: 13, fontWeight: 500, transition: "all 0.2s"
            }}>
              {f.label}
            </button>
          ))}
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
          gap: "0.75rem"
        }}>
          {filteredRooms.map(r => {
            const occ = parseInt(r.occupants);
            const pct = Math.min(occ / 6, 1);
            const color = !r.is_active ? "#334155"
              : occ === 0 ? "#22c55e"
              : pct < 0.7 ? "#f59e0b" : "#ef4444";

            return (
              <div key={r.room_id} style={{
                background: "#1e293b", border: `1px solid ${color}33`,
                borderRadius: 10, padding: "0.85rem 0.75rem",
                textAlign: "center", opacity: r.is_active ? 1 : 0.5,
                cursor: "default"
              }}>
                <div style={{ color: "#94a3b8", fontSize: 11, marginBottom: 4 }}>Room</div>
                <div style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 16, fontFamily: "monospace" }}>
                  {r.room_number}
                </div>
                <div style={{ marginTop: 6, height: 4, background: "#334155", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ width: `${pct * 100}%`, height: "100%", background: color, borderRadius: 4 }} />
                </div>
                <div style={{ color, fontSize: 11, marginTop: 4, fontWeight: 600 }}>
                  {r.is_active ? `${occ}/6` : "Inactive"}
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Allocations */}
        <SectionHeader title="Recent Allocations" icon="📄" />
        <div style={{ background: "#1e293b", borderRadius: 12, border: "1px solid #334155", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={tableStyles.table}>
              <thead>
                <tr style={{ background: "#172033" }}>
                  {["Student", "Dept", "Sem", "Room", "Status", "Seat Fee"].map(h => (
                    <th key={h} style={tableStyles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentAllocations.map(a => (
                  <tr key={a.allocation_id}
                    onMouseOver={e => e.currentTarget.style.background = "#273449"}
                    onMouseOut={e => e.currentTarget.style.background = "transparent"}
                    style={{ transition: "background 0.15s" }}
                  >
                    <td style={tableStyles.td}>
                      <div style={{ fontWeight: 600 }}>{a.student_name}</div>
                      <div style={{ color: "#64748b", fontSize: 11 }}>ID: {a.student_id}</div>
                    </td>
                    <td style={tableStyles.td}>{a.department}</td>
                    <td style={tableStyles.td}>{a.semester}</td>
                    <td style={{ ...tableStyles.td, fontFamily: "monospace", fontWeight: 600 }}>{a.room_number}</td>
                    <td style={tableStyles.td}><Badge status={a.alloc_status} /></td>
                    <td style={tableStyles.td}>
                      {a.seat_fee_paid
                        ? <span style={{ color: "#22c55e" }}>৳ {parseFloat(a.seat_fee_paid).toFixed(2)} ✓</span>
                        : <span style={{ color: "#f59e0b" }}>Unpaid</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ height: "3rem" }} />
      </div>
    </div>
  );
}
