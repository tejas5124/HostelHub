import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaHome, FaBuilding, FaCheckCircle, FaUserTie, FaUserGraduate, FaCog, FaChevronLeft, FaChevronRight, FaSignOutAlt
} from "react-icons/fa";
import "../Admin/AdminSidebar.css";

const AdminSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [admin, setAdmin] = useState(null);
  const navigate = useNavigate();

  // Fetch admin data from localStorage
  useEffect(() => {
    const storedAdmin = JSON.parse(localStorage.getItem("user"));
    if (storedAdmin && storedAdmin.role === "college_admin") {
      setAdmin(storedAdmin);
    } else {
      navigate("/login");
    }
  }, [navigate]);

  // Toggle sidebar collapse
  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  // Logout Functionality
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (!admin) return null;

  return (
    <div className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <h3>{!isCollapsed && "Admin Panel"}</h3>
        <button className="toggle-btn" onClick={toggleSidebar}>
          {isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
        </button>
      </div>

      {/* Sidebar Menu */}
      <ul className="sidebar-menu">
        <li>
          <NavLink to={`/admin-dashboard/${admin.id}`} className="menu-item">
            <FaHome /> {!isCollapsed && "Dashboard"}
          </NavLink>
        </li>

        <li>
          <NavLink to={`/admin-dashboard/${admin.id}/view-hostels`} className="menu-item">
            <FaBuilding /> {!isCollapsed && "View Hostels"}
          </NavLink>
        </li>

        <li>
          <NavLink to={`/admin-dashboard/${admin.id}/approve-hostels`} className="menu-item">
            <FaCheckCircle /> {!isCollapsed && "Approve/Reject Hostels"}
          </NavLink>
        </li>
        <li>
          <NavLink to={`/admin-dashboard/${admin.id}/view-approved-rejected`} className="menu-item">
            <FaBuilding /> {!isCollapsed && "View Status Wise Hostels"}
          </NavLink>
        </li>

        <li>
          <NavLink to={`/admin-dashboard/${admin.id}/manage-owners`} className="menu-item">
            <FaUserTie /> {!isCollapsed && "Manage Owners"}
          </NavLink>
        </li>

        <li>
          <NavLink to={`/admin-dashboard/${admin.id}/manage-students`} className="menu-item">
            <FaUserGraduate /> {!isCollapsed && "Manage Students"}
          </NavLink>
        </li>

        <li>
          <NavLink to={`/admin-dashboard/${admin.id}/settings`} className="menu-item">
            <FaCog /> {!isCollapsed && "Settings"}
          </NavLink>
        </li>
      </ul>

      {/* Sidebar Footer */}
      <div className="sidebar-footer">
        {!isCollapsed && admin && (
          <>
            <p>Welcome, {admin.name}!</p>
            <p>Email: {admin.email}</p>
            <p>ID: {admin.id}</p>
          </>
        )}
        <button onClick={handleLogout} className="logout">
          <FaSignOutAlt /> {!isCollapsed && "Logout"}
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
