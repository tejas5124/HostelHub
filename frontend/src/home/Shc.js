import React from 'react';
import { Link } from 'react-router-dom';
import Footer from './Footer';
import Navbar from './Navbar';
import studentImage from '../images/student.png';
import ownerImage from '../images/owner.jpeg';
import adminImage from '../images/admin.jpeg';

  


import { 
  FaUserGraduate, FaBuilding, FaUserTie, FaCheck, FaArrowRight, FaSearch, FaCalendarAlt,
  FaChartLine, FaUsers, FaClipboardList, FaChartPie, FaStar, FaFileAlt, FaChartBar,
  FaClipboardCheck, FaUserFriends, FaClipboard, FaFileSignature
} from 'react-icons/fa';
import '../styles/Shc.css';

const Shc = () => {
  return (
    <div className="shc-container">
      <Navbar />
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="animate-text">HostelHub</h1>
          <h2 className="subtitle">Your Home Away From Home</h2>
          <p className="hero-description">
            Welcome to the ultimate solution for all your hostel needs. Whether you're a student, a hostel owner, or part of college management, we have something for you.
          </p>
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">500+</span>
              <span className="stat-label">Hostels</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">10k+</span>
              <span className="stat-label">Students</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">50+</span>
              <span className="stat-label">Colleges</span>
            </div>
          </div>
        </div>
      </section>

      {/* Role Selection */}
      <section className="role-selection">
        <h2 className="section-title">Choose Your Role</h2>
        <div className="role-cards">
          {/* Student Card */}
          <div className="role-card student-card">
            <div className="card-inner">
              <div className="role-icon">
                <img 
                  src={studentImage}  
                  alt="Student" 
                  loading="lazy"
                />
              </div>
              <div className="role-content">
                <h2>Student</h2>
                <p>Find and book hostels that match your preferences and budget.</p>
                <div className="features-container">
                  <div className="feature">
                    <FaSearch className="feature-icon" />
                    <span>Find Hostels</span>
                  </div>
                  <div className="feature">
                    <FaCalendarAlt className="feature-icon" />
                    <span>Book Rooms</span>
                  </div>
                  <div className="feature">
                    <FaStar className="feature-icon" />
                    <span>Rate & Review</span>
                  </div>
                  <div className="feature">
                    <FaFileAlt className="feature-icon" />
                    <span>Document Upload</span>
                  </div>
                </div>
                <Link to="/student-login" className="role-button">
                  Get Started <FaArrowRight className="button-icon" />
                </Link>
              </div>
            </div>
          </div>

          {/* Owner Card */}
          <div className="role-card owner-card">
            <div className="card-inner">
              <div className="role-icon">
                <img 
                  src={ownerImage}  
                  alt="Hostel Owner" 
                  loading="lazy"
                />
              </div>
              <div className="role-content">
                <h2>Hostel Owner</h2>
                <p>Manage your hostel efficiently and reach more students.</p>
                <div className="features-container">
                  <div className="feature">
                    <FaChartLine className="feature-icon" />
                    <span>Room Analytics</span>
                  </div>
                  <div className="feature">
                    <FaClipboardCheck className="feature-icon" />
                    <span>Maintenance Requests</span>
                  </div>
                  <div className="feature">
                    <FaChartBar className="feature-icon" />
                    <span>View Analytics</span>
                  </div>
                  <div className="feature">
                    <FaUserFriends className="feature-icon" />
                    <span>Student Management</span>
                  </div>
                </div>
                <Link to="/owner-login" className="role-button">
                  Get Started <FaArrowRight className="button-icon" />
                </Link>
              </div>
            </div>
          </div>

          {/* Admin Card */}
          <div className="role-card admin-card">
            <div className="card-inner">
              <div className="role-icon">
                <img 
                  src={adminImage}  
                  alt="College Admin" 
                  loading="lazy"
                />
              </div>
              <div className="role-content">
                <h2>College Admin</h2>
                <p>Oversee hostel operations and manage student accommodations.</p>
                <div className="features-container">
                  <div className="feature">
                    <FaUsers className="feature-icon" />
                    <span>Manage Students</span>
                  </div>
                  <div className="feature">
                    <FaClipboardList className="feature-icon" />
                    <span>Track Records</span>
                  </div>
                  <div className="feature">
                    <FaChartPie className="feature-icon" />
                    <span>View Reports</span>
                  </div>
                  <div className="feature">
                    <FaFileSignature className="feature-icon" />
                    <span>Document Verification</span>
                  </div>
                </div>
                <Link to="/admin-login" className="role-button">
                  Get Started <FaArrowRight className="button-icon" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="features-section">
        <h2 className="section-title">Why Choose HostelHub?</h2>
        <div className="features-grid">
          <div className="feature-box">
            <div className="feature-icon-large">🏠</div>
            <h3>Smart Management</h3>
            <p>Efficient room allocation and management system</p>
          </div>
          <div className="feature-box">
            <div className="feature-icon-large">📊</div>
            <h3>Room Analytics</h3>
            <p>Real-time room availability tracking and reports</p>
          </div>
          <div className="feature-box">
            <div className="feature-icon-large">⭐</div>
            <h3>Student Feedback</h3>
            <p>Comprehensive feedback system for improvement</p>
          </div>
          <div className="feature-box">
            <div className="feature-icon-large">📝</div>
            <h3>Document Management</h3>
            <p>Secure storage of student documents</p>
          </div>
        </div>
      </section>
  <Footer />

    </div>
  );
};

export default Shc;
