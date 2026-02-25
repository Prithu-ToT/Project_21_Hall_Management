import { Card, Badge, tableStyles } from "./studentDashboardUtils";

export default function StudentBookings({ bookings }) {
  if (!bookings || bookings.length === 0) {
    return (
      <Card title="Room Bookings" icon="📋" accent="#f59e0b">
        <p style={{ color: "#64748b", fontSize: 14, marginTop: 8 }}>
          You have no room booking requests.
        </p>
      </Card>
    );
  }

  return (
    <Card title="Room Bookings" icon="📋" accent="#f59e0b">
      <div style={{ overflowX: "auto", marginTop: 8 }}>
        <table style={tableStyles.table}>
          <thead>
            <tr>
              {["Booking ID", "Hall", "Room", "Status", "Requested On"].map(h => (
                <th key={h} style={tableStyles.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bookings.map(b => (
              <tr key={b.booking_id}
                onMouseOver={e => e.currentTarget.style.background = "#273449"}
                onMouseOut={e => e.currentTarget.style.background = "transparent"}
                style={{ transition: "background 0.15s" }}
              >
                <td style={{ ...tableStyles.td, fontFamily: "monospace" }}>#{b.booking_id}</td>
                <td style={tableStyles.td}>{b.hall_name}</td>
                <td style={{ ...tableStyles.td, fontFamily: "monospace", fontWeight: 600 }}>{b.room_number}</td>
                <td style={tableStyles.td}><Badge status={b.status} /></td>
                <td style={{ ...tableStyles.td, color: "#94a3b8" }}>
                  {new Date(b.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
