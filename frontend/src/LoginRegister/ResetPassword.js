import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from '../api';
import '../styles/ResetPassword.css';

function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState('');
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();
  
  // Get token from params
  const token = params.token;

  useEffect(() => {
    // Extract userType from the current path
    const path = location.pathname;
    console.log('Current path:', path);
    
    if (path.includes('/reset-password-student/')) {
      setUserType('student');
      console.log('Detected userType: student');
    } else if (path.includes('/reset-password-owner/')) {
      setUserType('owner');
      console.log('Detected userType: owner');
    } else if (params.userType) {
      // Fallback for route pattern /reset-password/:userType/:token
      setUserType(params.userType);
      console.log('Detected userType from params:', params.userType);
    } else {
      console.error('Could not determine userType from path:', path);
    }
  }, [location.pathname, params.userType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!userType) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Reset Link',
        text: 'Unable to determine user type from the reset link.',
      });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Passwords do not match',
        text: 'Please make sure your passwords match.',
      });
      return;
    }

    // Password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Password',
        text: 'Password must be at least 8 characters long and contain uppercase, lowercase, number and special character',
      });
      return;
    }

    if (!token) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Reset Link',
        text: 'This reset link is invalid or has expired.',
      });
      return;
    }

    setLoading(true);
    
    try {
      const endpoint = userType === 'student'
        ? '/reset-password-student'
        : '/reset-password-owner';
      
      console.log('User Type:', userType);
      console.log('Sending request to:', endpoint);
      console.log('With data:', { token, newPassword });
      
      const response = await api.post(endpoint, { 
        token, 
        newPassword 
      });
      
      console.log('Success response:', response.data);
      
      Swal.fire({
        icon: 'success',
        title: 'Password Reset Successful!',
        text: 'Your password has been reset. Please login with your new password.',
      });
      
      navigate(userType === 'student' ? '/student-login' : '/owner-login');
      
    } catch (error) {
      console.error('Reset Error:', error);
      console.error('Error Response:', error?.response?.data);
      
      let errorMessage = 'Something went wrong. Please try again.';
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.status === 400) {
        errorMessage = 'Invalid or expired reset token. Please request a new password reset.';
      }
      
      Swal.fire({
        icon: 'error',
        title: 'Reset Failed',
        text: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  // Show loading while determining userType
  if (!userType) {
    return (
      <div className="reset-password-container">
        <div className="reset-password-card">
          <h2>Loading...</h2>
          <p>Validating reset link...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-container">
      <div className="reset-password-card">
        <h2>Reset Password</h2>
        <p>Please enter your new password below.</p>
        <p><small>Resetting password for: {userType}</small></p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New Password"
              required
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm New Password"
              required
            />
          </div>
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
        <div className="back-to-login">
          <button onClick={() => navigate(userType === 'student' ? '/student-login' : '/owner-login')}>
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;














// import React, { useState } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import Swal from 'sweetalert2';
// import '../styles/ResetPassword.css';

// function ResetPassword() {
//   const [newPassword, setNewPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();
//   const { token, userType } = useParams();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (newPassword !== confirmPassword) {
//       Swal.fire({
//         icon: 'error',
//         title: 'Passwords do not match',
//         text: 'Please make sure your passwords match.',
//       });
//       return;
//     }

//     // Password validation
//     const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
//     if (!passwordRegex.test(newPassword)) {
//       Swal.fire({
//         icon: 'error',
//         title: 'Invalid Password',
//         text: 'Password must be at least 8 characters long and contain uppercase, lowercase, number and special character',
//       });
//       return;
//     }

//     setLoading(true);

//     try {
//       const endpoint = userType === 'student' ? '/reset-password-student' : '/reset-password-owner';
//       const response = await fetch(`http://localhost:5000${endpoint}`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         credentials: 'include',
//         body: JSON.stringify({ token, newPassword }),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         Swal.fire({
//           icon: 'success',
//           title: 'Password Reset Successful!',
//           text: 'Your password has been reset. Please login with your new password.',
//         });
//         navigate(userType === 'student' ? '/student-login' : '/owner-login');
//       } else {
//         Swal.fire({
//           icon: 'error',
//           title: 'Error',
//           text: data.message || 'Something went wrong. Please try again.',
//         });
//       }
//     } catch (error) {
//       console.error('Error:', error);
//       Swal.fire({
//         icon: 'error',
//         title: 'Error',
//         text: 'An unexpected error occurred. Please try again.',
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="reset-password-container">
//       <div className="reset-password-card">
//         <h2>Reset Password</h2>
//         <p>Please enter your new password below.</p>
        
//         <form onSubmit={handleSubmit}>
//           <div className="form-group">
//             <input
//               type="password"
//               value={newPassword}
//               onChange={(e) => setNewPassword(e.target.value)}
//               placeholder="New Password"
//               required
//             />
//           </div>
          
//           <div className="form-group">
//             <input
//               type="password"
//               value={confirmPassword}
//               onChange={(e) => setConfirmPassword(e.target.value)}
//               placeholder="Confirm New Password"
//               required
//             />
//           </div>
          
//           <button type="submit" className="submit-button" disabled={loading}>
//             {loading ? 'Resetting...' : 'Reset Password'}
//           </button>
//         </form>

//         <div className="back-to-login">
//           <button onClick={() => navigate(userType === 'student' ? '/student-login' : '/owner-login')}>
//             Back to Login
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default ResetPassword; 
