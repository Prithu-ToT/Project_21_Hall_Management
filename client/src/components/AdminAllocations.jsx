import { Badge, tableStyles, TableWrap } from "./adminDashboardUtils";

export default function AdminAllocations({ recentAllocations }) {
  if (!recentAllocations || recentAllocations.length === 0) {
    return (
      <div style={{
        background: "#1e293b", border: "1px solid #334155", borderRadius: 14,
        padding: "2.5rem", textAlign: "center",
      }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
        <div style={{ color: "#94a3b8", fontSize: 15, fontWeight: 600 }}>No allocations yet</div>
        <div style={{ color: "#475569", fontSize: 13, marginTop: 6 }}>
          Confirmed room allocations will appear here.
        </div>
      </div>
    );
  }

  const unpaidCount = recentAllocations.filter(a => !a.seat_fee_paid).length;

  return (
    <div>
      {unpaidCount > 0 && (
        <div style={{
          background: "#2d1b1b", border: "1px solid #7f1d1d", borderRadius: 8,
          padding: "0.65rem 1rem", marginBottom: "1rem", fontSize: 13,
          color: "#fca5a5", display: "flex", justifyContent: "space-between",
          alignItems: "center",
        }}>
          <span>Residents with unpaid seat fees</span>
          <strong>{unpaidCount}</strong>
        </div>
      )}

      <TableWrap>
        <table style={tableStyles.table}>
          <thead>
            <tr>
              {["Student", "Dept", "Sem", "Room", "Status", "Seat Fee"].map(h => (
                <th key={h} style={tableStyles.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recentAllocations.map(a => (
              <tr
                key={a.allocation_id}
                style={{ transition: "background 0.15s" }}
                onMouseOver={e => e.currentTarget.style.background = "#273449"}
                onMouseOut={e => e.currentTarget.style.background = "transparent"}
              >
                <td style={tableStyles.td}>
                  <div style={{ fontWeight: 600 }}>{a.student_name}</div>
                  <div style={{ color: "#64748b", fontSize: 11 }}>ID: {a.student_id}</div>
                </td>
                <td style={tableStyles.td}>{a.department}</td>
                <td style={tableStyles.td}>{a.semester}</td>
                <td style={{ ...tableStyles.td, fontFamily: "monospace", fontWeight: 600 }}>
                  {a.room_number}
                </td>
                <td style={tableStyles.td}><Badge status={a.alloc_status} /></td>
                <td style={tableStyles.td}>
                  {a.seat_fee_paid
                    ? <span style={{ color: "#22c55e" }}>
                        ৳ {parseFloat(a.seat_fee_paid).toFixed(2)} ✓
                      </span>
                    : <span style={{ color: "#f59e0b" }}>Unpaid</span>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableWrap>
    </div>
  );
}
