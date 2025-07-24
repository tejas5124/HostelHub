import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from '../api';
import '../styles/ResetPassword.css';

function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { token, userType } = useParams();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
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

    // Check if token exists
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
      
      console.log('Sending request to:', endpoint);
      console.log('With data:', { token, newPassword }); // Don't log in production
      
      // Try with just token and newPassword first
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
      console.error('Error Status:', error?.response?.status);
      console.error('Request Config:', error?.config);
      
      let errorMessage = 'Something went wrong. Please try again.';
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.response?.status === 400) {
        errorMessage = 'Invalid request. Please check your reset link.';
      } else if (error?.response?.status === 404) {
        errorMessage = 'Reset link not found or has expired.';
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

  return (
    <div className="reset-password-container">
      <div className="reset-password-card">
        <h2>Reset Password</h2>
        <p>Please enter your new password below.</p>
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
