import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import '../styles/student-dashboard.css';

const StudentDashboard = () => {
    const [hostels, setHostels] = useState([]);
    const [originalHostels, setOriginalHostels] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFacilities, setSelectedFacilities] = useState([]);
    const [sortOption, setSortOption] = useState('');
    const [selectedHostel, setSelectedHostel] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [studentDetails, setStudentDetails] = useState(null);
    const [stats, setStats] = useState({
        totalBookings: 0,
        activeBookings: 0
    });
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [bookingDetails, setBookingDetails] = useState({
        check_in_date: '',
        check_out_date: '',
        total_amount: 0
    });
    
    const navigate = useNavigate();

    useEffect(() => {
        const checkSession = async () => {
            try {
                const response = await fetch("/student-session", {
                    method: "GET",
                    credentials: "include",
                });
                if (response.ok) {
                    setIsLoggedIn(true);
                    fetchStudentStats();
                    fetchStudentDetails();
                } else {
                    setIsLoggedIn(false);
                    Swal.fire({
                        icon: 'warning',
                        title: 'Session Expired',
                        text: 'Please log in again to continue.',
                    }).then(() => {
                        navigate('/student-login');
                    });
                }
            } catch (error) {
                console.error("Error checking session:", error);
                setIsLoggedIn(false);
            }
        };

        checkSession();
    }, [navigate]);

    const fetchStudentDetails = async () => {
        const studentId = localStorage.getItem('student_id');
        if (!studentId) return;

        try {
            const response = await fetch(`http://localhost:5000/student-details/${studentId}`);
            if (response.ok) {
                const data = await response.json();
                setStudentDetails(data);
            } else {
                console.error('Failed to fetch student details');
            }
        } catch (error) {
            console.error('Error fetching student details:', error);
        }
    };

    const fetchStudentStats = async () => {
        const studentId = localStorage.getItem('student_id');
        if (!studentId) return;

        try {
            const response = await fetch(`http://localhost:5000/student-stats/${studentId}`);
            if (response.ok) {
                const data = await response.json();
                setStats({
                    totalBookings: data.totalBookings || 0,
                    activeBookings: data.activeBookings || 0
                });
            }
        } catch (error) {
            console.error('Error fetching student stats:', error);
        }
    };

    useEffect(() => {
        const fetchHostels = async () => {
            try {
                const response = await fetch('http://localhost:5000/stu_hostels');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                const processedData = data.map(hostel => ({
                    ...hostel,
                    facilities: Array.isArray(hostel.facilities)
                        ? hostel.facilities
                        : typeof hostel.facilities === 'string'
                            ? JSON.parse(hostel.facilities || '[]')
                            : []
                }));
                setHostels(processedData);
                setOriginalHostels(processedData);
            } catch (error) {
                console.error('Error fetching hostels:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to fetch hostels. Please try again later.',
                });
            }
        };

        if (isLoggedIn) {
            fetchHostels();
        }
    }, [isLoggedIn]);

    useEffect(() => {
        applyFilters();
    }, [searchTerm, selectedFacilities, sortOption]);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleFacilityChange = (facility) => {
        setSelectedFacilities(prev =>
            prev.includes(facility)
                ? prev.filter(f => f !== facility)
                : [...prev, facility]
        );
    };

    const handleSortChange = (event) => {
        setSortOption(event.target.value);
    };

    const applyFilters = () => {
        let filteredHostels = originalHostels;

        if (searchTerm) {
            filteredHostels = filteredHostels.filter(hostel =>
                hostel.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (selectedFacilities.length > 0) {
            filteredHostels = filteredHostels.filter(hostel => {
                const facilitiesArray = Array.isArray(hostel.facilities)
                    ? hostel.facilities
                    : typeof hostel.facilities === 'string'
                        ? JSON.parse(hostel.facilities || '[]')
                        : [];
                return selectedFacilities.every(facility =>
                    facilitiesArray.includes(facility)
                );
            });
        }

        if (sortOption === 'price_asc') {
            filteredHostels = filteredHostels.sort((a, b) => a.rent - b.rent);
        } else if (sortOption === 'price_desc') {
            filteredHostels = filteredHostels.sort((a, b) => b.rent - a.rent);
        }

        setHostels(filteredHostels);
    };

    const handleBookHostel = (hostelId) => {
        const hostel = hostels.find(h => h.hostel_id === hostelId);
        setSelectedHostel(hostel);
    };

    const handleBack = () => {
        setSelectedHostel(null);
    };

    const handleLogout = async () => {
        try {
            await fetch("/student-logout", {
                method: "POST",
                credentials: "include",
            });
            localStorage.removeItem('student_id');
            navigate('/student-login');
        } catch (error) {
            console.error("Error logging out:", error);
        }
    };

    const calculateTotalAmount = (checkIn) => {
        if (!checkIn || !selectedHostel) return 0;
        // Since rate is monthly, we'll just return the monthly rent
        return selectedHostel.rent;
    };

    const handleBookingSubmit = async (e) => {
        e.preventDefault();
        const studentId = localStorage.getItem('student_id');
        
        if (!studentId) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Please log in to book a hostel',
            });
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/add-booking', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    hostel_id: selectedHostel.hostel_id,
                    student_id: studentId,
                    check_in_date: bookingDetails.check_in_date,
                    check_out_date: bookingDetails.check_out_date || null, // Make check-out date optional
                    total_amount: bookingDetails.total_amount,
                    payment_status: 'pending'
                }),
            });

            const data = await response.json();

            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Booking request submitted successfully. The hostel owner will review your request.',
                });
                setShowBookingModal(false);
                setSelectedHostel(null);
            } else {
                throw new Error(data.message || 'Failed to submit booking request');
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Failed to submit booking request',
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
            <header className="dashboard-header">
                <div className="logo" onClick={() => navigate('/student-dashboard')} style={{ cursor: 'pointer' }}>
                    <img src="/image.png" alt="HostelHub Logo" className="logo-img" />
                    <h1>HostelHub</h1>
                </div>
                <div className="header-right">
                    {studentDetails ? (
                        <div className="student-profile">
                            <div className="student-info">
                                <span className="student-name">Welcome, {studentDetails.name || 'Student'}</span>
                                <span className="student-email">{studentDetails.email || ''}</span>
                            </div>
                            <div className="profile-actions">
                                <button className="profile-btn" onClick={() => navigate('/profile')}>
                                    <span className="button-icon">👤</span>
                                    Profile
                                </button>
                                <button onClick={handleLogout} className="logout-btn">
                                    <span className="button-icon">🚪</span>
                                    Logout
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="profile-actions">
                            <button onClick={handleLogout} className="logout-btn">
                                <span className="button-icon">🚪</span>
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </header>

            <div className="nav-menu">
                <button className="nav-button" onClick={() => setSelectedHostel(null)}>
                    <span className="button-icon">🏠</span>
                    Browse Hostels
                </button>
                <button className="nav-button" onClick={() => navigate('/my-bookings')}>
                    <span className="button-icon">📚</span>
                    My Bookings
                </button>
                <button className="nav-button" onClick={() => navigate('/profile')}>
                    <span className="button-icon">👤</span>
                    Profile
                </button>
            </div>

            <div className="main-content">
                {/* Statistics Cards */}
                <div className="stats-container">
                    <div className="stat-card">
                        <h3>Total Bookings</h3>
                        <p>{stats.totalBookings}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Active Bookings</h3>
                        <p>{stats.activeBookings}</p>
                    </div>
                </div>

                {!selectedHostel ? (
                    <>
                        <div className="search-bar">
                            <input
                                type="text"
                                placeholder="Search hostel by name..."
                                value={searchTerm}
                                onChange={handleSearch}
                            />
                        </div>

                        <div className="content">
                            <aside className="filters">
                                <h2>Filters</h2>
                                <div className="checkbox-group">
                                    <label>
                                        <input
                                            type="checkbox"
                                            value="wifi"
                                            checked={selectedFacilities.includes('wifi')}
                                            onChange={() => handleFacilityChange('wifi')}
                                        />
                                        Wi-Fi
                                    </label>
                                    <label>
                                        <input
                                            type="checkbox"
                                            value="gym"
                                            checked={selectedFacilities.includes('gym')}
                                            onChange={() => handleFacilityChange('gym')}
                                        />
                                        Gym
                                    </label>
                                    <label>
                                        <input
                                            type="checkbox"
                                            value="laundry"
                                            checked={selectedFacilities.includes('laundry')}
                                            onChange={() => handleFacilityChange('laundry')}
                                        />
                                        Laundry
                                    </label>
                                    <label>
                                        <input
                                            type="checkbox"
                                            value="parking"
                                            checked={selectedFacilities.includes('parking')}
                                            onChange={() => handleFacilityChange('parking')}
                                        />
                                        Parking
                                    </label>
                                    <label>
                                        <input
                                            type="checkbox"
                                            value="24_hr_water"
                                            checked={selectedFacilities.includes('24_hr_water')}
                                            onChange={() => handleFacilityChange('24_hr_water')}
                                        />
                                        24-Hour Water
                                    </label>
                                    <label>
                                        <input
                                            type="checkbox"
                                            value="hot_water"
                                            checked={selectedFacilities.includes('hot_water')}
                                            onChange={() => handleFacilityChange('hot_water')}
                                        />
                                        Hot Water
                                    </label>
                                </div>

                                <h3>Sort By</h3>
                                <select value={sortOption} onChange={handleSortChange}>
                                    <option value="">Select Sort Option</option>
                                    <option value="price_asc">Price: Low to High</option>
                                    <option value="price_desc">Price: High to Low</option>
                                </select>
                            </aside>

                            <main className="hostels-grid">
                                {hostels.length > 0 ? (
                                    hostels.map((hostel) => (
                                        <div key={hostel.hostel_id} className="hostel-card">
                                            <div className="hostel-image-container">
                                                <img
                                                    src={hostel.image_path ? 
                                                        `http://localhost:5000/uploads/${hostel.image_path.replace(/^\/+/, '')}` : 
                                                        "/placeholder.png"}
                                                    alt={hostel.name}
                                                    className="hostel-image"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = "/placeholder.png";
                                                    }}
                                                />
                                                <div className="hostel-status">
                                                    <span className={`status-badge ${hostel.available_rooms > 0 ? 'available' : 'full'}`}>
                                                        {hostel.available_rooms > 0 ? 'Available' : 'Full'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="hostel-info">
                                                <h3>{hostel.name}</h3>
                                                <div className="hostel-details">
                                                    <div className="detail-item">
                                                        <span className="detail-icon">📍</span>
                                                        <span className="detail-text">{hostel.address}</span>
                                                    </div>
                                                    <div className="detail-item">
                                                        <span className="detail-icon">💰</span>
                                                        <span className="detail-text">₹{hostel.rent || 'N/A'}</span>
                                                    </div>
                                                    <div className="detail-item">
                                                        <span className="detail-icon">🛏️</span>
                                                        <span className="detail-text">Total Rooms: {hostel.total_rooms || 'N/A'}</span>
                                                    </div>
                                                    <div className="detail-item">
                                                        <span className="detail-icon">🚪</span>
                                                        <span className="detail-text">Available: {hostel.available_rooms || 'N/A'}</span>
                                                    </div>
                                                </div>
                                                <div className="button-group">
                                                    <button
                                                        className="view-details-btn"
                                                        onClick={() => handleBookHostel(hostel.hostel_id)}
                                                    >
                                                        <span className="button-icon">👁️</span>
                                                        View Details
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="no-hostels">
                                        <p>No hostels available matching your criteria</p>
                                    </div>
                                )}
                            </main>
                        </div>
                    </>
                ) : (
                    <div>
                        <button className="back-btn" onClick={handleBack}>
                            <span className="button-icon">←</span>
                            Back to List
                        </button>
                        <div className="hostel-detail-card enhanced-detail-card">
                            <div className="hostel-detail-image-container enhanced-image-container">
                                <img
                                    src={selectedHostel.image_path ? 
                                        `http://localhost:5000/uploads/${selectedHostel.image_path.replace(/^\/+/,'')}` : 
                                        "/placeholder.png"}
                                    alt={selectedHostel.name}
                                    className="hostel-detail-image enhanced-detail-image"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "/placeholder.png";
                                    }}
                                />
                            </div>
                            <div className="hostel-detail-content enhanced-detail-content">
                                <h2>{selectedHostel.name}</h2>
                                <div className="hostel-detail-grid">
                                    <div className="detail-item">
                                        <span className="detail-icon">📍</span>
                                        <span className="detail-text">{selectedHostel.address}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-icon">💰</span>
                                        <span className="detail-text">₹{selectedHostel.rent || 'N/A'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-icon">🛏️</span>
                                        <span className="detail-text">Total Rooms: {selectedHostel.total_rooms || 'N/A'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-icon">🚪</span>
                                        <span className="detail-text">Available: {selectedHostel.available_rooms || 'N/A'}</span>
                                    </div>
                                </div>
                                {selectedHostel.description && (
                                    <div className="hostel-description enhanced-description">
                                        <h3>Description</h3>
                                        <p>{selectedHostel.description}</p>
                                    </div>
                                )}
                                {selectedHostel.facilities && selectedHostel.facilities.length > 0 && (
                                    <div className="hostel-facilities enhanced-facilities">
                                        <h3>Facilities</h3>
                                        <div className="facilities-grid">
                                            {Array.isArray(selectedHostel.facilities) ? (
                                                selectedHostel.facilities.map((facility, index) => (
                                                    <span key={index} className="facility-badge">
                                                        {facility}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="facility-badge">{selectedHostel.facilities}</span>
                                            )}
                                        </div>
                                    </div>
                                )}
                                <button 
                                    className="book-now-btn" 
                                    onClick={() => setShowBookingModal(true)}
                                >
                                    Book Now
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Booking Modal */}
                {showBookingModal && (
                    <div className="modal-overlay">
                        <div className="booking-modal">
                            <div className="modal-header">
                                <h2>Book {selectedHostel?.name}</h2>
                                <button 
                                    className="close-btn"
                                    onClick={() => setShowBookingModal(false)}
                                >
                                    ×
                                </button>
                            </div>
                            <form onSubmit={handleBookingSubmit}>
                                <div className="form-group">
                                    <label>Check-in Date</label>
                                    <input
                                        type="date"
                                        required
                                        min={new Date().toISOString().split('T')[0]}
                                        value={bookingDetails.check_in_date}
                                        onChange={(e) => {
                                            const newCheckIn = e.target.value;
                                            setBookingDetails(prev => ({
                                                ...prev,
                                                check_in_date: newCheckIn,
                                                total_amount: calculateTotalAmount(newCheckIn)
                                            }));
                                        }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Check-out Date (Optional)</label>
                                    <input
                                        type="date"
                                        min={bookingDetails.check_in_date || new Date().toISOString().split('T')[0]}
                                        value={bookingDetails.check_out_date}
                                        onChange={(e) => {
                                            setBookingDetails(prev => ({
                                                ...prev,
                                                check_out_date: e.target.value
                                            }));
                                        }}
                                    />
                                    <small className="form-text text-muted">
                                        If not specified, booking will be considered as long-term stay
                                    </small>
                                </div>
                                <div className="booking-summary">
                                    <h3>Booking Summary</h3>
                                    <div className="summary-item">
                                        <span>Hostel:</span>
                                        <span>{selectedHostel?.name}</span>
                                    </div>
                                    <div className="summary-item">
                                        <span>Monthly Rate:</span>
                                        <span>₹{selectedHostel?.rent}</span>
                                    </div>
                                    <div className="summary-item">
                                        <span>Total Amount (First Month):</span>
                                        <span>₹{bookingDetails.total_amount}</span>
                                    </div>
                                    <div className="summary-item">
                                        <span>Payment Schedule:</span>
                                        <span>Monthly</span>
                                    </div>
                                </div>
                                <div className="modal-actions">
                                    <button 
                                        type="button" 
                                        className="cancel-btn"
                                        onClick={() => setShowBookingModal(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="submit-btn"
                                    >
                                        Submit Booking Request
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentDashboard;
