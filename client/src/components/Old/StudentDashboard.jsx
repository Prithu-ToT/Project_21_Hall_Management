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

function Card({ title, icon, children, accent = "#3b82f6" }) {
  return (
    <div style={{
      background: "#1e293b", borderRadius: 14, padding: "1.5rem",
      border: `1px solid #334155`, position: "relative", overflow: "hidden"
    }}>
      <div style={{
        position: "absolute", top: 0, left: 0, width: 4,
        height: "100%", background: accent, borderRadius: "14px 0 0 14px"
      }} />
      <div style={{ paddingLeft: "0.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1rem" }}>
          <span style={{ fontSize: 20 }}>{icon}</span>
          <h3 style={{ margin: 0, color: "#94a3b8", fontSize: 13, fontWeight: 600,
            textTransform: "uppercase", letterSpacing: 1 }}>{title}</h3>
        </div>
        {children}
      </div>
    </div>
  );
}

function StatRow({ label, value, mono = false }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between",
      alignItems: "center", padding: "0.5rem 0", borderBottom: "1px solid #273449" }}>
      <span style={{ color: "#64748b", fontSize: 14 }}>{label}</span>
      <span style={{
        color: "#e2e8f0", fontSize: 14, fontWeight: 600,
        fontFamily: mono ? "monospace" : "inherit"
      }}>{value ?? "—"}</span>
    </div>
  );
}

