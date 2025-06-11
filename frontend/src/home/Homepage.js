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
        <div className="hero-overlay"></div>
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

      {/* Features Section */}
      <section className="features-section">
        <h2 className="section-title">Why Choose HostelHub?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🏠</div>
            <h3>Smart Management</h3>
            <p>Efficient room allocation and management system for hostel owners</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Room Analytics</h3>
            <p>Real-time room availability tracking and occupancy reports</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔧</div>
            <h3>Quick Maintenance</h3>
            <p>Instant maintenance request system for students</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⭐</div>
            <h3>Student Feedback</h3>
            <p>Comprehensive feedback system for continuous improvement</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🏆</div>
            <h3>Hostel Ratings</h3>
            <p>Transparent rating system for hostel quality and services</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📝</div>
            <h3>Document Management</h3>
            <p>Secure storage and management of student documents</p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <h2 className="section-title">What Our Users Say</h2>
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <div className="testimonial-content">
              "HostelHub has made managing my hostel so much easier. The platform is intuitive and efficient."
            </div>
            <div className="testimonial-author">- Hostel Owner</div>
          </div>
          <div className="testimonial-card">
            <div className="testimonial-content">
              "As a student, finding and booking hostels has never been simpler. Great platform!"
            </div>
            <div className="testimonial-author">- Student</div>
          </div>
          <div className="testimonial-card">
            <div className="testimonial-content">
              "The maintenance request system is a game-changer. Everything is so organized!"
            </div>
            <div className="testimonial-author">- College Admin</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Get Started?</h2>
          <p>Join thousands of students and hostel owners who trust HostelHub</p>
          <button className="cta-button secondary" onClick={() => navigate('/login')}>
            Join Now 🚀
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
