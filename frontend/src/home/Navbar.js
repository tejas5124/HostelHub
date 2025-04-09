import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Navbar.css';

const NavbarEnhanced = () => {
  return (
    <header className="navbar-enhanced">
      {/* Logo Section */}
      <div className="navbar-logo">
        <img src="image.png" alt="Hostel Hub Logo" />
        <span>Hostel Hub</span>
      </div>

      {/* Navigation Links */}
      <nav>
        <ul className="navbar-menu">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/reviews">Reviews</Link></li>
          <li><Link to="/contact">Contact</Link></li>
        </ul>
      </nav>
    </header>
  );
};

export default NavbarEnhanced;
