import Header from "./components/Header";
import LoginForm from "./components/LoginForm";
import { useState } from "react";
import StudentDashboard from "./components/StduentDashboard";

export const BackendServer = "http://localhost:5000/";

export default function App() {

  const [session, setSession] = useState(null);
  // session = { role: "student" | "admin", username: string }

  const handleLogin = (data) => {                       // setter with extra setps
    console.log("Received from child:", data);
    setSession(data); 
  };

  const handleLogout = () => {
    setSession(null);
  }

  if(session?.role === "admin") {
    // return admin dashboard
  }

  if(session?.role === "student"){
    return <StudentDashboard username={session.username} />
  }
  
  return (
    <div className="page-shell">
      <div className="card-shell fade-up">
        <Header title="Hall Management System" />
        <LoginForm onLogin={handleLogin}/>
        {session && (
          <pre className="mt-3 bg-light p-3 rounded" style={{ fontSize: "0.8rem" }}>
            {JSON.stringify(session, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
