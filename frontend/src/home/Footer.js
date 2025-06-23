import React from 'react';
import { FaEnvelope } from 'react-icons/fa'; // Import email icon
import '../styles/Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="marquee">
        <p>
          © 2025 Hostel Hub. All rights reserved. |
          Welcome to Hostel Hub! |
          Feel free to contact us at
          <a href="mailto:hostelhub@gmail.com" className="email-link">
            <FaEnvelope className="email-icon" /> help.hostelhub@gmail.com
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
