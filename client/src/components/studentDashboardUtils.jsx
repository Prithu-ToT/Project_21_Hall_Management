// Shared constants and components used across student dashboard pages

export const BackendServer = "http://localhost:5000/";

export const STATUS_BADGE = {
  ACTIVE:    { bg: "#22c55e", label: "Active" },
  PENDING:   { bg: "#f59e0b", label: "Pending" },
  EXPIRED:   { bg: "#ef4444", label: "Expired" },
  CONFIRMED: { bg: "#22c55e", label: "Confirmed" },
  DENIED:    { bg: "#ef4444", label: "Denied" },
};

export function Badge({ status }) {
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

export function Card({ title, icon, children, accent = "#3b82f6" }) {
  return (
    <div style={{
      background: "#1e293b", borderRadius: 14, padding: "1.5rem",
      border: "1px solid #334155", position: "relative", overflow: "hidden"
    }}>
      <div style={{
        position: "absolute", top: 0, left: 0, width: 4,
        height: "100%", background: accent, borderRadius: "14px 0 0 14px"
      }} />
      <div style={{ paddingLeft: "0.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1rem" }}>
          <span style={{ fontSize: 20 }}>{icon}</span>
          <h3 style={{
            margin: 0, color: "#94a3b8", fontSize: 13, fontWeight: 600,
            textTransform: "uppercase", letterSpacing: 1
          }}>{title}</h3>
        </div>
        {children}
      </div>
    </div>
  );
}

export function StatRow({ label, value, mono = false }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between",
      alignItems: "center", padding: "0.5rem 0", borderBottom: "1px solid #273449"
    }}>
      <span style={{ color: "#64748b", fontSize: 14 }}>{label}</span>
      <span style={{
        color: "#e2e8f0", fontSize: 14, fontWeight: 600,
        fontFamily: mono ? "monospace" : "inherit"
      }}>{value ?? "—"}</span>
    </div>
  );
}

export const tableStyles = {
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: {
    color: "#64748b", fontWeight: 600, textAlign: "left",
    padding: "8px 12px", borderBottom: "1px solid #273449",
    textTransform: "uppercase", fontSize: 11, letterSpacing: 0.8
  },
  td: { color: "#e2e8f0", padding: "11px 12px", borderBottom: "1px solid #1e293b" },
};
