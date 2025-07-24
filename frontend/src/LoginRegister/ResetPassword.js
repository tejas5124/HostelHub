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
  const [tokenValid, setTokenValid] = useState(null); // null = checking, true = valid, false = invalid
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();
  
  // Get token from params
  const token = params.token;

  useEffect(() => {
    // Extract userType from the current path
    const path = location.pathname;
    console.log('🔍 Current path:', path);
    console.log('🔍 Token from params:', token);
    
    let detectedUserType = '';
    if (path.includes('/reset-password-student/')) {
      detectedUserType = 'student';
    } else if (path.includes('/reset-password-owner/')) {
      detectedUserType = 'owner';
    }
    
    console.log('✅ Detected userType:', detectedUserType);
    setUserType(detectedUserType);

    // Validate token exists
    if (!token) {
      console.error('❌ No token found in URL');
      setTokenValid(false);
      return;
    }

    // Validate token format (should be 64 characters hex)
    if (token.length !== 64 || !/^[a-f0-9]+$/i.test(token)) {
      console.error('❌ Invalid token format');
      setTokenValid(false);
      return;
    }

    console.log('✅ Token appears valid, ready for reset');
    setTokenValid(true);
    
  }, [location.pathname, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('🚀 Form submitted with:');
    console.log('  - UserType:', userType);
    console.log('  - Token:', token);
    console.log('  - Token length:', token?.length);
    console.log('  - Password length:', newPassword.length);
    
    if (!userType) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Reset Link',
        text: 'Unable to determine user type from the reset link.',
      });
      return;
    }
    
    if (!token || tokenValid === false) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Reset Link',
        text: 'This reset link is invalid or malformed.',
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
    if (newPassword.length < 8) {
      Swal.fire({
        icon: 'error',
        title: 'Password Too Short',
        text: 'Password must be at least 8 characters long.',
      });
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Password',
        text: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
      });
      return;
    }

    setLoading(true);
    
    try {
      const endpoint = userType === 'student'
        ? '/reset-password-student'
        : '/reset-password-owner';
      
      console.log('📡 Making request to:', endpoint);
      console.log('📡 Request payload:', { 
        token: token?.substring(0, 10) + '...', 
        passwordProvided: !!newPassword 
      });
      
      const response = await api.post(endpoint, { 
        token, 
        newPassword 
      });
      
      console.log('✅ Success response:', response.data);
      
      Swal.fire({
        icon: 'success',
        title: 'Password Reset Successful!',
        text: 'Your password has been reset successfully. Please login with your new password.',
        confirmButtonText: 'Go to Login'
      }).then(() => {
        navigate(userType === 'student' ? '/student-login' : '/owner-login');
      });
      
    } catch (error) {
      console.error('❌ Reset Error:', error);
      console.error('❌ Error Response:', error?.response?.data);
      console.error('❌ Error Status:', error?.response?.status);
      
      let errorTitle = 'Reset Failed';
      let errorMessage = 'Something went wrong. Please try again.';
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
        
        // Customize title based on error type
        if (errorMessage.includes('expired')) {
          errorTitle = 'Token Expired';
        } else if (errorMessage.includes('Invalid')) {
          errorTitle = 'Invalid Token';
        }
      } else if (error?.response?.status === 400) {
        errorTitle = 'Invalid Request';
        errorMessage = 'The reset link is invalid or has expired. Please request a new password reset.';
      } else if (error?.response?.status === 500) {
        errorTitle = 'Server Error';
        errorMessage = 'There was a server error. Please try again later.';
      }
      
      Swal.fire({
        icon: 'error',
        title: errorTitle,
        text: errorMessage,
        footer: errorMessage.includes('expired') || errorMessage.includes('Invalid') 
          ? '<a href="#" onclick="window.location.reload()">Request New Reset Link</a>' 
          : null
      });
    } finally {
      setLoading(false);
    }
  };

  // Show error if token is invalid
  if (tokenValid === false) {
    return (
      <div className="reset-password-container">
        <div className="reset-password-card">
          <div className="error-state">
            <h2>❌ Invalid Reset Link</h2>
            <p>This password reset link is invalid or malformed.</p>
            <p>Please request a new password reset link.</p>
            <div className="button-group">
              <button 
                onClick={() => navigate(userType === 'student' ? '/forgot-password-student' : '/forgot-password-owner')}
                className="primary-button"
              >
                Request New Reset Link
              </button>
              <button 
                onClick={() => navigate(userType === 'student' ? '/student-login' : '/owner-login')}
                className="secondary-button"
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show loading while validating
  if (!userType || tokenValid === null) {
    return (
      <div className="reset-password-container">
        <div className="reset-password-card">
          <div className="loading-state">
            <h2>🔍 Validating Reset Link...</h2>
            <p>Please wait while we validate your reset link.</p>
            <div className="spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-container">
      <div className="reset-password-card">
        <h2>🔐 Reset Your Password</h2>
        <p>Please enter your new password below.</p>
        <div className="user-type-indicator">
          <small>Resetting password for: <strong>{userType}</strong></small>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              required
              minLength={8}
            />
            <small className="password-hint">
              Password must be at least 8 characters with uppercase, lowercase, number, and special character.
            </small>
          </div>
          
          <div className="form-group">
            <label>Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
              minLength={8}
            />
          </div>
          
          {/* Password match indicator */}
          {newPassword && confirmPassword && (
            <div className={`password-match ${newPassword === confirmPassword ? 'match' : 'no-match'}`}>
              {newPassword === confirmPassword ? '✅ Passwords match' : '❌ Passwords do not match'}
            </div>
          )}
          
          <button 
            type="submit" 
            className="submit-button" 
            disabled={loading || newPassword !== confirmPassword || !newPassword || !confirmPassword}
          >
            {loading ? '🔄 Resetting Password...' : '🔐 Reset Password'}
          </button>
        </form>
        
        <div className="back-to-login">
          <button 
            onClick={() => navigate(userType === 'student' ? '/student-login' : '/owner-login')}
            className="link-button"
          >
            ← Back to Login
          </button>
        </div>

        {/* Debug info - remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <details className="debug-info">
            <summary>Debug Information</summary>
            <div>
              <strong>Path:</strong> {location.pathname}<br/>
              <strong>User Type:</strong> {userType}<br/>
              <strong>Token:</strong> {token ? `${token.substring(0, 10)}...` : 'None'}<br/>
              <strong>Token Length:</strong> {token ? token.length : 0}<br/>
              <strong>Token Valid:</strong> {tokenValid?.toString()}<br/>
            </div>
          </details>
        )}
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
