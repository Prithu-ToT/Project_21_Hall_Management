import { Card, StatRow, Badge } from "./studentDashboardUtils";

export default function StudentOverview({ profile, allocation }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
      gap: "1.25rem"
    }}>

      {/* Personal Info */}
      <Card title="Personal Info" icon="🎓" accent="#6366f1">
        <StatRow label="Full Name"   value={profile.name} />
        <StatRow label="Department"  value={profile.department} />
        <StatRow label="Semester"    value={profile.semester} />
        <StatRow label="Phone"       value={profile.phone_number} />
        <StatRow label="NID"         value={profile.nid} mono />
      </Card>

      {/* Hall Allocation */}
      <Card title="Hall Allocation" icon="🏠" accent="#0ea5e9">
        {allocation ? (
          <>
            <StatRow label="Hall"   value={allocation.hall_name} />
            <StatRow label="Room"   value={allocation.room_number} />
            <StatRow label="Status" value={<Badge status={allocation.alloc_status} />} />
          </>
        ) : (
          <p style={{ color: "#64748b", fontSize: 14, marginTop: 8 }}>
            No hall allocation found.
          </p>
        )}
      </Card>

      {/* Payment */}
      <Card title="Seat Fee Payment" icon="💳" accent="#22c55e">
        {allocation ? (
          <>
            <StatRow
              label="Amount"
              value={
                allocation.seat_fee_paid
                  ? `৳ ${parseFloat(allocation.seat_fee_paid).toFixed(2)}`
                  : "—"
              }
            />
            <StatRow
              label="Status"
              value={
                allocation.seat_fee_paid
                  ? <span style={{ color: "#22c55e", fontWeight: 700 }}>Paid ✓</span>
                  : <span style={{ color: "#f59e0b", fontWeight: 700 }}>Unpaid</span>
              }
            />
            {allocation.bank_transaction_id && (
              <StatRow label="Txn ID" value={allocation.bank_transaction_id} mono />
            )}
          </>
        ) : (
          <p style={{ color: "#64748b", fontSize: 14, marginTop: 8 }}>
            No allocation — no payment record.
          </p>
        )}
      </Card>

    </div>
  );
}
