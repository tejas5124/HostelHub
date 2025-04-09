// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import '../styles/StudentLogin.css'; // Ensure the path is correct

// function StudentLogin() {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const navigate = useNavigate(); // Hook for navigation

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     try {
//         const response = await fetch('http://localhost:5000/login', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({ email, password }),
//         });

//         if (response.ok) {
//             const data = await response.json();

//             if (data.student_id) {
//                 localStorage.setItem('student_id', data.student_id);
//                 navigate('/student-dashboard'); // Redirect to StudentDashboard
//             } else {
//                 setError('Student ID not found in response.');
//             }
//         } else {
//             const data = await response.json();
//             setError(data.message || 'Login failed');
//         }
//     } catch (error) {
//         console.error('Error logging in:', error);
//         setError('An error occurred during login.');
//     }
// };


//   const handlePasswordReset = () => {
//     // Implement password reset logic
//   };

//   const handleRegistration = () => {
//     navigate('/student-register'); // Navigate to the registration page
//   };

//   const handleLoginClick = () => {
//     navigate('/login'); // Navigate back to the login page
//   };

//   return (
//     <div className="login-container">
//       <form onSubmit={handleSubmit} className="login-form">
//         <h1>HostelHub - Student Login</h1>
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
//           <p>New user? <button onClick={handleRegistration} className="link-button">Create an account</button></p>
//         </div>
//         <button type="button" className="back-button" onClick={handleLoginClick}>Back to Website</button>
//       </form>
//     </div>
//   );
// }

// export default StudentLogin;



import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; // Import SweetAlert2
import '../styles/OwnerLogin.css'; // Ensure the path is correct

function StudentLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/login', { // Ensure backend route is correct
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {  // ✅ Fixed missing curly braces
        if (data.student_id) {
          localStorage.setItem('student_id', data.student_id);
          
          Swal.fire({
            icon: 'success',
            title: 'Login Successful!',
            text: 'Redirecting to your dashboard...',
            timer: 2000,
            showConfirmButton: false,
          });

          setTimeout(() => navigate('/student-dashboard'), 2000);
        } else {
          Swal.fire({
            icon: 'warning',
            title: 'Student ID Not Found',
            text: 'Please try again.',
          });
        }
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Invalid Email or Password',
          text: 'Please check your credentials and try again.',
        });
      }
    } catch (error) {
      console.error('Error logging in:', error);
      Swal.fire({
        icon: 'error',
        title: 'Unexpected Error',
        text: 'An error occurred. Please try again later.',
      });
    }
  };

  const handleRegistration = () => {
    Swal.fire({
      icon: 'info',
      title: 'Don’t have an account?',
      text: 'Register now!',
      showConfirmButton: true,
    }).then(() => navigate('/student-register'));
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
        <h1>🔑 HostelHub - Student Login</h1>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="📧 Enter your email"
        />
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="🔒 Enter your password"
        />
        <button type="submit" className="login-button">🚀 Login</button>

        <div className="info">
          <p>Don't have an account? <button onClick={handleRegistration} className="link-button">Register here</button></p>
        </div>
        <button type="button" className="back-button" onClick={handleLoginClick}>⬅️ Back to Website</button>
      </form>
    </div>
  );
}

export default StudentLogin;  // ✅ Corrected export name
