import { useState } from "react";
import TextInput from "./TextInput";
import Button from "./Button";

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();                             // refreshing is done in React way, not old html way
    console.log({ username, password, role });
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