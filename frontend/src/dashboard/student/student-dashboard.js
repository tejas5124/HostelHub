import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import '../../styles/student-dashboard.css';
import DashboardHeader from '../admin/AdminHeader';
import api from '../../api';

const StudentDashboard = () => {
    const [hostels, setHostels] = useState([]);
    const [originalHostels, setOriginalHostels] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFacilities, setSelectedFacilities] = useState([]);
    const [sortOption, setSortOption] = useState('');
    const [selectedHostel, setSelectedHostel] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({ totalBookings: 0, activeBookings: 0 });
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [bookingDetails, setBookingDetails] = useState({ 
        check_in_date: '', 
        check_out_date: '', 
        total_amount: 0 
    });
    const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);

    const navigate = useNavigate();

    // Debounced search function
    const [searchTimeout, setSearchTimeout] = useState(null);

    useEffect(() => {
        const checkSession = async () => {
            try {
                const response = await fetch("/student-session", { 
                    method: "GET", 
                    credentials: "include" 
                });
                if (response.ok) {
                    setIsLoggedIn(true);
                    await Promise.all([fetchStudentStats(), fetchHostels()]);
                } else {
                    setIsLoggedIn(false);
                    Swal.fire({ 
                        icon: 'warning', 
                        title: 'Session Expired', 
                        text: 'Please log in again to continue.' 
                    }).then(() => navigate('/student-login'));
                }
            } catch (error) {
                console.error('Session check error:', error);
                setIsLoggedIn(false);
                Swal.fire({ 
                    icon: 'error', 
                    title: 'Connection Error', 
                    text: 'Unable to verify session. Please try again.' 
                });
            } finally {
                setIsLoading(false);
            }
        };
        checkSession();
    }, [navigate]);

    const fetchStudentStats = async () => {
        const studentId = localStorage.getItem('student_id');
        if (!studentId) {
            console.warn('No student ID found in localStorage');
            return;
        }
        try {
            const response = await api.get(`/student-stats/${studentId}`);
            setStats({ 
                totalBookings: response.data.totalBookings || 0, 
                activeBookings: response.data.activeBookings || 0 
            });
        } catch (error) {
            console.error('Error fetching student stats:', error);
            // Don't show error to user for stats failure - it's not critical
        }
    };

    const fetchHostels = async () => {
        try {
            const response = await api.get('/stu_hostels');
            const processed = response.data.map(h => ({
                ...h,
                facilities: processFacilities(h.facilities)
            }));
            setHostels(processed);
            setOriginalHostels(processed);
        } catch (error) {
            console.error('Error fetching hostels:', error);
            Swal.fire({ 
                icon: 'error', 
                title: 'Error', 
                text: 'Failed to fetch hostels. Please refresh the page.' 
            });
        }
    };

    // Helper function to process facilities data
    const processFacilities = (facilities) => {
        if (Array.isArray(facilities)) {
            return facilities;
        }
        if (typeof facilities === 'string') {
            try {
                return JSON.parse(facilities);
            } catch (e) {
                // If JSON parsing fails, treat as comma-separated string
                return facilities.split(',').map(f => f.trim()).filter(f => f);
            }
        }
        return [];
    };

    // Memoized filter function with debouncing for search
    const applyFilters = useCallback(() => {
        let filtered = [...originalHostels];
        
        // Apply search filter
        if (searchTerm.trim()) {
            const searchLower = searchTerm.toLowerCase().trim();
            filtered = filtered.filter(h => 
                h.name.toLowerCase().includes(searchLower) ||
                h.address.toLowerCase().includes(searchLower)
            );
        }
        
        // Apply facility filters
        if (selectedFacilities.length > 0) {
            filtered = filtered.filter(h => 
                selectedFacilities.every(fac => 
                    h.facilities.some(hFac => 
                        hFac.toLowerCase().includes(fac.toLowerCase())
                    )
                )
            );
        }
        
        // Apply sorting
        if (sortOption === 'price_asc') {
            filtered.sort((a, b) => (a.rent || 0) - (b.rent || 0));
        } else if (sortOption === 'price_desc') {
            filtered.sort((a, b) => (b.rent || 0) - (a.rent || 0));
        } else if (sortOption === 'availability') {
            filtered.sort((a, b) => (b.available_rooms || 0) - (a.available_rooms || 0));
        } else if (sortOption === 'name') {
            filtered.sort((a, b) => a.name.localeCompare(b.name));
        }
        
        setHostels(filtered);
    }, [originalHostels, searchTerm, selectedFacilities, sortOption]);

    // Apply filters with debouncing for search
    useEffect(() => {
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }
        
        const timeout = setTimeout(() => {
            applyFilters();
        }, searchTerm ? 300 : 0); // Debounce search by 300ms
        
        setSearchTimeout(timeout);
        
        return () => {
            if (timeout) clearTimeout(timeout);
        };
    }, [applyFilters, searchTerm]);

    // Apply filters immediately for non-search changes
    useEffect(() => {
        if (!searchTerm) {
            applyFilters();
        }
    }, [selectedFacilities, sortOption, applyFilters, searchTerm]);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleFacilityChange = (facility) => {
        setSelectedFacilities((prev) =>
            prev.includes(facility)
                ? prev.filter((f) => f !== facility)
                : [...prev, facility]
        );
    };

    const handleSortChange = (e) => {
        setSortOption(e.target.value);
    };

    const handleBookHostel = (hostelId) => {
        const hostel = hostels.find(h => h.hostel_id === hostelId);
        if (!hostel) {
            Swal.fire({ 
                icon: 'error', 
                title: 'Error', 
                text: 'Hostel not found. Please try again.' 
            });
            return;
        }
        if (hostel.available_rooms <= 0) {
            Swal.fire({ 
                icon: 'warning', 
                title: 'No Rooms Available', 
                text: 'This hostel is currently full. Please check other options.' 
            });
            return;
        }
        setSelectedHostel(hostel);
    };

    const handleBack = () => {
        setSelectedHostel(null);
        setShowBookingModal(false);
        // Reset booking details when going back
        setBookingDetails({ check_in_date: '', check_out_date: '', total_amount: 0 });
    };

    const validateBookingDates = () => {
        const { check_in_date, check_out_date } = bookingDetails;
        const today = new Date().toISOString().split('T')[0];
        
        if (!check_in_date) {
            Swal.fire({ 
                icon: 'warning', 
                title: 'Invalid Date', 
                text: 'Please select a check-in date.' 
            });
            return false;
        }
        
        if (check_in_date < today) {
            Swal.fire({ 
                icon: 'warning', 
                title: 'Invalid Date', 
                text: 'Check-in date cannot be in the past.' 
            });
            return false;
        }
        
        if (check_out_date && check_out_date <= check_in_date) {
            Swal.fire({ 
                icon: 'warning', 
                title: 'Invalid Date', 
                text: 'Check-out date must be after check-in date.' 
            });
            return false;
        }
        
        return true;
    };

    const handleBookingSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateBookingDates()) {
            return;
        }
        
        const studentId = localStorage.getItem('student_id');
        if (!studentId) {
            Swal.fire({ 
                icon: 'error', 
                title: 'Authentication Error', 
                text: 'Please log in again to continue.' 
            });
            navigate('/student-login');
            return;
        }
        
        setIsSubmittingBooking(true);
        
        try {
            const bookingData = {
                hostel_id: selectedHostel.hostel_id,
                student_id: parseInt(studentId),
                check_in_date: bookingDetails.check_in_date,
                check_out_date: bookingDetails.check_out_date || null,
                total_amount: bookingDetails.total_amount,
                payment_status: 'pending'
            };
            
            const response = await api.post('/add-booking', bookingData);
            
            Swal.fire({ 
                icon: 'success', 
                title: 'Success!', 
                text: 'Booking request submitted successfully. You will be notified once it\'s approved.' 
            });
            
            setShowBookingModal(false);
            setSelectedHostel(null);
            setBookingDetails({ check_in_date: '', check_out_date: '', total_amount: 0 });
            
            // Refresh stats after successful booking
            fetchStudentStats();
            
        } catch (error) {
            console.error('Booking error:', error);
            const errorMessage = error.response?.data?.message || 
                               error.response?.data?.error || 
                               'Booking failed. Please try again.';
            Swal.fire({ 
                icon: 'error', 
                title: 'Booking Failed', 
                text: errorMessage 
            });
        } finally {
            setIsSubmittingBooking(false);
        }
    };

    const calculateTotalAmount = (checkIn, checkOut) => {
        if (!selectedHostel || !checkIn) return 0;
        
        const rent = selectedHostel.rent || 0;
        
        if (!checkOut) {
            // For long-term stay, return monthly rent
            return rent;
        }
        
        // Calculate days and proportional amount
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        const diffTime = Math.abs(checkOutDate - checkInDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const dailyRate = rent / 30; // Assuming 30 days per month
        
        return Math.round(dailyRate * diffDays);
    };

    const clearAllFilters = () => {
        setSearchTerm('');
        setSelectedFacilities([]);
        setSortOption('');
    };

    // Show loading state
    if (isLoading) {
        return (
            <div className="dashboard">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading dashboard...</p>
                </div>
            </div>
        );
    }

    // Show login message if not logged in
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
                <DashboardHeader role="student" />
                <div className="logo" onClick={() => navigate('/student-dashboard')}>
                    <h1>HostelHub</h1>
                </div>
                <div className="nav-menu">
                    <button 
                        className={`nav-button ${!selectedHostel ? 'active' : ''}`}
                        onClick={() => setSelectedHostel(null)}
                    >
                        🏠 Browse Hostels
                    </button>
                    <button 
                        className="nav-button" 
                        onClick={() => navigate('/my-bookings')}
                    >
                        📚 My Bookings
                    </button>
                    <button 
                        className="nav-button" 
                        onClick={() => navigate('/payment')}
                    >
                         💳 Payment
                    </button>
                </div>
            </div>
            
            <div className="main-content">
                <div className="stats-container">
                    <div className="stat-card">
                        <h3>Total Bookings</h3>
                        <p>{stats.totalBookings}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Active Bookings</h3>
                        <p>{stats.activeBookings}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Available Hostels</h3>
                        <p>{hostels.filter(h => h.available_rooms > 0).length}</p>
                    </div>
                </div>

                {!selectedHostel ? (
                    <>
                        <div className="search-and-results">
                            <div className="search-bar">
                                <input
                                    type="text"
                                    placeholder="Search hostel by name or location..."
                                    value={searchTerm}
                                    onChange={handleSearch}
                                />
                                {(searchTerm || selectedFacilities.length > 0 || sortOption) && (
                                    <button 
                                        className="clear-filters-btn"
                                        onClick={clearAllFilters}
                                        title="Clear all filters"
                                    >
                                        ✕ Clear
                                    </button>
                                )}
                            </div>
                            
                            <div className="results-info">
                                <span>Showing {hostels.length} of {originalHostels.length} hostels</span>
                            </div>
                        </div>

                        <div className="content">
                            <aside className="filters">
                                <h2>Filters</h2>
                                
                                <div className="filter-section">
                                    <h3>Facilities</h3>
                                    <div className="checkbox-group">
                                        {['wifi', 'gym', 'laundry', 'parking', '24_hr_water', 'hot_water', 'mess', 'security'].map(facility => (
                                            <label key={facility}>
                                                <input
                                                    type="checkbox"
                                                    value={facility}
                                                    checked={selectedFacilities.includes(facility)}
                                                    onChange={() => handleFacilityChange(facility)}
                                                />
                                                {facility.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="filter-section">
                                    <h3>Sort By</h3>
                                    <select value={sortOption} onChange={handleSortChange}>
                                        <option value="">Default</option>
                                        <option value="price_asc">Price: Low to High</option>
                                        <option value="price_desc">Price: High to Low</option>
                                        <option value="availability">Most Available Rooms</option>
                                        <option value="name">Name (A-Z)</option>
                                    </select>
                                </div>
                            </aside>

                            <main className="hostels-grid">
                                {hostels.length > 0 ? (
                                    hostels.map((hostel) => (
                                        <div key={hostel.hostel_id} className="hostel-card">
                                            <div className="hostel-image-container">
                                                <img
                                                    src={hostel.image_path ? 
                                                        `https://hostelhub-0sy6.onrender.com/uploads/${hostel.image_path.replace(/^\/+/, '')}` : 
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
                                                        <span className="detail-text">₹{hostel.rent || 'N/A'}/month</span>
                                                    </div>
                                                    <div className="detail-item">
                                                        <span className="detail-icon">🛏️</span>
                                                        <span className="detail-text">Total: {hostel.total_rooms || 'N/A'}</span>
                                                    </div>
                                                    <div className="detail-item">
                                                        <span className="detail-icon">🚪</span>
                                                        <span className="detail-text">Available: {hostel.available_rooms || 'N/A'}</span>
                                                    </div>
                                                </div>
                                                
                                                {hostel.facilities.length > 0 && (
                                                    <div className="quick-facilities">
                                                        {hostel.facilities.slice(0, 3).map((facility, index) => (
                                                            <span key={index} className="facility-tag">
                                                                {facility}
                                                            </span>
                                                        ))}
                                                        {hostel.facilities.length > 3 && (
                                                            <span className="facility-tag more">
                                                                +{hostel.facilities.length - 3} more
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                                
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
                                        <div className="no-hostels-content">
                                            <h3>No hostels found</h3>
                                            <p>
                                                {searchTerm || selectedFacilities.length > 0 
                                                    ? "Try adjusting your search criteria or filters."
                                                    : "No hostels are currently available."
                                                }
                                            </p>
                                            {(searchTerm || selectedFacilities.length > 0) && (
                                                <button 
                                                    className="clear-filters-btn"
                                                    onClick={clearAllFilters}
                                                >
                                                    Clear All Filters
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </main>
                        </div>
                    </>
                ) : (
                    <div className="hostel-detail-view">
                        <button className="back-btn" onClick={handleBack}>
                            <span className="button-icon">←</span>
                            Back to List
                        </button>
                        <div className="hostel-detail-card enhanced-detail-card">
                            <div className="hostel-detail-image-container enhanced-image-container">
                                <img
                                    src={selectedHostel.image_path ? 
                                        `https://hostelhub-0sy6.onrender.com/uploads/${selectedHostel.image_path.replace(/^\/+/,'')}` : 
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
                                <div className="hostel-header">
                                    <h2>{selectedHostel.name}</h2>
                                    <span className={`status-badge large ${selectedHostel.available_rooms > 0 ? 'available' : 'full'}`}>
                                        {selectedHostel.available_rooms > 0 ? 'Available' : 'Full'}
                                    </span>
                                </div>
                                
                                <div className="hostel-detail-grid">
                                    <div className="detail-item">
                                        <span className="detail-icon">📍</span>
                                        <span className="detail-text">{selectedHostel.address}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-icon">💰</span>
                                        <span className="detail-text">₹{selectedHostel.rent || 'N/A'}/month</span>
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
                                            {selectedHostel.facilities.map((facility, index) => (
                                                <span key={index} className="facility-badge">
                                                    {facility}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
                                <button 
                                    className="book-now-btn"
                                    onClick={() => setShowBookingModal(true)}
                                    disabled={selectedHostel.available_rooms <= 0}
                                >
                                    {selectedHostel.available_rooms > 0 ? 'Book Now' : 'No Rooms Available'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Enhanced Booking Modal */}
                {showBookingModal && (
                    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowBookingModal(false)}>
                        <div className="booking-modal">
                            <div className="modal-header">
                                <h2>Book {selectedHostel?.name}</h2>
                                <button 
                                    className="close-btn"
                                    onClick={() => setShowBookingModal(false)}
                                    disabled={isSubmittingBooking}
                                >
                                    ×
                                </button>
                            </div>
                            <form onSubmit={handleBookingSubmit}>
                                <div className="form-group">
                                    <label htmlFor="check_in_date">Check-in Date *</label>
                                    <input
                                        id="check_in_date"
                                        type="date"
                                        required
                                        min={new Date().toISOString().split('T')[0]}
                                        value={bookingDetails.check_in_date}
                                        onChange={(e) => {
                                            const newCheckIn = e.target.value;
                                            setBookingDetails(prev => ({
                                                ...prev,
                                                check_in_date: newCheckIn,
                                                total_amount: calculateTotalAmount(newCheckIn, prev.check_out_date)
                                            }));
                                        }}
                                        disabled={isSubmittingBooking}
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label htmlFor="check_out_date">Check-out Date (Optional)</label>
                                    <input
                                        id="check_out_date"
                                        type="date"
                                        min={bookingDetails.check_in_date || new Date().toISOString().split('T')[0]}
                                        value={bookingDetails.check_out_date}
                                        onChange={(e) => {
                                            setBookingDetails(prev => ({
                                                ...prev,
                                                check_out_date: e.target.value,
                                                total_amount: calculateTotalAmount(prev.check_in_date, e.target.value)
                                            }));
                                        }}
                                        disabled={isSubmittingBooking}
                                    />
                                    <small className="form-text text-muted">
                                        Leave empty for long-term stay (monthly billing)
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
                                        <span>
                                            {bookingDetails.check_out_date ? 'Total Amount:' : 'First Month:'}
                                        </span>
                                        <span>₹{bookingDetails.total_amount}</span>
                                    </div>
                                    <div className="summary-item">
                                        <span>Payment Status:</span>
                                        <span>Pending Approval</span>
                                    </div>
                                </div>
                                
                                <div className="modal-actions">
                                    <button 
                                        type="button" 
                                        className="cancel-btn"
                                        onClick={() => setShowBookingModal(false)}
                                        disabled={isSubmittingBooking}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="submit-btn"
                                        disabled={isSubmittingBooking || !bookingDetails.check_in_date}
                                    >
                                        {isSubmittingBooking ? 'Submitting...' : 'Submit Booking Request'}
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

















// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import Swal from 'sweetalert2';
// import '../../styles/student-dashboard.css';
// import DashboardHeader from '../admin/AdminHeader';
// import Profile from '../../common/Profile';

// const StudentDashboard = () => {
//     const [hostels, setHostels] = useState([]);
//     const [originalHostels, setOriginalHostels] = useState([]);
//     const [searchTerm, setSearchTerm] = useState('');
//     const [selectedFacilities, setSelectedFacilities] = useState([]);
//     const [sortOption, setSortOption] = useState('');
//     const [selectedHostel, setSelectedHostel] = useState(null);
//     const [isLoggedIn, setIsLoggedIn] = useState(false);
//     const [studentDetails, setStudentDetails] = useState(null);
//     const [stats, setStats] = useState({
//         totalBookings: 0,
//         activeBookings: 0
//     });
//     const [showBookingModal, setShowBookingModal] = useState(false);
//     const [bookingDetails, setBookingDetails] = useState({
//         check_in_date: '',
//         check_out_date: '',
//         total_amount: 0
//     });
    
//     const navigate = useNavigate();

//     useEffect(() => {
//         const checkSession = async () => {
//             try {
//                 const response = await fetch("/student-session", {
//                     method: "GET",
//                     credentials: "include",
//                 });
//                 if (response.ok) {
//                     setIsLoggedIn(true);
//                     fetchStudentStats();
//                     fetchStudentDetails();
//                 } else {
//                     setIsLoggedIn(false);
//                     Swal.fire({
//                         icon: 'warning',
//                         title: 'Session Expired',
//                         text: 'Please log in again to continue.',
//                     }).then(() => {
//                         navigate('/student-login');
//                     });
//                 }
//             } catch (error) {
//                 console.error("Error checking session:", error);
//                 setIsLoggedIn(false);
//             }
//         };

//         checkSession();
//     }, [navigate]);

//     const fetchStudentDetails = async () => {
//         const studentId = localStorage.getItem('student_id');
//         if (!studentId) return;

//         try {
//             const response = await fetch(`http://localhost:5000/student-details/${studentId}`);
//             if (response.ok) {
//                 const data = await response.json();
//                 setStudentDetails(data);
//             } else {
//                 console.error('Failed to fetch student details');
//             }
//         } catch (error) {
//             console.error('Error fetching student details:', error);
//         }
//     };

//     const fetchStudentStats = async () => {
//         const studentId = localStorage.getItem('student_id');
//         if (!studentId) return;

//         try {
//             const response = await fetch(`http://localhost:5000/student-stats/${studentId}`);
//             if (response.ok) {
//                 const data = await response.json();
//                 setStats({
//                     totalBookings: data.totalBookings || 0,
//                     activeBookings: data.activeBookings || 0
//                 });
//             }
//         } catch (error) {
//             console.error('Error fetching student stats:', error);
//         }
//     };

//     useEffect(() => {
//         const fetchHostels = async () => {
//             try {
//                 const response = await fetch('http://localhost:5000/stu_hostels');
//                 if (!response.ok) {
//                     throw new Error('Network response was not ok');
//                 }
//                 const data = await response.json();
//                 const processedData = data.map(hostel => ({
//                     ...hostel,
//                     facilities: Array.isArray(hostel.facilities)
//                         ? hostel.facilities
//                         : typeof hostel.facilities === 'string'
//                             ? JSON.parse(hostel.facilities || '[]')
//                             : []
//                 }));
//                 setHostels(processedData);
//                 setOriginalHostels(processedData);
//             } catch (error) {
//                 console.error('Error fetching hostels:', error);
//                 Swal.fire({
//                     icon: 'error',
//                     title: 'Error',
//                     text: 'Failed to fetch hostels. Please try again later.',
//                 });
//             }
//         };

//         if (isLoggedIn) {
//             fetchHostels();
//         }
//     }, [isLoggedIn]);

//     useEffect(() => {
//         applyFilters();
//     }, [searchTerm, selectedFacilities, sortOption]);

//     const handleSearch = (e) => {
//         setSearchTerm(e.target.value);
//     };

//     const handleFacilityChange = (facility) => {
//         setSelectedFacilities(prev =>
//             prev.includes(facility)
//                 ? prev.filter(f => f !== facility)
//                 : [...prev, facility]
//         );
//     };

//     const handleSortChange = (event) => {
//         setSortOption(event.target.value);
//     };

//     const applyFilters = () => {
//         let filteredHostels = originalHostels;

//         if (searchTerm) {
//             filteredHostels = filteredHostels.filter(hostel =>
//                 hostel.name.toLowerCase().includes(searchTerm.toLowerCase())
//             );
//         }

//         if (selectedFacilities.length > 0) {
//             filteredHostels = filteredHostels.filter(hostel => {
//                 const facilitiesArray = Array.isArray(hostel.facilities)
//                     ? hostel.facilities
//                     : typeof hostel.facilities === 'string'
//                         ? JSON.parse(hostel.facilities || '[]')
//                         : [];
//                 return selectedFacilities.every(facility =>
//                     facilitiesArray.includes(facility)
//                 );
//             });
//         }

//         if (sortOption === 'price_asc') {
//             filteredHostels = filteredHostels.sort((a, b) => a.rent - b.rent);
//         } else if (sortOption === 'price_desc') {
//             filteredHostels = filteredHostels.sort((a, b) => b.rent - a.rent);
//         }

//         setHostels(filteredHostels);
//     };

//     const handleBookHostel = (hostelId) => {
//         const hostel = hostels.find(h => h.hostel_id === hostelId);
//         setSelectedHostel(hostel);
//     };

//     const handleBack = () => {
//         setSelectedHostel(null);
//     };

//     const handleLogout = async () => {
//         try {
//             await fetch("/student-logout", {
//                 method: "POST",
//                 credentials: "include",
//             });
//             localStorage.removeItem('student_id');
//             navigate('/student-login');
//         } catch (error) {
//             console.error("Error logging out:", error);
//         }
//     };

//     const calculateTotalAmount = (checkIn) => {
//         if (!checkIn || !selectedHostel) return 0;
//         // Since rate is monthly, we'll just return the monthly rent
//         return selectedHostel.rent;
//     };

//     const handleBookingSubmit = async (e) => {
//         e.preventDefault();
//         const studentId = localStorage.getItem('student_id');
        
//         if (!studentId) {
//             Swal.fire({
//                 icon: 'error',
//                 title: 'Error',
//                 text: 'Please log in to book a hostel',
//             });
//             return;
//         }

//         try {
//             const response = await fetch('http://localhost:5000/add-booking', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({
//                     hostel_id: selectedHostel.hostel_id,
//                     student_id: studentId,
//                     check_in_date: bookingDetails.check_in_date,
//                     check_out_date: bookingDetails.check_out_date || null, // Make check-out date optional
//                     total_amount: bookingDetails.total_amount,
//                     payment_status: 'pending'
//                 }),
//             });

//             const data = await response.json();

//             if (response.ok) {
//                 Swal.fire({
//                     icon: 'success',
//                     title: 'Success!',
//                     text: 'Booking request submitted successfully. The hostel owner will review your request.',
//                 });
//                 setShowBookingModal(false);
//                 setSelectedHostel(null);
//             } else {
//                 throw new Error(data.message || 'Failed to submit booking request');
//             }
//         } catch (error) {
//             Swal.fire({
//                 icon: 'error',
//                 title: 'Error',
//                 text: error.message || 'Failed to submit booking request',
//             });
//         }
//     };

//     if (!isLoggedIn) {
//         return (
//             <div className="login-message">
//                 <div className="loading-spinner"></div>
//                 <p>Please log in to access the dashboard.</p>
//             </div>
//         );
//     }

//     return (
//         <div className="dashboard">
//             <div className="dashboard-header">
//                 <DashboardHeader role="student" />
//                 <div className="logo" onClick={() => navigate('/student-dashboard')} style={{ cursor: 'pointer' }}>
//                     <h1>HostelHub</h1>
//                 </div>
//                 <div className="nav-menu">
//                     <button className="nav-button" onClick={() => setSelectedHostel(null)}>
//                         <span className="button-icon">🏠</span>
//                         Browse Hostels
//                     </button>
//                     <button className="nav-button" onClick={() => navigate('/my-bookings')}>
//                         <span className="button-icon">📚</span>
//                         My Bookings
//                     </button>
//                     <button className="nav-button" onClick={() => navigate('/profile')}>
//                         <span className="button-icon">👤</span>
//                         Profile
//                     </button>
//                 </div>
//             </div>
//             <div className="main-content">
//                 {/* Statistics Cards */}
//                 <div className="stats-container">
//                     <div className="stat-card">
//                         <h3>Total Bookings</h3>
//                         <p>{stats.totalBookings}</p>
//                     </div>
//                     <div className="stat-card">
//                         <h3>Active Bookings</h3>
//                         <p>{stats.activeBookings}</p>
//                     </div>
//                 </div>

//                 {!selectedHostel ? (
//                     <>
//                         <div className="search-bar">
//                             <input
//                                 type="text"
//                                 placeholder="Search hostel by name..."
//                                 value={searchTerm}
//                                 onChange={handleSearch}
//                             />
//                         </div>

//                         <div className="content">
//                             <aside className="filters">
//                                 <h2>Filters</h2>
//                                 <div className="checkbox-group">
//                                     <label>
//                                         <input
//                                             type="checkbox"
//                                             value="wifi"
//                                             checked={selectedFacilities.includes('wifi')}
//                                             onChange={() => handleFacilityChange('wifi')}
//                                         />
//                                         Wi-Fi
//                                     </label>
//                                     <label>
//                                         <input
//                                             type="checkbox"
//                                             value="gym"
//                                             checked={selectedFacilities.includes('gym')}
//                                             onChange={() => handleFacilityChange('gym')}
//                                         />
//                                         Gym
//                                     </label>
//                                     <label>
//                                         <input
//                                             type="checkbox"
//                                             value="laundry"
//                                             checked={selectedFacilities.includes('laundry')}
//                                             onChange={() => handleFacilityChange('laundry')}
//                                         />
//                                         Laundry
//                                     </label>
//                                     <label>
//                                         <input
//                                             type="checkbox"
//                                             value="parking"
//                                             checked={selectedFacilities.includes('parking')}
//                                             onChange={() => handleFacilityChange('parking')}
//                                         />
//                                         Parking
//                                     </label>
//                                     <label>
//                                         <input
//                                             type="checkbox"
//                                             value="24_hr_water"
//                                             checked={selectedFacilities.includes('24_hr_water')}
//                                             onChange={() => handleFacilityChange('24_hr_water')}
//                                         />
//                                         24-Hour Water
//                                     </label>
//                                     <label>
//                                         <input
//                                             type="checkbox"
//                                             value="hot_water"
//                                             checked={selectedFacilities.includes('hot_water')}
//                                             onChange={() => handleFacilityChange('hot_water')}
//                                         />
//                                         Hot Water
//                                     </label>
//                                 </div>

//                                 <h3>Sort By</h3>
//                                 <select value={sortOption} onChange={handleSortChange}>
//                                     <option value="">Select Sort Option</option>
//                                     <option value="price_asc">Price: Low to High</option>
//                                     <option value="price_desc">Price: High to Low</option>
//                                 </select>
//                             </aside>

//                             <main className="hostels-grid">
//                                 {hostels.length > 0 ? (
//                                     hostels.map((hostel) => (
//                                         <div key={hostel.hostel_id} className="hostel-card">
//                                             <div className="hostel-image-container">
//                                                 <img
//                                                     src={hostel.image_path ? 
//                                                         `http://localhost:5000/uploads/${hostel.image_path.replace(/^\/+/, '')}` : 
//                                                         "/placeholder.png"}
//                                                     alt={hostel.name}
//                                                     className="hostel-image"
//                                                     onError={(e) => {
//                                                         e.target.onerror = null;
//                                                         e.target.src = "/placeholder.png";
//                                                     }}
//                                                 />
//                                                 <div className="hostel-status">
//                                                     <span className={`status-badge ${hostel.available_rooms > 0 ? 'available' : 'full'}`}>
//                                                         {hostel.available_rooms > 0 ? 'Available' : 'Full'}
//                                                     </span>
//                                                 </div>
//                                             </div>
//                                             <div className="hostel-info">
//                                                 <h3>{hostel.name}</h3>
//                                                 <div className="hostel-details">
//                                                     <div className="detail-item">
//                                                         <span className="detail-icon">📍</span>
//                                                         <span className="detail-text">{hostel.address}</span>
//                                                     </div>
//                                                     <div className="detail-item">
//                                                         <span className="detail-icon">💰</span>
//                                                         <span className="detail-text">₹{hostel.rent || 'N/A'}</span>
//                                                     </div>
//                                                     <div className="detail-item">
//                                                         <span className="detail-icon">🛏️</span>
//                                                         <span className="detail-text">Total Rooms: {hostel.total_rooms || 'N/A'}</span>
//                                                     </div>
//                                                     <div className="detail-item">
//                                                         <span className="detail-icon">🚪</span>
//                                                         <span className="detail-text">Available: {hostel.available_rooms || 'N/A'}</span>
//                                                     </div>
//                                                 </div>
//                                                 <div className="button-group">
//                                                     <button
//                                                         className="view-details-btn"
//                                                         onClick={() => handleBookHostel(hostel.hostel_id)}
//                                                     >
//                                                         <span className="button-icon">👁️</span>
//                                                         View Details
//                                                     </button>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     ))
//                                 ) : (
//                                     <div className="no-hostels">
//                                         <p>No hostels available matching your criteria</p>
//                                     </div>
//                                 )}
//                             </main>
//                         </div>
//                     </>
//                 ) : (
//                     <div>
//                         <button className="back-btn" onClick={handleBack}>
//                             <span className="button-icon">←</span>
//                             Back to List
//                         </button>
//                         <div className="hostel-detail-card enhanced-detail-card">
//                             <div className="hostel-detail-image-container enhanced-image-container">
//                                 <img
//                                     src={selectedHostel.image_path ? 
//                                         `http://localhost:5000/uploads/${selectedHostel.image_path.replace(/^\/+/,'')}` : 
//                                         "/placeholder.png"}
//                                     alt={selectedHostel.name}
//                                     className="hostel-detail-image enhanced-detail-image"
//                                     onError={(e) => {
//                                         e.target.onerror = null;
//                                         e.target.src = "/placeholder.png";
//                                     }}
//                                 />
//                             </div>
//                             <div className="hostel-detail-content enhanced-detail-content">
//                                 <h2>{selectedHostel.name}</h2>
//                                 <div className="hostel-detail-grid">
//                                     <div className="detail-item">
//                                         <span className="detail-icon">📍</span>
//                                         <span className="detail-text">{selectedHostel.address}</span>
//                                     </div>
//                                     <div className="detail-item">
//                                         <span className="detail-icon">💰</span>
//                                         <span className="detail-text">₹{selectedHostel.rent || 'N/A'}</span>
//                                     </div>
//                                     <div className="detail-item">
//                                         <span className="detail-icon">🛏️</span>
//                                         <span className="detail-text">Total Rooms: {selectedHostel.total_rooms || 'N/A'}</span>
//                                     </div>
//                                     <div className="detail-item">
//                                         <span className="detail-icon">🚪</span>
//                                         <span className="detail-text">Available: {selectedHostel.available_rooms || 'N/A'}</span>
//                                     </div>
//                                 </div>
//                                 {selectedHostel.description && (
//                                     <div className="hostel-description enhanced-description">
//                                         <h3>Description</h3>
//                                         <p>{selectedHostel.description}</p>
//                                     </div>
//                                 )}
//                                 {selectedHostel.facilities && selectedHostel.facilities.length > 0 && (
//                                     <div className="hostel-facilities enhanced-facilities">
//                                         <h3>Facilities</h3>
//                                         <div className="facilities-grid">
//                                             {Array.isArray(selectedHostel.facilities) ? (
//                                                 selectedHostel.facilities.map((facility, index) => (
//                                                     <span key={index} className="facility-badge">
//                                                         {facility}
//                                                     </span>
//                                                 ))
//                                             ) : (
//                                                 <span className="facility-badge">{selectedHostel.facilities}</span>
//                                             )}
//                                         </div>
//                                     </div>
//                                 )}
//                                 <button 
//                                     className="book-now-btn" 
//                                     onClick={() => setShowBookingModal(true)}
//                                 >
//                                     Book Now
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 )}

//                 {/* Booking Modal */}
//                 {showBookingModal && (
//                     <div className="modal-overlay">
//                         <div className="booking-modal">
//                             <div className="modal-header">
//                                 <h2>Book {selectedHostel?.name}</h2>
//                                 <button 
//                                     className="close-btn"
//                                     onClick={() => setShowBookingModal(false)}
//                                 >
//                                     ×
//                                 </button>
//                             </div>
//                             <form onSubmit={handleBookingSubmit}>
//                                 <div className="form-group">
//                                     <label>Check-in Date</label>
//                                     <input
//                                         type="date"
//                                         required
//                                         min={new Date().toISOString().split('T')[0]}
//                                         value={bookingDetails.check_in_date}
//                                         onChange={(e) => {
//                                             const newCheckIn = e.target.value;
//                                             setBookingDetails(prev => ({
//                                                 ...prev,
//                                                 check_in_date: newCheckIn,
//                                                 total_amount: calculateTotalAmount(newCheckIn)
//                                             }));
//                                         }}
//                                     />
//                                 </div>
//                                 <div className="form-group">
//                                     <label>Check-out Date (Optional)</label>
//                                     <input
//                                         type="date"
//                                         min={bookingDetails.check_in_date || new Date().toISOString().split('T')[0]}
//                                         value={bookingDetails.check_out_date}
//                                         onChange={(e) => {
//                                             setBookingDetails(prev => ({
//                                                 ...prev,
//                                                 check_out_date: e.target.value
//                                             }));
//                                         }}
//                                     />
//                                     <small className="form-text text-muted">
//                                         If not specified, booking will be considered as long-term stay
//                                     </small>
//                                 </div>
//                                 <div className="booking-summary">
//                                     <h3>Booking Summary</h3>
//                                     <div className="summary-item">
//                                         <span>Hostel:</span>
//                                         <span>{selectedHostel?.name}</span>
//                                     </div>
//                                     <div className="summary-item">
//                                         <span>Monthly Rate:</span>
//                                         <span>₹{selectedHostel?.rent}</span>
//                                     </div>
//                                     <div className="summary-item">
//                                         <span>Total Amount (First Month):</span>
//                                         <span>₹{bookingDetails.total_amount}</span>
//                                     </div>
//                                     <div className="summary-item">
//                                         <span>Payment Schedule:</span>
//                                         <span>Monthly</span>
//                                     </div>
//                                 </div>
//                                 <div className="modal-actions">
//                                     <button 
//                                         type="button" 
//                                         className="cancel-btn"
//                                         onClick={() => setShowBookingModal(false)}
//                                     >
//                                         Cancel
//                                     </button>
//                                     <button 
//                                         type="submit" 
//                                         className="submit-btn"
//                                     >
//                                         Submit Booking Request
//                                     </button>
//                                 </div>
//                             </form>
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default StudentDashboard;
