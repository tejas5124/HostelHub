import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/HostelNav.css';

const HostelNav = () => {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <nav className="hostel-nav">
      <button className="nav-button" onClick={() => handleNavigation('/add-hostel')}>
        <span className="button-icon">➕</span>
        Add Hostel
      </button>
      <button className="nav-button" onClick={() => handleNavigation('/remove-hostel')}>
        <span className="button-icon">🗑️</span>
        Remove Hostel
      </button>
      <button className="nav-button" onClick={() => handleNavigation('/view-hostels')}>
        <span className="button-icon">👁️</span>
        View Hostels
      </button>
      <button className="nav-button" onClick={() => handleNavigation('/Update-hostels')}>
        <span className="button-icon">✏️</span>
        Update Hostel
      </button>
      <button className="nav-button" onClick={() => handleNavigation('/manage-students')}>
        <span className="button-icon">👥</span>
        Manage Students
      </button>
    </nav>
  );
};

export default HostelNav; 