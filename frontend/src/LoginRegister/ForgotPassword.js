import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from '../api'; // ✅ Axios instance
import '../styles/ForgotPassword.css';

function ForgotPassword({ userType }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const endpoint = userType === 'student'
      ? '/forgot-password-student'
      : '/forgot-password-owner';

    try {
      const response = await api.post(endpoint, { email });

      Swal.fire({
        icon: 'success',
        title: 'Email Sent!',
        text: 'Please check your email for password reset instructions.',
      });

      navigate(userType === 'student' ? '/student-login' : '/owner-login');
    } catch (error) {
      console.error('Forgot password error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error?.response?.data?.message || 'Something went wrong. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <h2>Forgot Password</h2>
        <p>Enter your email address and we’ll send you instructions to reset your password.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="back-to-login">
          <button
            onClick={() =>
              navigate(userType === 'student' ? '/student-login' : '/owner-login')
            }
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;











// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import Swal from 'sweetalert2';
// import '../styles/ForgotPassword.css';

// function ForgotPassword({ userType }) {
//   const [email, setEmail] = useState('');
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const endpoint = userType === 'student' ? '/forgot-password-student' : '/forgot-password-owner';
//       const response = await fetch(`http://localhost:5000${endpoint}`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         credentials: 'include',
//         body: JSON.stringify({ email }),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         Swal.fire({
//           icon: 'success',
//           title: 'Email Sent!',
//           text: 'Please check your email for password reset instructions.',
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
//     <div className="forgot-password-container">
//       <div className="forgot-password-card">
//         <h2>Forgot Password</h2>
//         <p>Enter your email address and we'll send you instructions to reset your password.</p>
        
//         <form onSubmit={handleSubmit}>
//           <div className="form-group">
//             <input
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               placeholder="Enter your email"
//               required
//             />
//           </div>
          
//           <button type="submit" className="submit-button" disabled={loading}>
//             {loading ? 'Sending...' : 'Send Reset Link'}
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

// export default ForgotPassword; 