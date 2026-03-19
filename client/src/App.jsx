import Header from "./components/Header";
import LoginForm from "./components/LoginForm";
import { useState } from "react";
import StudentDashboard from "./components/StudentComponents/StduentDashboard";
import AdminDashboard from "./components/AdminComponents/AdminDashboard";
import SysAdminDashboard from "./components/SysAdminComponents/SysAdminDashboard";

export const BackendServer = "http://localhost:5000/";

export default function App() {
  const [session, setSession] = useState(null);
  // session = { role: "student" | "admin" | "sysadmin", username: string }

  const handleLogin  = (data) => setSession(data);
  const handleLogout = ()     => setSession(null);

  if (session?.role === "sysadmin") {
    return <SysAdminDashboard onLogout={handleLogout} />;
  }

  if (session?.role === "admin") {
    return <AdminDashboard username={session.username} onLogout={handleLogout} />;
  }

  if (session?.role === "student") {
    return <StudentDashboard username={session.username} onLogout={handleLogout} />;
  }

  return (
    <div className="page-shell">
      <div className="card-shell fade-up">
        <Header title="Hall Management System" />
        <LoginForm onLogin={handleLogin} />
      </div>
    </div>
  );
}
