// AdminAllocationCard.jsx
// Receives hallId as a prop — passed down from AdminDashboard once hall info loads.
// Implement allocation management UI here.

const AdminAllocationCard = ({ hallId }) => {
    return (
        <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
            Allocation management for hall <strong>{hallId}</strong> — coming soon.
        </p>
    );
};

export default AdminAllocationCard;
