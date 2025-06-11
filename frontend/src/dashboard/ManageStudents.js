import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './OwnerHeader';
import '../styles/ManageStudents.css';
import Swal from 'sweetalert2';

const ManageStudents = () => {
    const [bookingRequests, setBookingRequests] = useState([]);
    const [filteredRequests, setFilteredRequests] = useState([]);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [filters, setFilters] = useState({
        hostel: 'all',
        status: 'all',
        dateRange: 'all'
    });
    const [uniqueHostels, setUniqueHostels] = useState([]);
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
                // First, get all hostels owned by this owner
                const hostelsResponse = await fetch(`http://localhost:5000/owner-hostels/${ownerId}`);
                if (!hostelsResponse.ok) {
                    throw new Error('Failed to fetch owner hostels');
                }
                const hostelsData = await hostelsResponse.json();
                const ownerHostelIds = hostelsData.map(hostel => hostel.hostel_id);

                // Then, get all booking requests
                const bookingsResponse = await fetch(`http://localhost:5000/owner-bookings/${ownerId}`);
                if (!bookingsResponse.ok) {
                    throw new Error('Failed to fetch booking requests');
                }
                const allBookings = await bookingsResponse.json();

                // Filter bookings to only include those for this owner's hostels
                const filteredBookings = allBookings.filter(booking => 
                    ownerHostelIds.includes(booking.hostel_id)
                );

                setBookingRequests(filteredBookings);
                setFilteredRequests(filteredBookings);
                
                // Extract unique hostel names for filter
                const hostels = [...new Set(filteredBookings.map(booking => booking.hostel_name))];
                setUniqueHostels(hostels);
            } catch (error) {
                console.error('Error fetching booking requests:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to fetch booking requests. Please try again later.'
                });
            }
        };

        fetchBookingRequests();
    }, []);

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
                let message = '';
                if (status === 'approved') {
                    message = 'Booking approved. Student will be notified to visit the hostel for payment.';
                } else if (status === 'rejected') {
                    message = 'Booking request rejected.';
                } else {
                    message = `Booking request ${status} successfully`;
                }

                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: message,
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

    // Add filter handling function
    const handleFilterChange = (filterType, value) => {
        const newFilters = { ...filters, [filterType]: value };
        setFilters(newFilters);

        let filtered = [...bookingRequests];

        // Apply hostel filter
        if (newFilters.hostel !== 'all') {
            filtered = filtered.filter(booking => booking.hostel_name === newFilters.hostel);
        }

        // Apply status filter
        if (newFilters.status !== 'all') {
            filtered = filtered.filter(booking => booking.booking_status === newFilters.status);
        }

        // Apply date range filter
        if (newFilters.dateRange !== 'all') {
            const today = new Date();
            const thirtyDaysAgo = new Date(today.setDate(today.getDate() - 30));
            
            filtered = filtered.filter(booking => {
                const checkInDate = new Date(booking.check_in_date);
                switch (newFilters.dateRange) {
                    case 'last30':
                        return checkInDate >= thirtyDaysAgo;
                    case 'upcoming':
                        return checkInDate > today;
                    case 'past':
                        return checkInDate < today;
                    default:
                        return true;
                }
            });
        }

        setFilteredRequests(filtered);
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
        <div className="manage-students">
            <div className="dashboard-header">
                <Header onClick={() => navigate('/main-dashboard')} />
                <div className="logo" onClick={() => navigate('/main-dashboard')} style={{ cursor: 'pointer' }}>
                    <h1>HostelHub</h1>
                </div>
                <nav className="nav-menu">
                    <button className="nav-button" onClick={() => navigate('/add-hostel')}>
                        <span className="button-icon">➕</span>
                        Add Hostel
                    </button>
                    <button className="nav-button" onClick={() => navigate('/remove-hostel')}>
                        <span className="button-icon">🗑️</span>
                        Remove Hostel
                    </button>
                    <button className="nav-button" onClick={() => navigate('/view-hostels')}>
                        <span className="button-icon">👁️</span>
                        View Hostels
                    </button>
                    <button className="nav-button" onClick={() => navigate('/Update-hostels')}>
                        <span className="button-icon">✏️</span>
                        Update Hostel
                    </button>
                    <button className="nav-button active" onClick={() => navigate('/manage-students')}>
                        <span className="button-icon">👥</span>
                        Manage Students
                    </button>
                </nav>
            </div>

            <div className="main-content">
                <div className="booking-requests">
                    <h2>Student Booking Requests</h2>
                    
                    {/* Add Filter Section */}
                    <div className="filters-section">
                        <div className="filter-group">
                            <label htmlFor="hostel-filter">Filter by Hostel:</label>
                            <select 
                                id="hostel-filter"
                                value={filters.hostel}
                                onChange={(e) => handleFilterChange('hostel', e.target.value)}
                            >
                                <option value="all">All Hostels</option>
                                {uniqueHostels.map((hostel, index) => (
                                    <option key={index} value={hostel}>{hostel}</option>
                                ))}
                            </select>
                        </div>

                        <div className="filter-group">
                            <label htmlFor="status-filter">Filter by Status:</label>
                            <select 
                                id="status-filter"
                                value={filters.status}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>

                        <div className="filter-group">
                            <label htmlFor="date-filter">Filter by Date:</label>
                            <select 
                                id="date-filter"
                                value={filters.dateRange}
                                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                            >
                                <option value="all">All Dates</option>
                                <option value="last30">Last 30 Days</option>
                                <option value="upcoming">Upcoming</option>
                                <option value="past">Past</option>
                            </select>
                        </div>
                    </div>

                    {filteredRequests.length > 0 ? (
                        <div className="requests-grid">
                            {filteredRequests.map((booking) => (
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
                                        <div className="booking-message">
                                            <p>Student will visit hostel for payment</p>
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
            </div>
        </div>
    );
};

export default ManageStudents; 