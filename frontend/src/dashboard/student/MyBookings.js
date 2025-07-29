import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import '../../styles/student-dashboard.css';
import '../../styles/MyBookings.css';
import DashboardHeader from '../admin/AdminHeader';
import api from '../../api'; // centralized axios

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [filter, setFilter] = useState('all');
    const [studentDetails, setStudentDetails] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const checkSession = async () => {
            try {
                const response = await api.get('/student-session');
                if (response.status === 200) {
                    setIsLoggedIn(true);
                    fetchStudentDetails();
                } else {
                    setIsLoggedIn(false);
                    Swal.fire({
                        icon: 'warning',
                        title: 'Session Expired',
                        text: 'Please log in again to continue.',
                    }).then(() => navigate('/student-login'));
                }
            } catch (error) {
                console.error("Error checking session:", error);
                setIsLoggedIn(false);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to check session. Please log in again.',
                }).then(() => navigate('/student-login'));
            }
        };

        checkSession();
    }, [navigate]);

    const fetchStudentDetails = async () => {
        const studentId = localStorage.getItem('student_id');
        if (!studentId) return;

        try {
            const response = await api.get(`/student-details/${studentId}`);
            if (response.status === 200) {
                setStudentDetails(response.data);
            } else {
                console.error('Failed to fetch student details');
            }
        } catch (error) {
            console.error('Error fetching student details:', error);
        }
    };

    const handleLogout = async () => {
        try {
            await api.post('/student-logout');
            localStorage.removeItem('student_id');
            navigate('/student-login');
        } catch (error) {
            console.error("Error logging out:", error);
        }
    };

    useEffect(() => {
        const fetchBookings = async () => {
            const studentId = localStorage.getItem('student_id');
            if (!studentId) return;

            try {
                const response = await api.get(`/student-bookings/${studentId}`);
                if (response.status === 200) {
                    setBookings(response.data);
                }
            } catch (error) {
                console.error('Error fetching bookings:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to fetch bookings. Please try again later.',
                });
            }
        };

        if (isLoggedIn) {
            fetchBookings();
        }
    }, [isLoggedIn]);

    const filteredBookings = bookings.filter(booking => {
        if (filter === 'all') return true;
        return booking.booking_status === filter;
    });

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'status-pending';
            case 'approved':
                return 'status-approved';
            case 'rejected':
                return 'status-rejected';
            default:
                return '';
        }
    };

    const getPaymentStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'payment-pending';
            case 'paid':
                return 'payment-paid';
            default:
                return '';
        }
    };

    if (!isLoggedIn) {
        return (
            <div className="login-message">
                <div className="loading-spinner"></div>
                <p>Please log in to access your bookings.</p>
            </div>
        );
    }

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <DashboardHeader role="student" />
                <div className="logo" onClick={() => navigate('/student-dashboard')} style={{ cursor: 'pointer' }}>
                    <h1>HostelHub</h1>
                </div>
                <div className="nav-menu">
                    <button className="nav-button" onClick={() => navigate('/student-dashboard')}>
                        <span className="button-icon">🏠</span>
                        Browse Hostels
                    </button>
                    <button className="nav-button active" onClick={() => navigate('/my-bookings')}>
                        <span className="button-icon">📚</span>
                        My Bookings
                    </button>
                    
                </div>
            </div>

            <div className="main-content">
                <div className="bookings-header">
                    <h2>My Bookings</h2>
                    <div className="filter-buttons">
                        <button 
                            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                            onClick={() => setFilter('all')}
                        >
                            All
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

                <div className="bookings-grid">
                    {filteredBookings.length > 0 ? (
                        filteredBookings.map((booking) => (
                            <div key={booking.booking_id} className="booking-card">
                                <div className="booking-header">
                                    <h3>{booking.hostel_name}</h3>
                                    <span className={`status-badge ${getStatusColor(booking.booking_status)}`}>
                                        {booking.booking_status.charAt(0).toUpperCase() + booking.booking_status.slice(1)}
                                    </span>
                                </div>
                                <div className="booking-details">
                                    <div className="detail-item">
                                        <span className="detail-label">Check-in Date:</span>
                                        <span className="detail-value">
                                            {new Date(booking.check_in_date).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Check-out Date:</span>
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
                                        <span className="detail-label">Booking Date:</span>
                                        <span className="detail-value">
                                            {new Date(booking.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Hostel Address:</span>
                                        <span className="detail-value">{booking.hostel_address}</span>
                                    </div>
                                </div>
                                {booking.booking_status === 'approved' && (
                                    <div className="booking-message">
                                        <p>Please visit the hostel to complete your payment and check-in.</p>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="no-bookings">
                            <p>No bookings found</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyBookings;













// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import Swal from 'sweetalert2';
// import '../../styles/student-dashboard.css';
// import '../../styles/MyBookings.css';
// import DashboardHeader from '../admin/AdminHeader';

// const MyBookings = () => {
//     const [bookings, setBookings] = useState([]);
//     const [isLoggedIn, setIsLoggedIn] = useState(false);
//     const [filter, setFilter] = useState('all'); // all, pending, approved, rejected
//     const [studentDetails, setStudentDetails] = useState(null);
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

//     useEffect(() => {
//         const fetchBookings = async () => {
//             const studentId = localStorage.getItem('student_id');
//             if (!studentId) return;

//             try {
//                 const response = await fetch(`http://localhost:5000/student-bookings/${studentId}`);
//                 if (response.ok) {
//                     const data = await response.json();
//                     setBookings(data);
//                 }
//             } catch (error) {
//                 console.error('Error fetching bookings:', error);
//                 Swal.fire({
//                     icon: 'error',
//                     title: 'Error',
//                     text: 'Failed to fetch bookings. Please try again later.',
//                 });
//             }
//         };

//         if (isLoggedIn) {
//             fetchBookings();
//         }
//     }, [isLoggedIn]);

//     const filteredBookings = bookings.filter(booking => {
//         if (filter === 'all') return true;
//         return booking.booking_status === filter;
//     });

//     const getStatusColor = (status) => {
//         switch (status.toLowerCase()) {
//             case 'pending':
//                 return 'status-pending';
//             case 'approved':
//                 return 'status-approved';
//             case 'rejected':
//                 return 'status-rejected';
//             default:
//                 return '';
//         }
//     };

//     const getPaymentStatusColor = (status) => {
//         switch (status.toLowerCase()) {
//             case 'pending':
//                 return 'payment-pending';
//             case 'paid':
//                 return 'payment-paid';
//             default:
//                 return '';
//         }
//     };

//     if (!isLoggedIn) {
//         return (
//             <div className="login-message">
//                 <div className="loading-spinner"></div>
//                 <p>Please log in to access your bookings.</p>
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
//                     <button className="nav-button" onClick={() => navigate('/student-dashboard')}>
//                         <span className="button-icon">🏠</span>
//                         Browse Hostels
//                     </button>
//                     <button className="nav-button active" onClick={() => navigate('/my-bookings')}>
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
//                 <div className="bookings-header">
//                     <h2>My Bookings</h2>
//                     <div className="filter-buttons">
//                         <button 
//                             className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
//                             onClick={() => setFilter('all')}
//                         >
//                             All
//                         </button>
//                         <button 
//                             className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
//                             onClick={() => setFilter('pending')}
//                         >
//                             Pending
//                         </button>
//                         <button 
//                             className={`filter-btn ${filter === 'approved' ? 'active' : ''}`}
//                             onClick={() => setFilter('approved')}
//                         >
//                             Approved
//                         </button>
//                         <button 
//                             className={`filter-btn ${filter === 'rejected' ? 'active' : ''}`}
//                             onClick={() => setFilter('rejected')}
//                         >
//                             Rejected
//                         </button>
//                     </div>
//                 </div>

//                 <div className="bookings-grid">
//                     {filteredBookings.length > 0 ? (
//                         filteredBookings.map((booking) => (
//                             <div key={booking.booking_id} className="booking-card">
//                                 <div className="booking-header">
//                                     <h3>{booking.hostel_name}</h3>
//                                     <span className={`status-badge ${getStatusColor(booking.booking_status)}`}>
//                                         {booking.booking_status.charAt(0).toUpperCase() + booking.booking_status.slice(1)}
//                                     </span>
//                                 </div>
//                                 <div className="booking-details">
//                                     <div className="detail-item">
//                                         <span className="detail-label">Check-in Date:</span>
//                                         <span className="detail-value">
//                                             {new Date(booking.check_in_date).toLocaleDateString()}
//                                         </span>
//                                     </div>
//                                     <div className="detail-item">
//                                         <span className="detail-label">Check-out Date:</span>
//                                         <span className="detail-value">
//                                             {booking.check_out_date 
//                                                 ? new Date(booking.check_out_date).toLocaleDateString()
//                                                 : 'Long-term stay'}
//                                         </span>
//                                     </div>
//                                     <div className="detail-item">
//                                         <span className="detail-label">Monthly Rate:</span>
//                                         <span className="detail-value">₹{booking.total_amount}</span>
//                                     </div>
//                                     <div className="detail-item">
//                                         <span className="detail-label">Booking Date:</span>
//                                         <span className="detail-value">
//                                             {new Date(booking.created_at).toLocaleDateString()}
//                                         </span>
//                                     </div>
//                                     <div className="detail-item">
//                                         <span className="detail-label">Hostel Address:</span>
//                                         <span className="detail-value">{booking.hostel_address}</span>
//                                     </div>
//                                 </div>
//                                 {booking.booking_status === 'approved' && (
//                                     <div className="booking-message">
//                                         <p>Please visit the hostel to complete your payment and check-in.</p>
//                                     </div>
//                                 )}
//                             </div>
//                         ))
//                     ) : (
//                         <div className="no-bookings">
//                             <p>No bookings found</p>
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default MyBookings; 
