import { useState } from "react";
import TextInput from "./TextInput";
import Button from "./Button";

import { BackendServer } from "../App";

export default function LoginForm({onLogin}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");

  function resetForm (){
    setUsername("");
    setPassword("");
    setRole("");
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    
    if (!username || !password) {
      alert("Please fill username and password");
      return;
    }

    if (!role) {
      alert("Please select a role");
      return;
    }
    
    const userInput = { username, password, role };

    try {
      const response = await fetch(BackendServer + "login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userInput)
      });

      const confirmation = await response.json();

      if (!response.ok) {
        alert(confirmation.message || "Login failed");
        resetForm();
        return;
      }

      // callback with data
      const userDetails = {
        username: userInput.username,
        role: userInput.role,
      };

      onLogin(userDetails);

    } catch (error) {
      alert("An error occurred. Please try again.");
      resetForm();
      console.error("Login error:", error);
    }
  };

  return (
    <div
      style={{
        background: "var(--surface)",
        borderRadius: "var(--radius)",
        boxShadow: "var(--shadow-lg)",
        padding: "2rem 2rem 1.75rem",
        border: "1px solid var(--border)",
      }}
    >
      <p style={{
        fontSize: "0.88rem",
        color: "var(--text-muted)",
        marginBottom: "1.5rem",
        textAlign: "center",
        letterSpacing: "0.01em",
      }}>
        Sign in to your account to continue
      </p>

      <form onSubmit={handleSubmit}>
        <TextInput
          label="Student / Staff ID"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your ID"
          required
        />

        <TextInput
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          required
        />

        {/* Role selector */}
        <div className="mb-4">
          <label className="form-label">Sign in as</label>
          <div className="d-flex gap-2">
            <Button
              variant={role === "student" ? "success" : "outline-success"}
              onClick={() => setRole("student")}
              className="flex-fill"
            >
              Student
            </Button>

            <Button
              variant={role === "admin" ? "danger" : "outline-danger"}
              onClick={() => setRole("admin")}
              className="flex-fill"
            >
              Admin
            </Button>
          </div>
        </div>

        <Button type="submit" variant="primary" className="w-100" style={{ padding: "0.7rem" }}>
          Sign In →
        </Button>
      </form>

      <p style={{
        textAlign: "center",
        fontSize: "0.78rem",
        color: "var(--text-muted)",
        marginTop: "1.25rem",
        marginBottom: 0,
      }}>
        Residential Hall Management · University Portal
      </p>
    </div>
  );
}
