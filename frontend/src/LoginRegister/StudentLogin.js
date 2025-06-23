import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import '../styles/StudentLogin.css';

function StudentLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
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

  const handleForgotPassword = () => {
    navigate('/forgot-password-student');
  };

  const handleRegistration = () => {
    navigate('/student-register');
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h1>HostelHub - Student Login</h1>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="Email"
        />
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="Password"
        />
        <button type="submit" className="login-button">Login</button>
        <div className="info">
          <p>Forgot your password?
            <button
              type="button"
              onClick={handleForgotPassword}
              className="reset-link-btn"
            >
              Reset it here
            </button>
          </p>
          <p>Don't have an account?
            <button
              type="button"
              onClick={handleRegistration}
              className="register-btn"
            >
              Register here
            </button>
          </p>
        </div>
        <button type="button" className="back-btn" onClick={handleLoginClick}>⬅️ Back to Website</button>
      </form>
    </div>
  );
}

export default StudentLogin;
