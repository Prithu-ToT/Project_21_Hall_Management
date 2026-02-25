import { useState } from "react";

export default function AdminRooms({ rooms }) {
  const [filter, setFilter] = useState("all");

  const filters = [
    { key: "all",       label: `All (${rooms.length})` },
    { key: "occupied",  label: "Occupied" },
    { key: "available", label: "Available" },
    { key: "inactive",  label: "Inactive" },
  ];

  const filtered = rooms.filter(r => {
    if (filter === "occupied")  return parseInt(r.occupants) > 0;
    if (filter === "available") return parseInt(r.occupants) === 0 && r.is_active;
    if (filter === "inactive")  return !r.is_active;
    return true;
  });

  // Summary counts
  const occupied  = rooms.filter(r => parseInt(r.occupants) > 0).length;
  const available = rooms.filter(r => parseInt(r.occupants) === 0 && r.is_active).length;
  const inactive  = rooms.filter(r => !r.is_active).length;

  return (
    <div>
      {/* Summary strip */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
        gap: "0.75rem",
        marginBottom: "1.5rem",
      }}>
        {[
          { label: "Total",     value: rooms.length,  color: "#60a5fa" },
          { label: "Occupied",  value: occupied,       color: "#f87171" },
          { label: "Available", value: available,      color: "#34d399" },
          { label: "Inactive",  value: inactive,       color: "#475569" },
        ].map(s => (
          <div key={s.label} style={{
            background: "#1e293b", border: "1px solid #334155",
            borderRadius: 10, padding: "0.9rem 1rem",
          }}>
            <div style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase",
              letterSpacing: 1, marginBottom: 4 }}>{s.label}</div>
            <div style={{ color: s.color, fontSize: 24, fontWeight: 800 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filter buttons */}
      <div style={{ display: "flex", gap: 8, marginBottom: "1.25rem", flexWrap: "wrap" }}>
        {filters.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            style={{
              background: filter === f.key ? "#3b82f6" : "#1e293b",
              color: filter === f.key ? "#fff" : "#94a3b8",
              border: `1px solid ${filter === f.key ? "#3b82f6" : "#334155"}`,
              borderRadius: 8, padding: "6px 16px", cursor: "pointer",
              fontSize: 13, fontWeight: 500, transition: "all 0.2s",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Room grid */}
      {filtered.length === 0 ? (
        <div style={{ color: "#475569", fontSize: 14, padding: "2rem 0", textAlign: "center" }}>
          No rooms match this filter.
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
          gap: "0.75rem",
        }}>
          {filtered.map(r => {
            const occ   = parseInt(r.occupants);
            const pct   = Math.min(occ / 6, 1);
            const color = !r.is_active ? "#334155"
              : occ === 0   ? "#22c55e"
              : pct < 0.7   ? "#f59e0b"
              : "#ef4444";

            return (
              <div key={r.room_id} style={{
                background: "#1e293b",
                border: `1px solid ${color}44`,
                borderRadius: 10, padding: "0.85rem 0.75rem",
                textAlign: "center",
                opacity: r.is_active ? 1 : 0.45,
              }}>
                <div style={{ color: "#64748b", fontSize: 10, marginBottom: 4,
                  textTransform: "uppercase", letterSpacing: 0.8 }}>Room</div>
                <div style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 16,
                  fontFamily: "monospace" }}>
                  {r.room_number}
                </div>
                <div style={{ marginTop: 6, height: 4, background: "#334155",
                  borderRadius: 4, overflow: "hidden" }}>
                  <div style={{
                    width: `${pct * 100}%`, height: "100%",
                    background: color, borderRadius: 4,
                    transition: "width 0.4s ease",
                  }} />
                </div>
                <div style={{ color, fontSize: 11, marginTop: 4, fontWeight: 600 }}>
                  {r.is_active ? `${occ} / 6` : "Inactive"}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
