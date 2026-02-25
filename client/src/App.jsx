import Header from "./components/Header";
import LoginForm from "./components/LoginForm";
import StudentDashboard from "./components/StudentDashboard";
import AdminDashboard from "./components/AdminDashboard";
import { useState } from "react";

export default function App() {
  const [session, setSession] = useState(null);
  // session = { role: "student" | "admin", username: string }

  const handleLogin = (data, username, role) => {
    // console.log("Login successful:", data);
    setSession({ role, username });
  };

  const handleLogout = () => {
    setSession(null);
  };

  if (session?.role === "student") {
    return <StudentDashboard studentId={session.username} onLogout={handleLogout} />;
  }

  if (session?.role === "admin") {
    return <AdminDashboard hallName={session.username} onLogout={handleLogout} />;
  }

  return (
    <div className="container mt-5">
      <Header title="Hall Management System" />
      <LoginForm onLogin={handleLogin} />
    </div>
  );
}