export default function StudentDashboard({ studentId, onLogout }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(BackendServer + "student/" + studentId)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError("Failed to load dashboard."); setLoading(false); });
  }, [studentId]);

  const styles = {
    wrapper: {
      minHeight: "100vh", background: "#0f172a",
      fontFamily: "'Segoe UI', system-ui, sans-serif", padding: "2rem 1rem"
    },
    container: { maxWidth: 960, margin: "0 auto" },
    header: {
      display: "flex", justifyContent: "space-between", alignItems: "center",
      marginBottom: "2rem", paddingBottom: "1.5rem",
      borderBottom: "1px solid #1e293b"
    },
    title: { margin: 0, fontSize: 26, fontWeight: 700, color: "#f1f5f9" },
    subtitle: { color: "#64748b", fontSize: 14, marginTop: 4 },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem" },
    logoutBtn: {
      background: "transparent", border: "1px solid #334155", color: "#94a3b8",
      padding: "8px 18px", borderRadius: 8, cursor: "pointer", fontSize: 13,
      transition: "all 0.2s"
    },
    table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
    th: { color: "#64748b", fontWeight: 600, textAlign: "left",
      padding: "8px 10px", borderBottom: "1px solid #273449", textTransform: "uppercase",
      fontSize: 11, letterSpacing: 0.8 },
    td: { color: "#e2e8f0", padding: "10px 10px", borderBottom: "1px solid #1e293b" },
  };

  if (loading) return (
    <div style={{ ...styles.wrapper, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#64748b", fontSize: 16 }}>Loading your dashboard…</div>
    </div>
  );

  if (error) return (
    <div style={{ ...styles.wrapper, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#ef4444" }}>{error}</div>
    </div>
  );

  const { profile, allocation, bookings, services } = data;

  const unpaidServices = services.filter(s => !s.amount_paid);
  const totalUnpaid = unpaidServices.reduce((sum, s) => sum + parseFloat(s.service_fee_amount || 0), 0);

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>

        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>👋 Welcome, {profile.name}</h1>
            <p style={styles.subtitle}>Student ID: {profile.student_id} · {profile.department} · Semester {profile.semester}</p>
          </div>
          <button style={styles.logoutBtn} onClick={onLogout}
            onMouseOver={e => e.target.style.borderColor = "#ef4444"}
            onMouseOut={e => e.target.style.borderColor = "#334155"}>
            Logout
          </button>
        </div>

        {/* Summary Pills */}
        <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
          {[
            { label: "Allocation", value: allocation ? <Badge status={allocation.alloc_status} /> : "None", bg: "#1e293b" },
            { label: "Pending Bookings", value: bookings.filter(b => b.status === "PENDING").length, bg: "#1e293b" },
            { label: "Active Services", value: services.length, bg: "#1e293b" },
            { label: "Dues", value: totalUnpaid > 0 ? `৳ ${totalUnpaid.toFixed(2)}` : "Clear", bg: totalUnpaid > 0 ? "#2d1b1b" : "#1a2e1a" },
          ].map((pill, i) => (
            <div key={i} style={{
              background: pill.bg, border: "1px solid #334155", borderRadius: 10,
              padding: "0.75rem 1.25rem", flex: "1 1 150px"
            }}>
              <div style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase",
                letterSpacing: 1, marginBottom: 6 }}>{pill.label}</div>
              <div style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 18 }}>{pill.value}</div>
            </div>
          ))}
        </div>

        <div style={styles.grid}>

          {/* Profile */}
          <Card title="Personal Info" icon="🎓" accent="#6366f1">
            <StatRow label="Full Name" value={profile.name} />
            <StatRow label="Department" value={profile.department} />
            <StatRow label="Semester" value={profile.semester} />
            <StatRow label="Phone" value={profile.phone_number} />
            <StatRow label="NID" value={profile.nid} mono />
          </Card>

          {/* Allocation */}
          <Card title="Hall Allocation" icon="🏠" accent="#0ea5e9">
            {allocation ? (
              <>
                <StatRow label="Hall" value={allocation.hall_name} />
                <StatRow label="Room" value={allocation.room_number} />
                <StatRow label="Status" value={<Badge status={allocation.alloc_status} />} />
                <StatRow label="Seat Fee" value={
                  allocation.seat_fee_paid
                    ? `৳ ${parseFloat(allocation.seat_fee_paid).toFixed(2)} ✓`
                    : "Unpaid"
                } />
                {allocation.bank_transaction_id && (
                  <StatRow label="Txn ID" value={allocation.bank_transaction_id} mono />
                )}
              </>
            ) : (
              <p style={{ color: "#64748b", fontSize: 14, marginTop: 8 }}>
                No hall allocation found. Submit a room booking request below.
              </p>
            )}
          </Card>

        </div>

        {/* Room Bookings */}
        {bookings.length > 0 && (
          <Card title="Room Bookings" icon="📋" accent="#f59e0b">
            <div style={{ overflowX: "auto", marginTop: 8 }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    {["Booking ID", "Hall", "Room", "Status", "Requested On"].map(h => (
                      <th key={h} style={styles.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(b => (
                    <tr key={b.booking_id}>
                      <td style={styles.td}>#{b.booking_id}</td>
                      <td style={styles.td}>{b.hall_name}</td>
                      <td style={styles.td}>{b.room_number}</td>
                      <td style={styles.td}><Badge status={b.status} /></td>
                      <td style={styles.td}>{new Date(b.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Services */}
        {services.length > 0 && (
          <div style={{ marginTop: "1.25rem" }}>
            <Card title="Resident Services" icon="⚙️" accent="#22c55e">
              <div style={{ overflowX: "auto", marginTop: 8 }}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      {["Service", "Period", "Fee", "Payment"].map(h => (
                        <th key={h} style={styles.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {services.map(s => (
                      <tr key={s.service_id}>
                        <td style={styles.td}>{s.service_name}</td>
                        <td style={styles.td}>
                          {new Date(s.service_period_start).toLocaleDateString()} –{" "}
                          {new Date(s.service_period_end).toLocaleDateString()}
                        </td>
                        <td style={styles.td}>৳ {parseFloat(s.service_fee_amount).toFixed(2)}</td>
                        <td style={styles.td}>
                          {s.amount_paid
                            ? <span style={{ color: "#22c55e" }}>৳ {parseFloat(s.amount_paid).toFixed(2)} ✓</span>
                            : <span style={{ color: "#f59e0b" }}>Unpaid</span>
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

      </div>
    </div>
  );
}
