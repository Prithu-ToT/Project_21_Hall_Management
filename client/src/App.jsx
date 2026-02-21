/*  Heartbeat test written by me
import { useState, useEffect } from 'react';
import "./App.css";

export default function App() {

  const [status, setStatus] = useState("Heartbeat");

  useEffect(() => {
    
    async function checkHB() {
      try{
        const response = await fetch("http://localhost:5000/heartbeat");
        const data = await response.json();
        setStatus(data.status);
      } catch(error){
        setStatus("Dead")
      }
    }

    checkHB();
  },[]);
    
  return (
    <div className="container mt-5">
      <h1 className="text-primary">Hall Management System</h1>
      <button className="btn btn-success mt-3">
        {status}
      </button>
    </div>
  );
}
*/
import Header from "./components/Header";
import LoginForm from "./components/LoginForm";

export default function App() {
  return (
    <div className="container mt-5">
      <Header title="Hall Management System" />
      <LoginForm />
    </div>
  );
}