import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaHome, FaBuilding, FaBed, FaUsers, FaMoneyBill, FaChartLine,
  FaUserGraduate, FaUserCog, FaChevronLeft, FaChevronRight, FaSignOutAlt
} from "react-icons/fa";
import "../HostelOwner/Sidebar.css";

const OwnerSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [owner, setOwner] = useState(null);
  const navigate = useNavigate();

  // Fetch user data from localStorage
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setOwner(storedUser);
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

  if (!owner) return null;

  return (
    <div className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <h3>{!isCollapsed && "Hostel Owner"}</h3>
        <button className="toggle-btn" onClick={toggleSidebar}>
          {isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
        </button>
      </div>

      {/* Sidebar Menu */}
      <ul className="sidebar-menu">
        <li>
          <NavLink to={`/owner-dashboard/${owner.id}`} className="menu-item">
            <FaHome /> {!isCollapsed && "Dashboard"}
          </NavLink>
        </li>

        <li>
          <NavLink to={`/owner-dashboard/${owner.id}/manage-hostels`} className="menu-item">
            <FaBuilding /> {!isCollapsed && "Manage Hostels"}
          </NavLink>
        </li>

        <li>
          <NavLink to={`/owner-dashboard/${owner.id}/manage-rooms`} className="menu-item">
            <FaBed /> {!isCollapsed && "Manage Rooms"}
          </NavLink>
        </li>

        <li>
          <NavLink to={`/owner-dashboard/${owner.id}/bookings`} className="menu-item">
            <FaUsers /> {!isCollapsed && "View & Approve Bookings"}
          </NavLink>
        </li>

        <li>
          <NavLink to={`/owner-dashboard/${owner.id}/payments`} className="menu-item">
            <FaMoneyBill /> {!isCollapsed && "Manage Payments"}
          </NavLink>
        </li>

        <li>
          <NavLink to={`/owner-dashboard/${owner.id}/manage-students`} className="menu-item">
            <FaUserGraduate /> {!isCollapsed && "Manage Students"}
          </NavLink>
        </li>

        <li>
          <NavLink to={`/owner-dashboard/${owner.id}/reports`} className="menu-item">
            <FaChartLine /> {!isCollapsed && "View Reports"}
          </NavLink>
        </li>

        <li>
          <NavLink to={`/owner-dashboard/${owner.id}/profile`} className="menu-item">
            <FaUserCog /> {!isCollapsed && "Profile Settings"}
          </NavLink>
        </li>
      </ul>

      {/* Sidebar Footer */}
      <div className="sidebar-footer">
        {!isCollapsed && owner && (
          <>
            <p>Welcome, {owner.name}!</p>
            <p>Email: {owner.email}</p>
            <p>Phone: {owner.phone_number}</p>
            <p>ID: {owner.id}</p>
          </>
        )}
        <button onClick={handleLogout} className="logout">
          <FaSignOutAlt /> {!isCollapsed && "Logout"}
        </button>
      </div>
    </div>
  );
};

export default OwnerSidebar;
