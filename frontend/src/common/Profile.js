import React, { useEffect, useState } from 'react';
import DashboardHeader from '../dashboard/admin/AdminHeader';
import '../styles/Profile.css';
import api from '../api/api';

const roleConfig = {
  admin: {
    idKey: 'admin_id',
    endpoint: 'admin-details',
    updateEndpoint: 'admin-update',
    label: 'Admin',
  },
  owner: {
    idKey: 'owner_id',
    endpoint: 'owner-details',
    updateEndpoint: 'owner-update',
    label: 'Owner',
  },
  student: {
    idKey: 'student_id',
    endpoint: 'student-details',
    updateEndpoint: 'student-update',
    label: 'Student',
  },
};

const Profile = ({ role = 'admin' }) => {
  const [userDetails, setUserDetails] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ email: '', phone_number: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const config = roleConfig[role] || roleConfig.admin;

  useEffect(() => {
    const fetchUserDetails = async () => {
      const userId = localStorage.getItem(config.idKey);
      if (!userId) return;
      try {
        const response = await api.get(`/${config.endpoint}/${userId}`);
        const data = response.data;
        setUserDetails(data);
        setForm({
          email: data.email || '',
          phone_number: data.phone_number || '',
        });
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };
    fetchUserDetails();
  }, [config.idKey, config.endpoint]);

  const handleEdit = () => {
    setEditMode(true);
    setMessage('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const isFormChanged = () => {
    return (
      form.email !== (userDetails?.email || '') ||
      form.phone_number !== (userDetails?.phone_number || '')
    );
  };

  const isFormValid = () => {
    const emailValid = /.+@.+\..+/.test(form.email);
    const phoneValid = /^\d{10}$/.test(form.phone_number);
    return emailValid && phoneValid;
  };

  const handleSave = async () => {
    if (!isFormValid()) {
      setMessage('Please enter a valid email and 10-digit phone number.');
      return;
    }
    setLoading(true);
    setMessage('');
    const userId = localStorage.getItem(config.idKey);
    try {
      const response = await api.put(`/${config.updateEndpoint}/${userId}`, {
        email: form.email,
        phone_number: form.phone_number,
      });
      setMessage('Profile updated successfully!');
      setEditMode(false);
      setUserDetails((prev) => ({
        ...prev,
        email: form.email,
        phone_number: form.phone_number,
      }));
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage(
        error.response?.data?.message || 'Failed to update profile.'
      );
    }
    setLoading(false);
  };

  return (
    <div className="profile-page">
      <DashboardHeader role={role} />
      <div className="profile-container">
        <div className="profile-card">
          <h2 className="profile-title">{config.label} Profile</h2>
          {userDetails ? (
            <div className="profile-details">
              <div className="profile-row">
                <span className="profile-label">Name:</span>
                <span className="profile-value">{userDetails.name || '-'}</span>
              </div>
              <div className="profile-row">
                <span className="profile-label">Email:</span>
                {editMode ? (
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="profile-input"
                  />
                ) : (
                  <span className="profile-value">{userDetails.email || '-'}</span>
                )}
              </div>
              {'phone_number' in userDetails && (
                <div className="profile-row">
                  <span className="profile-label">Phone:</span>
                  {editMode ? (
                    <input
                      type="text"
                      name="phone_number"
                      value={form.phone_number}
                      onChange={handleChange}
                      className="profile-input"
                    />
                  ) : (
                    <span className="profile-value">{userDetails.phone_number || '-'}</span>
                  )}
                </div>
              )}
              {userDetails.address && (
                <div className="profile-row">
                  <span className="profile-label">Address:</span>
                  <span className="profile-value">{userDetails.address}</span>
                </div>
              )}
              {userDetails.gender && (
                <div className="profile-row">
                  <span className="profile-label">Gender:</span>
                  <span className="profile-value">{userDetails.gender}</span>
                </div>
              )}
              {userDetails.date_of_birth && (
                <div className="profile-row">
                  <span className="profile-label">Date of Birth:</span>
                  <span className="profile-value">{userDetails.date_of_birth}</span>
                </div>
              )}
              <div className="profile-actions-row">
                {!editMode ? (
                  <button className="profile-btn" onClick={handleEdit}>Edit</button>
                ) : (
                  <button className="profile-btn" onClick={handleSave} disabled={loading || !isFormChanged() || !isFormValid()}>
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                )}
              </div>
              {message && <div className="profile-message">{message}</div>}
            </div>
          ) : (
            <div className="profile-loading">Loading profile...</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;








// import React, { useEffect, useState } from 'react';
// import DashboardHeader from '../dashboard/admin/AdminHeader';
// import '../styles/Profile.css';

// const roleConfig = {
//   admin: {
//     idKey: 'admin_id',
//     endpoint: 'admin-details',
//     updateEndpoint: 'admin-update',
//     label: 'Admin',
//   },
//   owner: {
//     idKey: 'owner_id',
//     endpoint: 'owner-details',
//     updateEndpoint: 'owner-update',
//     label: 'Owner',
//   },
//   student: {
//     idKey: 'student_id',
//     endpoint: 'student-details',
//     updateEndpoint: 'student-update',
//     label: 'Student',
//   },
// };

// const Profile = ({ role = 'admin' }) => {
//   const [userDetails, setUserDetails] = useState(null);
//   const [editMode, setEditMode] = useState(false);
//   const [form, setForm] = useState({ email: '', phone_number: '' });
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState('');
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
//           setForm({
//             email: data.email || '',
//             phone_number: data.phone_number || '',
//           });
//         }
//       } catch (error) {
//         console.error('Error fetching user details:', error);
//       }
//     };
//     fetchUserDetails();
//   }, [config.idKey, config.endpoint]);

//   const handleEdit = () => {
//     setEditMode(true);
//     setMessage('');
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setForm((prev) => ({ ...prev, [name]: value }));
//   };

//   const isFormChanged = () => {
//     return (
//       form.email !== (userDetails?.email || '') ||
//       form.phone_number !== (userDetails?.phone_number || '')
//     );
//   };

//   const isFormValid = () => {
//     // Basic validation: email format and 10-digit phone
//     const emailValid = /.+@.+\..+/.test(form.email);
//     const phoneValid = /^\d{10}$/.test(form.phone_number);
//     return emailValid && phoneValid;
//   };

//   const handleSave = async () => {
//     if (!isFormValid()) {
//       setMessage('Please enter a valid email and 10-digit phone number.');
//       return;
//     }
//     setLoading(true);
//     setMessage('');
//     const userId = localStorage.getItem(config.idKey);
//     try {
//       const response = await fetch(`http://localhost:5000/${config.updateEndpoint}/${userId}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           email: form.email,
//           phone_number: form.phone_number,
//         }),
//       });
//       if (response.ok) {
//         setMessage('Profile updated successfully!');
//         setEditMode(false);
//         setUserDetails((prev) => ({ ...prev, email: form.email, phone_number: form.phone_number }));
//       } else {
//         const data = await response.json();
//         setMessage(data.message || 'Failed to update profile.');
//       }
//     } catch (error) {
//       setMessage('Error updating profile.');
//     }
//     setLoading(false);
//   };

//   return (
//     <div className="profile-page">
//       <DashboardHeader role={role} />
//       <div className="profile-container">
//         <div className="profile-card">
//           <h2 className="profile-title">{config.label} Profile</h2>
//           {userDetails ? (
//             <div className="profile-details">
//               <div className="profile-row">
//                 <span className="profile-label">Name:</span>
//                 <span className="profile-value">{userDetails.name || '-'}</span>
//               </div>
//               <div className="profile-row">
//                 <span className="profile-label">Email:</span>
//                 {editMode ? (
//                   <input
//                     type="email"
//                     name="email"
//                     value={form.email}
//                     onChange={handleChange}
//                     className="profile-input"
//                   />
//                 ) : (
//                   <span className="profile-value">{userDetails.email || '-'}</span>
//                 )}
//               </div>
//               {('phone_number' in userDetails) && (
//                 <div className="profile-row">
//                   <span className="profile-label">Phone:</span>
//                   {editMode ? (
//                     <input
//                       type="text"
//                       name="phone_number"
//                       value={form.phone_number}
//                       onChange={handleChange}
//                       className="profile-input"
//                     />
//                   ) : (
//                     <span className="profile-value">{userDetails.phone_number || '-'}</span>
//                   )}
//                 </div>
//               )}
//               {userDetails.address && (
//                 <div className="profile-row">
//                   <span className="profile-label">Address:</span>
//                   <span className="profile-value">{userDetails.address}</span>
//                 </div>
//               )}
//               {userDetails.gender && (
//                 <div className="profile-row">
//                   <span className="profile-label">Gender:</span>
//                   <span className="profile-value">{userDetails.gender}</span>
//                 </div>
//               )}
//               {userDetails.date_of_birth && (
//                 <div className="profile-row">
//                   <span className="profile-label">Date of Birth:</span>
//                   <span className="profile-value">{userDetails.date_of_birth}</span>
//                 </div>
//               )}
//               <div className="profile-actions-row">
//                 {!editMode ? (
//                   <button className="profile-btn" onClick={handleEdit}>Edit</button>
//                 ) : (
//                   <button className="profile-btn" onClick={handleSave} disabled={loading || !isFormChanged() || !isFormValid()}>
//                     {loading ? 'Saving...' : 'Save'}
//                   </button>
//                 )}
//               </div>
//               {message && <div className="profile-message">{message}</div>}
//             </div>
//           ) : (
//             <div className="profile-loading">Loading profile...</div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Profile;





