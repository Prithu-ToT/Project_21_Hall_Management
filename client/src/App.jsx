import Header from "./components/Header";
import LoginForm from "./components/LoginForm";
import { useState } from "react";

export default function App() {

  const [userData, setUserData] = useState(null);
  const handleLogin = (data) => {                       // setter with extra setps
    console.log("Received from child:", data);
    setUserData(data); 
  };

  return (
    <div className="container mt-5">
      <Header title="Hall Management System" />
      <LoginForm onLogin={handleLogin}/>
    </div>
  );
}