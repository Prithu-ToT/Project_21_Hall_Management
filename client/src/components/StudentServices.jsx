import { Card, tableStyles } from "./studentDashboardUtils";

export default function StudentServices({ services }) {
  if (!services || services.length === 0) {
    return (
      <Card title="Resident Services" icon="⚙️" accent="#22c55e">
        <p style={{ color: "#64748b", fontSize: 14, marginTop: 8 }}>
          No services subscribed.
        </p>
      </Card>
    );
  }

  const totalDue = services
    .filter(s => !s.amount_paid)
    .reduce((sum, s) => sum + parseFloat(s.service_fee_amount || 0), 0);

  return (
    <Card title="Resident Services" icon="⚙️" accent="#22c55e">
      {totalDue > 0 && (
        <div style={{
          background: "#2d1b1b", border: "1px solid #7f1d1d", borderRadius: 8,
          padding: "0.6rem 1rem", marginBottom: "1rem", fontSize: 13,
          color: "#fca5a5", display: "flex", justifyContent: "space-between"
        }}>
          <span>Outstanding dues</span>
          <strong>৳ {totalDue.toFixed(2)}</strong>
        </div>
      )}

      <div style={{ overflowX: "auto", marginTop: 8 }}>
        <table style={tableStyles.table}>
          <thead>
            <tr>
              {["Service", "Period", "Fee", "Payment"].map(h => (
                <th key={h} style={tableStyles.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {services.map(s => (
              <tr key={s.service_id}
                onMouseOver={e => e.currentTarget.style.background = "#273449"}
                onMouseOut={e => e.currentTarget.style.background = "transparent"}
                style={{ transition: "background 0.15s" }}
              >
                <td style={{ ...tableStyles.td, fontWeight: 600 }}>{s.service_name}</td>
                <td style={{ ...tableStyles.td, color: "#94a3b8" }}>
                  {new Date(s.service_period_start).toLocaleDateString()} –{" "}
                  {new Date(s.service_period_end).toLocaleDateString()}
                </td>
                <td style={tableStyles.td}>৳ {parseFloat(s.service_fee_amount).toFixed(2)}</td>
                <td style={tableStyles.td}>
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
  );
}
