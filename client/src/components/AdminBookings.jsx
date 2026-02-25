import { tableStyles, TableWrap } from "./adminDashboardUtils";

export default function AdminBookings({ pendingBookings }) {
  if (!pendingBookings || pendingBookings.length === 0) {
    return (
      <div style={{
        background: "#1e293b", border: "1px solid #334155", borderRadius: 14,
        padding: "2.5rem", textAlign: "center",
      }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
        <div style={{ color: "#94a3b8", fontSize: 15, fontWeight: 600 }}>No pending bookings</div>
        <div style={{ color: "#475569", fontSize: 13, marginTop: 6 }}>
          All booking requests have been handled.
        </div>
      </div>
    );
  }

  return (
    <TableWrap>
      <table style={tableStyles.table}>
        <thead>
          <tr>
            {["Booking ID", "Student", "Dept", "Sem", "Room", "Requested On"].map(h => (
              <th key={h} style={tableStyles.th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {pendingBookings.map(b => (
            <tr
              key={b.booking_id}
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
              <td style={{ ...tableStyles.td, fontFamily: "monospace", fontWeight: 600 }}>
                {b.room_number}
              </td>
              <td style={{ ...tableStyles.td, color: "#94a3b8" }}>
                {new Date(b.created_at).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableWrap>
  );
}
