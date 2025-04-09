import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/OwnerHeader.css";

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await fetch("/owner-logout", {
        method: "POST",
        credentials: "include",
      });
      window.location.href = "/owner-login";
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <header className="navbar">
      <div className="logo" onClick={() => navigate("/owner-dashboard")} style={{ cursor: "pointer" }}>
        <img src="image.png" alt="HostelHub Logo" className="logo-img" />
        <h1>HostelHub</h1>
      </div>
      <button onClick={handleLogout} className="logout-btn">Logout</button>
    </header>
  );
};

export default Header;
