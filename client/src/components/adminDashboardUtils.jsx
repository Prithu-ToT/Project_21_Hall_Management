// Shared constants and components for admin dashboard pages

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

export function StatCard({ icon, label, value, color = "#3b82f6", sub }) {
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

export const tableStyles = {
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: {
    color: "#64748b", fontWeight: 600, textAlign: "left",
    padding: "8px 12px", borderBottom: "1px solid #273449",
    textTransform: "uppercase", fontSize: 11, letterSpacing: 0.8,
    background: "#172033",
  },
  td: { color: "#e2e8f0", padding: "11px 12px", borderBottom: "1px solid #1e293b" },
};

export function TableWrap({ children }) {
  return (
    <div style={{
      background: "#1e293b", borderRadius: 12,
      border: "1px solid #334155", overflow: "hidden"
    }}>
      <div style={{ overflowX: "auto" }}>
        {children}
      </div>
    </div>
  );
}
