import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/OwnerHeader.css";

const OwnerHeader = () => {
  const navigate = useNavigate();
  const [ownerDetails, setOwnerDetails] = useState(null);

  useEffect(() => {
    const fetchOwnerDetails = async () => {
      const ownerId = localStorage.getItem('owner_id');
      if (!ownerId) return;

      try {
        const response = await fetch(`http://localhost:5000/owner-details/${ownerId}`);
        if (response.ok) {
          const data = await response.json();
          setOwnerDetails(data);
        }
      } catch (error) {
        console.error('Error fetching owner details:', error);
      }
    };

    fetchOwnerDetails();
  }, []);

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
        <img src="/image.png" alt="HostelHub Logo" className="logo-img" />
        <h1>HostelHub</h1>
      </div>
      <div className="header-right">
        {ownerDetails ? (
          <div className="owner-profile">
            <div className="owner-info">
              <span className="owner-name">Welcome, {ownerDetails.name || 'Owner'}</span>
              <span className="owner-email">{ownerDetails.email || ''}</span>
            </div>
            <div className="profile-actions">
              <button className="profile-btn" onClick={() => navigate('/profile')}>
                <span className="button-icon">👤</span>
                Profile
              </button>
              <button onClick={handleLogout} className="logout-btn">
                <span className="button-icon">🚪</span>
                Logout
              </button>
            </div>
          </div>
        ) : (
          <div className="profile-actions">
            <button onClick={handleLogout} className="logout-btn">
              <span className="button-icon">🚪</span>
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default OwnerHeader;
