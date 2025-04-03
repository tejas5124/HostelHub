import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaHome, FaBuilding, FaCheckCircle, FaBook, FaCog, FaChevronLeft, FaChevronRight, FaSignOutAlt
} from "react-icons/fa";
import "./StudentSidebar.css"; // Ensure correct path

const StudentSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [student, setStudent] = useState(null);
  const navigate = useNavigate();

  // Fetch student data from localStorage
  useEffect(() => {
    const storedStudent = JSON.parse(localStorage.getItem("user"));
    if (storedStudent && storedStudent.role === "student") {
      setStudent(storedStudent);
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

  if (!student) return null; // Prevent rendering before data is loaded

  return (
    <div className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <h3>{!isCollapsed && "Student Panel"}</h3>
        <button className="toggle-btn" onClick={toggleSidebar}>
          {isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
        </button>
      </div>

      {/* Sidebar Menu */}
      <ul className="sidebar-menu">
        <li>
          <NavLink to={`/student-dashboard/${student.id}`} className="menu-item">
            <FaHome /> {!isCollapsed && "Dashboard"}
          </NavLink>
        </li>

        <li>
          <NavLink to={`/student-dashboard/${student.id}/view-status-wise-hostels`} className="menu-item">
            <FaCheckCircle /> {!isCollapsed && "View Hostels (Status Wise)"}
          </NavLink>
        </li>

        <li>
          <NavLink to={`/student-dashboard/${student.id}/book-hostel`} className="menu-item">
            <FaBook /> {!isCollapsed && "Book Hostel"}
          </NavLink>
        </li>

        <li>
          <NavLink to={`/student-dashboard/${student.id}/settings`} className="menu-item">
            <FaCog /> {!isCollapsed && "Settings"}
          </NavLink>
        </li>
      </ul>

      {/* Sidebar Footer */}
      <div className="sidebar-footer">
        {!isCollapsed && student && (
          <>
            <p>Welcome, {student.name}!</p>
            <p>Email: {student.email}</p>
            <p>ID: {student.id}</p>
          </>
        )}
        <button onClick={handleLogout} className="logout">
          <FaSignOutAlt /> {!isCollapsed && "Logout"}
        </button>
      </div>
    </div>
  );
};

export default StudentSidebar;
