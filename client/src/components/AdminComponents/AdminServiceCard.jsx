// AdminServiceCard.jsx
// Receives hallId as a prop — passed down from AdminDashboard once hall info loads.
// Implement service management UI here.

const AdminServiceCard = ({ hallId }) => {
    return (
        <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
            Service management for hall <strong>{hallId}</strong> — coming soon.
        </p>
    );
};

export default AdminServiceCard;
