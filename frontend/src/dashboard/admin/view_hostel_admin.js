import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import '../../styles/view_hostel_admin.css';
import AdminHeader from './AdminHeader';

const ViewHostels = () => {
  const [hostels, setHostels] = useState([]);
  const [selectedHostel, setSelectedHostel] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'approved', 'rejected'

  useEffect(() => {
    const fetchHostels = async () => {
      try {
        const response = await axios.get('http://localhost:5000/all-hostels');
        setHostels(response.data);
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to fetch hostels: ' + err.message
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchHostels();
  }, []);

  const handleViewDetails = (hostel) => {
    setSelectedHostel(hostel);
  };

  const handleBack = () => {
    setSelectedHostel(null);
  };

  const handleApprove = async (hostelId) => {
    try {
      await axios.post(`http://localhost:5000/api/hostels/approve/${hostelId}`);
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Hostel approved successfully',
        timer: 2000,
        showConfirmButton: false
      });
      setHostels(hostels.map(h => h.hostel_id === hostelId ? { ...h, approval_status: 'approved' } : h));
      if (selectedHostel && selectedHostel.hostel_id === hostelId) {
        setSelectedHostel({ ...selectedHostel, approval_status: 'approved' });
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to approve hostel: ' + err.message
      });
    }
  };

  const handleReject = async (hostelId) => {
    try {
      await axios.post(`http://localhost:5000/api/hostels/reject/${hostelId}`);
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Hostel rejected successfully',
        timer: 2000,
        showConfirmButton: false
      });
      setHostels(hostels.map(h => h.hostel_id === hostelId ? { ...h, approval_status: 'rejected' } : h));
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to reject hostel: ' + err.message
      });
    }
  };

  const filteredHostels = hostels.filter(hostel => {
    if (filter === 'all') return true;
    return hostel.approval_status === filter;
  });

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading hostels...</p>
      </div>
    );
  }

  return (
    <div className="view-hostels-container">
      <AdminHeader />
      
      <div className="hostels-header">
        <h1>Hostel Management</h1>
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Hostels
          </button>
          <button 
            className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending
          </button>
          <button 
            className={`filter-btn ${filter === 'approved' ? 'active' : ''}`}
            onClick={() => setFilter('approved')}
          >
            Approved
          </button>
          <button 
            className={`filter-btn ${filter === 'rejected' ? 'active' : ''}`}
            onClick={() => setFilter('rejected')}
          >
            Rejected
          </button>
        </div>
      </div>

      {!selectedHostel ? (
        <div className="hostel-table-container">
          <table className="hostel-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Address</th>
                <th>Gender</th>
                <th>Rent</th>
                <th>Total Rooms</th>
                <th>Available Rooms</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredHostels.length > 0 ? (
                filteredHostels.map((hostel, index) => (
                  <tr key={hostel.hostel_id}>
                    <td>{index + 1}</td>
                    <td>{hostel.name}</td>
                    <td>{hostel.address}</td>
                    <td>{hostel.hostel_gender === 'boys' ? 'Boys' : 'Girls'}</td>
                    <td>₹{hostel.rent || 'N/A'}</td>
                    <td>{hostel.total_rooms || 'N/A'}</td>
                    <td>{hostel.available_rooms || 'N/A'}</td>
                    <td>
                      <span className={`status-badge ${hostel.approval_status}`}>
                        {hostel.approval_status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          onClick={() => handleViewDetails(hostel)}
                          className="view-btn"
                        >
                          View
                        </button>
                        {hostel.approval_status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleApprove(hostel.hostel_id)}
                              className="approve-btn"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => handleReject(hostel.hostel_id)}
                              className="reject-btn"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {hostel.approval_status === 'rejected' && (
                          <button 
                            onClick={() => handleApprove(hostel.hostel_id)}
                            className="approve-btn"
                          >
                            Re-approve
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="no-data">
                    <div className="no-hostels">
                      <h3>No hostels found</h3>
                      <p>There are no hostels matching the current filter.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="hostel-details">
          <div className="details-header">
            <button onClick={handleBack} className="back-button">
              <span className="back-icon">←</span> Back to List
            </button>
            <div className="title-section">
              <h2>{selectedHostel.name}</h2>
              <span className={`status-badge ${selectedHostel.approval_status}`}>
                {selectedHostel.approval_status}
              </span>
            </div>
          </div>

          <div className="details-content">
            <div className="main-content">
              <div className="hostel-img-container large">
                {selectedHostel.image_path ? (
                  <img
                    src={selectedHostel.image_path.startsWith('/uploads/')
                      ? `http://localhost:5000${selectedHostel.image_path}`
                      : `http://localhost:5000/uploads/${selectedHostel.image_path.replace(/^\/+/,'')}`}
                    alt={selectedHostel.name}
                    className="hostel-img"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/placeholder.png";
                    }}
                  />
                ) : (
                  <div className="no-image">No Image Available</div>
                )}
              </div>

              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">👥 Gender</span>
                  <span className="detail-value">{selectedHostel.hostel_gender === 'boys' ? 'Boys Hostel' : 'Girls Hostel'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">📍 Address</span>
                  <span className="detail-value">{selectedHostel.address}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">💰 Rent</span>
                  <span className="detail-value">₹{selectedHostel.rent || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">🛏️ Total Rooms</span>
                  <span className="detail-value">{selectedHostel.total_rooms || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">🚪 Available Rooms</span>
                  <span className="detail-value">{selectedHostel.available_rooms || 'N/A'}</span>
                </div>
              </div>

              <div className="description-section">
                <h3>Description</h3>
                <p>{selectedHostel.description || 'No description available.'}</p>
              </div>

              {selectedHostel.facilities && (
                <div className="facilities-section">
                  <h3>Facilities</h3>
                  <div className="facilities-grid">
                    {Array.isArray(selectedHostel.facilities) ? (
                      selectedHostel.facilities.map((facility, index) => (
                        <span key={index} className="facility-tag">
                          {facility}
                        </span>
                      ))
                    ) : (
                      <span className="facility-tag">{selectedHostel.facilities}</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="action-panel">
              {selectedHostel.approval_status === 'pending' && (
                <div className="action-buttons">
                  <button 
                    onClick={() => handleApprove(selectedHostel.hostel_id)}
                    className="approve-btn"
                  >
                    Approve Hostel
                  </button>
                  <button 
                    onClick={() => handleReject(selectedHostel.hostel_id)}
                    className="reject-btn"
                  >
                    Reject Hostel
                  </button>
                </div>
              )}
              {selectedHostel.approval_status === 'rejected' && (
                <div className="action-buttons">
                  <button 
                    onClick={() => handleApprove(selectedHostel.hostel_id)}
                    className="approve-btn"
                  >
                    Re-approve Hostel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewHostels;
