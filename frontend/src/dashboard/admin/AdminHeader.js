import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import '../../styles/AdminHeader.css';
import api from '../../api'; // ✅ Imported centralized Axios instance

const roleConfig = {
  admin: {
    idKey: 'admin_id',
    endpoint: 'admin-details',
    dashboard: '/admin-dashboard',
    profile: '/profile',
    logout: '/admin-logout',
    login: '/admin-login',
    label: 'Admin',
  },
  owner: {
    idKey: 'owner_id',
    endpoint: 'owner-details',
    dashboard: '/owner-dashboard',
    profile: '/owner-profile',
    logout: '/owner-logout',
    login: '/owner-login',
    label: 'Owner',
  },
  student: {
    idKey: 'student_id',
    endpoint: 'student-details',
    dashboard: '/student-dashboard',
    profile: '/student-profile',
    logout: '/student-logout',
    login: '/student-login',
    label: 'Student',
  },
};

const DashboardHeader = ({ role = 'admin' }) => {
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState(null);
  const config = roleConfig[role] || roleConfig.admin;

  useEffect(() => {
    const fetchUserDetails = async () => {
      const userId = localStorage.getItem(config.idKey);
      if (!userId) return;
      try {
        const response = await api.get(`/${config.endpoint}/${userId}`);
        setUserDetails(response.data);
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };
    fetchUserDetails();
  }, [config.idKey, config.endpoint]);

  const handleLogout = async () => {
    try {
      await api.post(config.logout, {}, { withCredentials: true });
      localStorage.removeItem(config.idKey);
      window.location.href = config.login;
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <header className="navbar">
      <div className="logo" onClick={() => navigate(config.dashboard)} style={{ cursor: "pointer" }}>
        <h1 className="logo-text">HostelHub</h1>
      </div>
      <div className="header-right">
        {userDetails ? (
          <div className="admin-profile">
            <div className="admin-info">
              <span className="admin-name">Welcome, {userDetails.name || config.label}</span>
              <span className="admin-email">{userDetails.email || ''}</span>
            </div>
            <div className="profile-actions">
              <button className="profile-btn" onClick={() => navigate(config.profile)}>
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
  );
};

export default DashboardHeader;







// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import '../../styles/AdminHeader.css';

// const roleConfig = {
//   admin: {
//     idKey: 'admin_id',
//     endpoint: 'admin-details',
//     dashboard: '/admin-dashboard',
//     profile: '/profile',
//     logout: '/admin-logout',
//     login: '/admin-login',
//     label: 'Admin',
//   },
//   owner: {
//     idKey: 'owner_id',
//     endpoint: 'owner-details',
//     dashboard: '/owner-dashboard',
//     profile: '/owner-profile',
//     logout: '/owner-logout',
//     login: '/owner-login',
//     label: 'Owner',
//   },
//   student: {
//     idKey: 'student_id',
//     endpoint: 'student-details',
//     dashboard: '/student-dashboard',
//     profile: '/student-profile',
//     logout: '/student-logout',
//     login: '/student-login',
//     label: 'Student',
//   },
// };

// const DashboardHeader = ({ role = 'admin' }) => {
//   const navigate = useNavigate();
//   const [userDetails, setUserDetails] = useState(null);
//   const config = roleConfig[role] || roleConfig.admin;

//   useEffect(() => {
//     const fetchUserDetails = async () => {
//       const userId = localStorage.getItem(config.idKey);
//       if (!userId) return;
//       try {
//         const response = await fetch(`http://localhost:5000/${config.endpoint}/${userId}`);
//         if (response.ok) {
//           const data = await response.json();
//           setUserDetails(data);
//         }
//       } catch (error) {
//         console.error('Error fetching user details:', error);
//       }
//     };
//     fetchUserDetails();
//   }, [config.idKey, config.endpoint]);

//   const handleLogout = async () => {
//     try {
//       await fetch(config.logout, {
//         method: "POST",
//         credentials: "include",
//       });
//       localStorage.removeItem(config.idKey);
//       window.location.href = config.login;
//     } catch (error) {
//       console.error("Error logging out:", error);
//     }
//   };

//   return (
//     <header className="navbar">
//       <div className="logo" onClick={() => navigate(config.dashboard)} style={{ cursor: "pointer" }}>
//         <h1 className="logo-text">HostelHub</h1>
//       </div>
//       <div className="header-right">
//         {userDetails ? (
//           <div className="admin-profile">
//             <div className="admin-info">
//               <span className="admin-name">Welcome, {userDetails.name || config.label}</span>
//               <span className="admin-email">{userDetails.email || ''}</span>
//             </div>
//             <div className="profile-actions">
//               <button className="profile-btn" onClick={() => navigate(config.profile)}>
//                 <span className="button-icon">👤</span>
//                 Profile
//               </button>
//               <button onClick={handleLogout} className="logout-btn">
//                 <span className="button-icon">🚪</span>
//                 Logout
//               </button>
//             </div>
//           </div>
//         ) : (
//           <div className="profile-actions">
//             <button onClick={handleLogout} className="logout-btn">
//               <span className="button-icon">🚪</span>
//               Logout
//             </button>
//           </div>
//         )}
//       </div>
//     </header>
//   );
// };

// export default DashboardHeader; 
