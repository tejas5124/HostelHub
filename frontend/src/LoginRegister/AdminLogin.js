
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from '../api'; // ✅ Using centralized Axios instance
import '../styles/AdminLogin.css';

function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post('/admin-login', { email, password }); // ✅ updated

      const data = response.data;

      if (data.admin_id) {
        localStorage.setItem('admin_id', data.admin_id);

        Swal.fire({
          icon: 'success',
          title: 'Login Successful!',
          text: 'Redirecting to your dashboard...',
          timer: 2000,
          showConfirmButton: false,
        });

        setTimeout(() => navigate('/admin-dashboard'), 2000);
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'Admin ID Not Found',
          text: 'Please try again.',
        });
      }
    } catch (error) {
      console.error('Error logging in:', error);

      const errorMessage =
        error.response?.data?.message || 'Please check your credentials and try again.';

      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: errorMessage,
      });
    }
  };

  const handleLoginClick = () => {
    Swal.fire({
      icon: 'info',
      title: 'Redirecting...',
      text: 'Going back to the main website!',
      timer: 1500,
      showConfirmButton: false,
    });

    setTimeout(() => navigate('/login'), 1500);
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h1>🔑 HostelHub - Admin Login</h1>
        <input
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="📧 Enter your email"
        />
        <input
          type="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="🔒 Enter your password"
        />
        <button type="submit" className="login-button">🚀 Login</button>
        <button type="button" className="back-button" onClick={handleLoginClick}>⬅️ Back to Website</button>
      </form>
    </div>
  );
}

export default AdminLogin;












// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import '../styles/AdminLogin.css'; // Ensure the path is correct

// function AdminLogin() {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const navigate = useNavigate(); // Hook for navigation

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     try {
//       const response = await fetch('http://localhost:5000/admin-login', { // Adjust URL as needed
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ email, password }),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         // Redirect to the AdminDashboard page on successful login
//         navigate('/admin-dashboard');
//       } else {
//         // Handle login failure
//         setError(data.message || 'Login failed');
//       }
//     } catch (error) {
//       console.error('Error logging in:', error);
//       setError('An error occurred during login.');
//     }
//   };

//   const handlePasswordReset = () => {
//     // Implement password reset logic
//   };

//   const handleRegistration = () => {
//     navigate('/admin-register'); // Navigate to the registration page
//   };

//   const handleLoginClick = () => {
//     navigate('/login'); // Navigate back to the login page
//   };

//   return (
//     <div className="login-container">
//       <form onSubmit={handleSubmit} className="login-form">
//         <h1>HostelHub - Admin Login</h1>
//         <input
//           type="email"
//           id="email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           required
//           placeholder="Email"
//         />
//         <input
//           type="password"
//           id="password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           required
//           placeholder="Password"
//         />
//         <button type="submit" className="login-button">Login</button>
//         {error && <p className="error-message">{error}</p>}
//         <div className="info">
//           <p>Forgot your password? <button onClick={handlePasswordReset} className="link-button">Reset it here</button></p>
          
//         </div>
//         <button type="button" className="back-button" onClick={handleLoginClick}>Back to Website</button>
//       </form>
//     </div>
//   );
// }

// export default AdminLogin;





// ----------------------------------------------------------------------------------------------------------------------------
//  This 1 is final ************************



// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import Swal from 'sweetalert2';
// import '../styles/AdminLogin.css'; // Ensure the correct CSS file is imported

// function AdminLogin() {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     try {
//       const response = await fetch('http://localhost:5000/admin-login', { // Adjust URL if needed
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email, password }),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         if (data.admin_id) {
//           localStorage.setItem('admin_id', data.admin_id);

//           Swal.fire({
//             icon: 'success',
//             title: 'Login Successful!',
//             text: 'Redirecting to your dashboard...',
//             timer: 2000,
//             showConfirmButton: false,
//           });

//           setTimeout(() => navigate('/admin-dashboard'), 2000);
//         } else {
//           Swal.fire({
//             icon: 'warning',
//             title: 'Admin ID Not Found',
//             text: 'Please try again.',
//           });
//         }
//       } else {
//         Swal.fire({
//           icon: 'error',
//           title: 'Invalid Email or Password',
//           text: 'Please check your credentials and try again.',
//         });
//       }
//     } catch (error) {
//       console.error('Error logging in:', error);
//       Swal.fire({
//         icon: 'error',
//         title: 'Unexpected Error',
//         text: 'An error occurred. Please try again later.',
//       });
//     }
//   };

//   const handleLoginClick = () => {
//     Swal.fire({
//       icon: 'info',
//       title: 'Redirecting...',
//       text: 'Going back to the main website!',
//       timer: 1500,
//       showConfirmButton: false,
//     });

//     setTimeout(() => navigate('/login'), 1500);
//   };

//   return (
//     <div className="login-container">
//       <form onSubmit={handleSubmit} className="login-form">
//         <h1>🔑 HostelHub - Admin Login</h1>
//         <input
//           type="email"
//           name="email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           required
//           placeholder="📧 Enter your email"
//         />
//         <input
//           type="password"
//           name="password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           required
//           placeholder="🔒 Enter your password"
//         />
//         <button type="submit" className="login-button">🚀 Login</button>
//         <button type="button" className="back-button" onClick={handleLoginClick}>⬅️ Back to Website</button>
//       </form>
//     </div>
//   );
// }

// export default AdminLogin;

