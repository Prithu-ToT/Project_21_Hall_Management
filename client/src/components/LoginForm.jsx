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
    <div className="container mt-5">

      <form onSubmit={handleSubmit} className="card p-4 shadow">
        <TextInput
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <TextInput
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <div className="mb-3">
          <label className="form-label">Login as:</label>
          <div className="d-flex gap-2">
            <Button
              variant={role === "student" ? "success" : "outline-success"}
              onClick={() => setRole("student")}
            >
              Student
            </Button>

            <Button
              variant={role === "admin" ? "danger" : "outline-danger"}
              onClick={() => setRole("admin")}
            >
              Admin
            </Button>
          </div>
        </div>

        <Button type="submit" variant="primary" className="w-100">
          Login
        </Button>
      </form>
    </div>
  );
}