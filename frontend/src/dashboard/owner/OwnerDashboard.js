
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "../admin/AdminHeader";
import "../../styles/OwnerDashboard.css";
import Swal from "sweetalert2";

const OwnerDashboard = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const [bookingRequests, setBookingRequests] = useState([]);

  // Check session validity
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
          Swal.fire({
            icon: "warning",
            title: "Session Expired",
            text: "Please log in again to continue.",
          }).then(() => navigate("/owner-login"));
        }
      } catch (error) {
        console.error("Session check error:", error);
        setIsLoggedIn(false);
      }
    };

    checkSession();
  }, [navigate]);

  // Fetch booking requests
  useEffect(() => {
    const fetchBookingRequests = async () => {
      const ownerId = localStorage.getItem("owner_id");
      if (!ownerId) return;
      try {
        const res = await fetch(`http://localhost:5000/owner-bookings/${ownerId}`);
        if (res.ok) {
          const data = await res.json();
          setBookingRequests(data);
        }
      } catch (err) {
        console.error("Error fetching bookings:", err);
      }
    };

    fetchBookingRequests();
  }, []);

  const handleButtonClick = (path) => navigate(`/${path}`);

  const updateBookingStatus = async (bookingId, status) => {
    try {
      const res = await fetch(`http://localhost:5000/update-booking-status/${bookingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        Swal.fire("Success", `Booking ${status} successfully`, "success");
        refreshBookings();
      } else {
        throw new Error("Failed to update booking");
      }
    } catch (err) {
      Swal.fire("Error", err.message || "Something went wrong", "error");
    }
  };

  const updatePaymentStatus = async (bookingId, status) => {
    try {
      const res = await fetch(`http://localhost:5000/update-payment-status/${bookingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        Swal.fire("Success", "Payment status updated", "success");
        refreshBookings();
      } else {
        throw new Error("Failed to update payment");
      }
    } catch (err) {
      Swal.fire("Error", err.message || "Something went wrong", "error");
    }
  };

  const refreshBookings = async () => {
    const ownerId = localStorage.getItem("owner_id");
    const updated = await fetch(`http://localhost:5000/owner-bookings/${ownerId}`);
    if (updated.ok) {
      const data = await updated.json();
      setBookingRequests(data);
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
        <DashboardHeader role="owner" />
        <div className="logo" onClick={() => navigate("/main-dashboard")} style={{ cursor: "pointer" }}>
          <h1>HostelHub</h1>
        </div>
        <nav className="nav-menu">
          <button className="nav-button" onClick={() => handleButtonClick("add-hostel")}>
            <span className="button-icon">➕</span> Add Hostel
          </button>
          <button className="nav-button" onClick={() => handleButtonClick("remove-hostel")}>
            <span className="button-icon">🗑️</span> Remove Hostel
          </button>
          <button className="nav-button" onClick={() => handleButtonClick("view-hostels")}>
            <span className="button-icon">👁️</span> View Hostels
          </button>
          <button className="nav-button" onClick={() => handleButtonClick("Update-hostels")}>
            <span className="button-icon">✏️</span> Update Hostel
          </button>
          <button className="nav-button" onClick={() => handleButtonClick("manage-students")}>
            <span className="button-icon">👥</span> Manage Students
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
    </div>
  );
};

export default OwnerDashboard;

















// // OwnerDashboard.jsx

// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";

// import DashboardHeader from '../admin/AdminHeader';
// import Profile from '../../common/Profile';

// import "../../styles/OwnerDashboard.css";
// import Swal from "sweetalert2";

// const OwnerDashboard = () => {
//   const [formType, setFormType] = useState(null);
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const navigate = useNavigate();
//   const [bookingRequests, setBookingRequests] = useState([]);
//   const [activeTab, setActiveTab] = useState('bookings'); // default to bookings

//   useEffect(() => {
//     const checkSession = async () => {
//       try {
//         const response = await fetch("/owner-session", {
//           method: "GET",
//           credentials: "include",
//         });
//         if (response.ok) {
//           setIsLoggedIn(true);
//         } else {
//           setIsLoggedIn(false);
//           Swal.fire({
//             icon: 'warning',
//             title: 'Session Expired',
//             text: 'Please log in again to continue.',
//           }).then(() => {
//             navigate('/owner-login');
//           });
//         }
//       } catch (error) {
//         console.error("Error checking session:", error);
//         setIsLoggedIn(false);
//       }
//     };

//     checkSession();
//   }, [navigate]);

//   useEffect(() => {
//     const fetchBookingRequests = async () => {
//       const ownerId = localStorage.getItem('owner_id');
//       if (!ownerId) return;

