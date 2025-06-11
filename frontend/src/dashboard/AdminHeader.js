import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AdminHeader.css";

const AdminHeader = () => {
  const navigate = useNavigate();
  const [adminDetails, setAdminDetails] = useState(null);

  useEffect(() => {
    const fetchAdminDetails = async () => {
      const adminId = localStorage.getItem('admin_id');
      if (!adminId) return;

      try {
        const response = await fetch(`http://localhost:5000/admin-details/${adminId}`);
        if (response.ok) {
          const data = await response.json();
          setAdminDetails(data);
        }
      } catch (error) {
        console.error('Error fetching admin details:', error);
      }
    };

    fetchAdminDetails();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/admin-logout", {
        method: "POST",
        credentials: "include",
      });
      window.location.href = "/admin-login";
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <header className="navbar">
      <div className="logo" onClick={() => navigate("/admin-dashboard")} style={{ cursor: "pointer" }}>
        <img src="/image.png" alt="HostelHub Logo" className="logo-img" />
        <h1>HostelHub</h1>
      </div>
      <div className="header-right">
        {adminDetails ? (
          <div className="admin-profile">
            <div className="admin-info">
              <span className="admin-name">Welcome, {adminDetails.name || 'Admin'}</span>
              <span className="admin-email">{adminDetails.email || ''}</span>
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

export default AdminHeader; 