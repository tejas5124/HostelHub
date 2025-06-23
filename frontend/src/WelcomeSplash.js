import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/WelcomeSplash.css';
import logo from './images/Logo2.jpg';

const WelcomeSplash = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/home'); // Change '/home' to your actual homepage route if different
    }, 2500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="welcome-splash-container">
      <div className="welcome-splash-card">
        <img src={logo} alt="Welcome Logo" className="welcome-logo" />
        <h1 className="welcome-title">Welcome to HostelHub</h1>
        <p className="welcome-desc">Your modern solution for hostel management</p>
      </div>
    </div>
  );
};

export default WelcomeSplash; 