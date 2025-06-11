import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../dashboard/OwnerHeader";
import "../styles/OwnerDashboard.css";
import Swal from "sweetalert2";

const OwnerDashboard = () => {
  const [formType, setFormType] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const [bookingRequests, setBookingRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('hostels'); // 'hostels' or 'bookings'
  const [hostels, setHostels] = useState([]);

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
          Swal.fire({
            icon: 'warning',
            title: 'Session Expired',
            text: 'Please log in again to continue.',
          }).then(() => {
            navigate('/owner-login');
          });
        }
      } catch (error) {
        console.error("Error checking session:", error);
        setIsLoggedIn(false);
      }
    };

    checkSession();
  }, [navigate]);

  useEffect(() => {
    const fetchBookingRequests = async () => {
      const ownerId = localStorage.getItem('owner_id');
      if (!ownerId) return;

      try {
        const response = await fetch(`http://localhost:5000/owner-bookings/${ownerId}`);
        if (response.ok) {
          const data = await response.json();
          setBookingRequests(data);
        }
      } catch (error) {
        console.error('Error fetching booking requests:', error);
      }
    };

    if (activeTab === 'bookings') {
      fetchBookingRequests();
    }
  }, [activeTab]);

  useEffect(() => {
    const fetchHostels = async () => {
      const ownerId = localStorage.getItem('owner_id');
      if (!ownerId) return;

      try {
        const response = await fetch(`http://localhost:5000/owner-hostels/${ownerId}`);
        if (response.ok) {
          const data = await response.json();
          setHostels(data);
        }
      } catch (error) {
        console.error('Error fetching hostels:', error);
      }
    };

    if (activeTab === 'hostels') {
      fetchHostels();
    }
  }, [activeTab]);

  const handleButtonClick = (type) => {
    setFormType(type);
    navigate(`/${type}`);
  };

  const handleBookingStatus = async (bookingId, status) => {
    try {
      const response = await fetch(`http://localhost:5000/update-booking-status/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: `Booking request ${status} successfully`,
        });
        // Refresh booking requests
        const ownerId = localStorage.getItem('owner_id');
        const updatedResponse = await fetch(`http://localhost:5000/owner-bookings/${ownerId}`);
        if (updatedResponse.ok) {
          const data = await updatedResponse.json();
          setBookingRequests(data);
        }
      } else {
        throw new Error('Failed to update booking status');
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Failed to update booking status',
      });
    }
  };

  const handlePaymentStatus = async (bookingId, status) => {
    try {
      const response = await fetch(`http://localhost:5000/update-payment-status/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Payment status updated successfully',
        });
        // Refresh booking requests
        const ownerId = localStorage.getItem('owner_id');
        const updatedResponse = await fetch(`http://localhost:5000/owner-bookings/${ownerId}`);
        if (updatedResponse.ok) {
          const data = await updatedResponse.json();
          setBookingRequests(data);
        }
      } else {
        throw new Error('Failed to update payment status');
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Failed to update payment status',
      });
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="login-message">
        <div className="loading-spinner"></div>
        <p>Please log in to access the dashboard.</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <Header onClick={() => navigate('/main-dashboard')} />
        <div className="logo" onClick={() => navigate('/main-dashboard')} style={{ cursor: 'pointer' }}>
          <h1>Your Logo/Name</h1>
        </div>
        <nav className="nav-menu">
          <button className="nav-button" onClick={() => handleButtonClick("add-hostel")}>
            <span className="button-icon">➕</span>
            Add Hostel
          </button>
          <button className="nav-button" onClick={() => handleButtonClick("remove-hostel")}>
            <span className="button-icon">🗑️</span>
            Remove Hostel
          </button>
          <button className="nav-button" onClick={() => handleButtonClick("view-hostels")}>
            <span className="button-icon">👁️</span>
            View Hostels
          </button>
          <button className="nav-button" onClick={() => handleButtonClick("Update-hostels")}>
            <span className="button-icon">✏️</span>
            Update Hostel
          </button>
          <button className="nav-button" onClick={() => handleButtonClick("manage-students")}>
            <span className="button-icon">👥</span>
            Manage Students
          </button>
        </nav>
      </div>

      <section className="guide-section">
        <h2>Welcome to Your Dashboard</h2>
        <p className="guide-subtitle">Here's what you can do:</p>
        <div className="guide-containers">
          <div className="guide-container">
            <strong>Add Hostel</strong>
            <p>Add new hostels with details like location, facilities, and images.</p>
            <span className="guide-icon">🏢</span>
          </div>
          <div className="guide-container">
            <strong>Remove Hostel</strong>
            <p>Delete an existing hostel from your listings.</p>
            <span className="guide-icon">🗑️</span>
          </div>
          <div className="guide-container">
            <strong>View Hostels</strong>
            <p>See all the hostels you have added.</p>
            <span className="guide-icon">👁️</span>
          </div>
          <div className="guide-container">
            <strong>Update Hostel</strong>
            <p>Modify hostel details like availability and pricing.</p>
            <span className="guide-icon">✏️</span>
          </div>
          <div className="guide-container">
            <strong>Manage Students</strong>
            <p>Approve or reject student booking requests.</p>
            <span className="guide-icon">👥</span>
          </div>
        </div>
      </section>

      <div className="nav-menu">
        <button 
          className={`nav-button ${activeTab === 'hostels' ? 'active' : ''}`}
          onClick={() => setActiveTab('hostels')}
        >
          <span className="button-icon">🏠</span>
          My Hostels
        </button>
        <button 
          className={`nav-button ${activeTab === 'bookings' ? 'active' : ''}`}
          onClick={() => setActiveTab('bookings')}
        >
          <span className="button-icon">📋</span>
          Booking Requests
        </button>
      </div>

      <div className="main-content">
        {activeTab === 'hostels' ? (
          <div className="hostels-section">
            <h2>My Hostels</h2>
            <div className="hostels-grid">
              {hostels.map((hostel) => (
                <div key={hostel.hostel_id} className="hostel-card">
                  <div className="hostel-image">
                    <img src={hostel.image_path} alt={hostel.name} />
                    <div className={`gender-badge ${hostel.hostel_gender}`}>
                      {hostel.hostel_gender === 'boys' ? '👨‍🎓 Boys Hostel' : '👩‍🎓 Girls Hostel'}
                    </div>
                  </div>
                  <div className="hostel-details">
                    <div className="hostel-header">
                      <h3>{hostel.name}</h3>
                      <div className={`status-badge ${hostel.approval_status}`}>
                        {hostel.approval_status}
                      </div>
                    </div>
                    <p className="hostel-address">{hostel.address}</p>
                    <div className="hostel-stats">
                      <div className="stat-item">
                        <span className="stat-label">Rooms</span>
                        <span className="stat-value">{hostel.total_rooms}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Available</span>
                        <span className="stat-value">{hostel.available_rooms}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Rent</span>
                        <span className="stat-value">₹{hostel.rent}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="booking-requests">
            <h2>Booking Requests</h2>
            {bookingRequests.length > 0 ? (
              <div className="requests-grid">
                {bookingRequests.map((booking) => (
                  <div key={booking.booking_id} className="request-card">
                    <div className="request-header">
                      <h3>{booking.hostel_name}</h3>
                      <span className={`status-badge ${booking.booking_status}`}>
                        {booking.booking_status}
                      </span>
                    </div>
                    <div className="request-details">
                      <div className="detail-item">
                        <span className="detail-label">Student Name:</span>
                        <span className="detail-value">{booking.student_name}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Email:</span>
                        <span className="detail-value">{booking.student_email}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Phone:</span>
                        <span className="detail-value">{booking.student_phone}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Check-in:</span>
                        <span className="detail-value">
                          {new Date(booking.check_in_date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Check-out:</span>
                        <span className="detail-value">
                          {booking.check_out_date 
                            ? new Date(booking.check_out_date).toLocaleDateString()
                            : 'Long-term stay'}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Monthly Rate:</span>
                        <span className="detail-value">₹{booking.total_amount}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Payment Status:</span>
                        <span className={`payment-status ${booking.payment_status}`}>
                          {booking.payment_status}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Available Rooms:</span>
                        <span className="detail-value">{booking.available_rooms}</span>
                      </div>
                    </div>
                    {booking.booking_status === 'pending' && (
                      <div className="request-actions">
                        <button
                          className="approve-btn"
                          onClick={() => handleBookingStatus(booking.booking_id, 'approved')}
                          disabled={booking.available_rooms <= 0}
                          title={booking.available_rooms <= 0 ? 'No rooms available' : 'Approve booking'}
                        >
                          Approve
                        </button>
                        <button
                          className="reject-btn"
                          onClick={() => handleBookingStatus(booking.booking_id, 'rejected')}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    {booking.booking_status === 'approved' && (
                      <div className="request-actions">
                        <button
                          className="payment-btn"
                          onClick={() => handlePaymentStatus(booking.booking_id, 'paid')}
                          disabled={booking.payment_status === 'paid'}
                        >
                          Mark as Paid
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-requests">
                <p>No booking requests found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerDashboard;
