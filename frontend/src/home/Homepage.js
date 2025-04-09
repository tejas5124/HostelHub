import React from 'react';
import '../styles/Homepage.css'; // Ensure styles are updated for new design
import Navbar from './Navbar';
import Footer from './Footer';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="homepage-container">
      <Navbar />
      
      {/* Hero Section */}
      <main className="hero">
        <div className="hero-content">
          <h1 className="hero-title">SEAMLESS LIVING</h1>
          <p className="hero-description">
            Welcome to <span className="highlight">Hostel Hub</span>, your ultimate solution for smart and efficient hostel management. Whether you're a student, hostel owner, or administrator, our platform simplifies room allocations, fee collections, and maintenance requests, making life easier for everyone.
          </p>

          {/* Get Started Button */}
          <button className="cta-button" onClick={() => navigate('/login')}>
            Get Started 🚀
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;
