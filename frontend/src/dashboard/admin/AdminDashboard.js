import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/AdminDashboard.css';
import ViewHostels from './view_hostel_admin';
import ApproveHostel from './ApproveHostel';
import ViewStudents from './ViewStudents';
import AdminHeader from './AdminHeader';
import Profile from '../../common/Profile';

function AdminDashboard() {
  const navigate = useNavigate();
  const [formType, setFormType] = useState(null);
  const [hostels, setHostels] = useState([]);
  const [approvedCount, setApprovedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [updateCount, setUpdateCount] = useState(0);

  useEffect(() => {
    const fetchHostels = async () => {
      try {
        const response = await axios.get('http://localhost:5000/all-hostels');
        const hostelsData = response.data;

        setHostels(hostelsData);

        const approved = hostelsData.filter(hostel => hostel.approval_status === 'approved').length;
        const pending = hostelsData.filter(hostel => hostel.approval_status === 'pending').length;
        const rejected = hostelsData.filter(hostel => hostel.approval_status === 'rejected').length;

        setApprovedCount(approved);
        setPendingCount(pending);
        setRejectedCount(rejected);
      } catch (error) {
        console.error('Error fetching hostels:', error);
      }
    };

    fetchHostels();
  }, [updateCount]);

  const handleButtonClick = (type) => {
    setFormType(type);
  };

  const triggerUpdate = () => {
    setUpdateCount(prev => prev + 1);
  };

  return (
    <div className="dashboard">
      <AdminHeader />
      
      <div className="nav-menu">
        <button className="nav-button" onClick={() => handleButtonClick("view")}>View All Hostels</button>
        <button className="nav-button" onClick={() => handleButtonClick("approve")}>Approve Hostels</button>
        <button className="nav-button" onClick={() => handleButtonClick("students")}>View Students</button>
      </div>

      <div className="main-content">
        {formType === 'view' && <ViewHostels />}
        {formType === 'approve' && <ApproveHostel onAction={triggerUpdate} />}
        {formType === 'students' && <ViewStudents />}

        {/* Guide Section (Shown when no component is selected) */}
        {!formType && (
          <section className="guide-section">
            <h2>Admin Dashboard Guide</h2>
            <div className="guide-containers">
              <div className="guide-container">
                <strong>View All Hostels</strong>
                View and manage all hostels in the system, including their details and status.
              </div>
              <div className="guide-container">
                <strong>Approve Hostels</strong>
                Review and approve pending hostel registrations from hostel owners.
              </div>
              <div className="guide-container">
                <strong>View Students</strong>
                Access and manage student information and their hostel bookings.
              </div>
            </div>
          </section>
        )}

        {/* Statistics Cards */}
        <div className="stats-cards">
          <div className="card">
            <h3>Total Hostels</h3>
            <p>{hostels.length}</p>
          </div>
          <div className="card">
            <h3>Pending Approvals</h3>
            <p>{pendingCount}</p>
          </div>
          <div className="card">
            <h3>Approved Hostels</h3>
            <p>{approvedCount}</p>
          </div>
          <div className="card">
            <h3>Rejected Hostels</h3>
            <p>{rejectedCount}</p>
          </div>
        </div>
      </div>

     
    </div>
  );
}

export default AdminDashboard;
