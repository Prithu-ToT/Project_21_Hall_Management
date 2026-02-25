import { StatCard } from "./adminDashboardUtils";

export default function AdminOverview({ hall, roomStats, allocStats, pendingBookingsCount }) {
  const occupancyRate = roomStats.total_rooms > 0
    ? Math.round((allocStats.active_count / roomStats.total_rooms) * 100)
    : 0;

  return (
    <div>
      {/* Hall info banner */}
      <div style={{
        background: "#1e293b", border: "1px solid #334155", borderRadius: 14,
        padding: "1.25rem 1.5rem", marginBottom: "1.5rem",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: "1rem",
      }}>
        <div>
          <div style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase",
            letterSpacing: 1.2, marginBottom: 4 }}>Hall</div>
          <div style={{ color: "#f1f5f9", fontSize: 22, fontWeight: 800 }}>
            🏛️ {hall.hall_name}
          </div>
        </div>
        <span style={{
          background: hall.is_active ? "#14532d" : "#450a0a",
          color: hall.is_active ? "#22c55e" : "#ef4444",
          borderRadius: 20, padding: "4px 16px", fontSize: 13, fontWeight: 600,
        }}>
          {hall.is_active ? "● Operational" : "● Inactive"}
        </span>
      </div>

      {/* Stat grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: "1rem",
      }}>
        <StatCard icon="🏠" label="Total Rooms"        value={roomStats.total_rooms}           color="#60a5fa" />
        <StatCard icon="👥" label="Active Residents"   value={allocStats.active_count}         color="#34d399"
          sub={`${occupancyRate}% occupancy`} />
        <StatCard icon="⏳" label="Pending Allocations" value={allocStats.pending_count}       color="#fbbf24" />
        <StatCard icon="📋" label="Pending Bookings"   value={pendingBookingsCount}            color="#f87171" />
        <StatCard icon="📦" label="Total Allocations"  value={allocStats.total_allocations}   color="#a78bfa" />
      </div>
    </div>
  );
}