//       try {
//         const response = await fetch(`http://localhost:5000/owner-bookings/${ownerId}`);
//         if (response.ok) {
//           const data = await response.json();
//           setBookingRequests(data);
//         }
//       } catch (error) {
//         console.error('Error fetching booking requests:', error);
//       }
//     };

//     fetchBookingRequests();
//   }, []);

//   const handleButtonClick = (type) => {
//     setFormType(type);
//     navigate(`/${type}`);
//   };

//   const handleBookingStatus = async (bookingId, status) => {
//     try {
//       const response = await fetch(`http://localhost:5000/update-booking-status/${bookingId}`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ status }),
//       });

//       if (response.ok) {
//         Swal.fire({
//           icon: 'success',
//           title: 'Success!',
//           text: `Booking request ${status} successfully`,
//         });

//         const ownerId = localStorage.getItem('owner_id');
//         const updatedResponse = await fetch(`http://localhost:5000/owner-bookings/${ownerId}`);
//         if (updatedResponse.ok) {
//           const data = await updatedResponse.json();
//           setBookingRequests(data);
//         }
//       } else {
//         throw new Error('Failed to update booking status');
//       }
//     } catch (error) {
//       Swal.fire({
//         icon: 'error',
//         title: 'Error',
//         text: error.message || 'Failed to update booking status',
//       });
//     }
//   };

//   const handlePaymentStatus = async (bookingId, status) => {
//     try {
//       const response = await fetch(`http://localhost:5000/update-payment-status/${bookingId}`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ status }),
//       });

//       if (response.ok) {
//         Swal.fire({
//           icon: 'success',
//           title: 'Success!',
//           text: 'Payment status updated successfully',
//         });

//         const ownerId = localStorage.getItem('owner_id');
//         const updatedResponse = await fetch(`http://localhost:5000/owner-bookings/${ownerId}`);
//         if (updatedResponse.ok) {
//           const data = await updatedResponse.json();
//           setBookingRequests(data);
//         }
//       } else {
//         throw new Error('Failed to update payment status');
//       }
//     } catch (error) {
//       Swal.fire({
//         icon: 'error',
//         title: 'Error',
//         text: error.message || 'Failed to update payment status',
//       });
//     }
//   };

//   if (!isLoggedIn) {
//     return (
//       <div className="login-message">
//         <div className="loading-spinner"></div>
//         <p>Please log in to access the dashboard.</p>
//       </div>
//     );
//   }

//   return (
//     <div className="dashboard">
//       <div className="dashboard-header">
//         <DashboardHeader role="owner" onClick={() => navigate('/main-dashboard')} />
//         <div className="logo" onClick={() => navigate('/main-dashboard')} style={{ cursor: 'pointer' }}>
//           <h1>Your Logo/Name</h1>
//         </div>
//         <nav className="nav-menu">
//           <button className="nav-button" onClick={() => handleButtonClick("add-hostel")}>
//             <span className="button-icon">➕</span> Add Hostel
//           </button>
//           <button className="nav-button" onClick={() => handleButtonClick("remove-hostel")}>
//             <span className="button-icon">🗑️</span> Remove Hostel
//           </button>
//           <button className="nav-button" onClick={() => handleButtonClick("view-hostels")}>
//             <span className="button-icon">👁️</span> View Hostels
//           </button>
//           <button className="nav-button" onClick={() => handleButtonClick("Update-hostels")}>
//             <span className="button-icon">✏️</span> Update Hostel
//           </button>
//           <button className="nav-button" onClick={() => handleButtonClick("manage-students")}>
//             <span className="button-icon">👥</span> Manage Students
//           </button>
//         </nav>
//       </div>

//       <section className="guide-section">
//         <h2>Welcome to Your Dashboard</h2>
//         <p className="guide-subtitle">Here's what you can do:</p>
//         <div className="guide-containers">
//           <div className="guide-container"><strong>Add Hostel</strong><p>Add new hostels with details like location, facilities, and images.</p><span className="guide-icon">🏢</span></div>
//           <div className="guide-container"><strong>Remove Hostel</strong><p>Delete an existing hostel from your listings.</p><span className="guide-icon">🗑️</span></div>
//           <div className="guide-container"><strong>View Hostels</strong><p>See all the hostels you have added.</p><span className="guide-icon">👁️</span></div>
//           <div className="guide-container"><strong>Update Hostel</strong><p>Modify hostel details like availability and pricing.</p><span className="guide-icon">✏️</span></div>
//           <div className="guide-container"><strong>Manage Students</strong><p>Approve or reject student booking requests.</p><span className="guide-icon">👥</span></div>
//         </div>
//       </section>

      
       
      
//     </div>
//   );
// };

// export default OwnerDashboard;
