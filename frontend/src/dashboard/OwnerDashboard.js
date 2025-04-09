import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../dashboard/OwnerHeader";  // Import Header component
import "../styles/OwnerDashboard.css";

const OwnerDashboard = () => {
  const [formType, setFormType] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("/owner-session", {
          method: "GET",
          credentials: "include",
        });
        if (response.ok) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error("Error checking session:", error);
        setIsLoggedIn(false);
      }
    };

    checkSession();
  }, []);

  const handleButtonClick = (type, path) => {
    setFormType(type);
    navigate(path);
  };

  if (!isLoggedIn) {
    return <div className="login-message">Please log in to access the dashboard.</div>;
  }

  return (
    <div className="dashboard">
      <Header />  {/* Use Header component here */}

      {/* Navigation */}
      <nav className="nav-menu">
        <button className="nav-button" onClick={() => handleButtonClick("add", "/add-hostel")}>Add Hostel</button>
        <button className="nav-button" onClick={() => handleButtonClick("remove", "/remove-hostel")}>Remove Hostel</button>
        <button className="nav-button" onClick={() => handleButtonClick("view", "/view-hostels")}>View Hostels</button>
        <button className="nav-button" onClick={() => handleButtonClick("viewstu", "/view-students")}>View Students</button>
        <button className="nav-button" onClick={() => handleButtonClick("update", "/Update-hostels")}>Update Hostel</button>
        <button className="nav-button" onClick={() => handleButtonClick("manageUsers", "/manage-students")}>Manage Students</button>
      </nav>

      {/* Guide Section (Hidden when a button is clicked) */}
      {formType === null && (
        <section className="guide-section">
          <h2>Dashboard Guide</h2>
          <div className="guide-containers">
            <div className="guide-container"><strong>Add Hostel:</strong> Add new hostels with details like location, facilities, and images.</div>
            <div className="guide-container"><strong>Remove Hostel:</strong> Delete an existing hostel from your listings.</div>
            <div className="guide-container"><strong>View Hostels:</strong> See all the hostels you have added.</div>
            <div className="guide-container"><strong>View Students:</strong> View students who have booked your hostels.</div>
            <div className="guide-container"><strong>Update Hostel:</strong> Modify hostel details like availability and pricing.</div>
            <div className="guide-container"><strong>Manage Students:</strong> Approve or reject student booking requests.</div>
          </div>
        </section>
      )}
    </div>
  );
};

export default OwnerDashboard;
