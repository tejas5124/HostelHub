import React, { useState } from "react";
import "../Admin/AdminDashboard.css";
import { FaUserShield, FaDollarSign, FaBed, FaUsers } from "react-icons/fa";
import AdminSidebar from "./AdminSidebar";

const AdminDashboard = () => {
  const [admin] = useState({
    id: 1,
    name: "Admin User",
    role: "admin",
  });

  const [stats] = useState({
    totalUsers: 120,
    totalHostels: 50,
    pendingApprovals: 8,
    totalRevenue: 50000,
  });

  const [recentActivities] = useState([
    { id: 1, activity: "Approved 'Sunrise Hostel' for listing." },
    { id: 2, activity: "Added a new admin user." },
    { id: 3, activity: "Reviewed pending payments from hostel owners." },
  ]);

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Dashboard */}
      <div className="admin-dashboard">
        <header className="dashboard-header">
          <h2>Welcome, {admin.name} 👋</h2>
        </header>

        <main className="dashboard-content">
          {/* Statistics Section */}
          <div className="dashboard-stats">
            <div className="stat-box">
              <FaUsers className="stat-icon" alt="Total Users" />
              <div>
                <h3>{stats.totalUsers}</h3>
                <p>Total Users</p>
              </div>
            </div>

            <div className="stat-box">
              <FaBed className="stat-icon" alt="Total Hostels" />
              <div>
                <h3>{stats.totalHostels}</h3>
                <p>Total Hostels</p>
              </div>
            </div>

            <div className="stat-box">
              <FaUserShield className="stat-icon" alt="Pending Approvals" />
              <div>
                <h3>{stats.pendingApprovals}</h3>
                <p>Pending Approvals</p>
              </div>
            </div>

            <div className="stat-box">
              <FaDollarSign className="stat-icon" alt="Total Revenue" />
              <div>
                <h3>${stats.totalRevenue}</h3>
                <p>Total Revenue</p>
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="dashboard-section">
            <h3>Recent Activities</h3>
            <ul>
              {recentActivities.map((activity) => (
                <li key={activity.id}>{activity.activity}</li>
              ))}
            </ul>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
