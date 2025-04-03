import { Link } from "react-router-dom";
import "../styles/Navbar.css";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="logo-container">
        {/* Use public path directly without import */}
        <img src="/images/logo.jpg" alt="HostelHub Logo" className="logo-img" />
        <h1 className="logo-text">HostelHub</h1>
      </div>
      <input type="checkbox" id="menu-toggle" className="menu-toggle" />
      <label htmlFor="menu-toggle" className="menu-icon">&#9776;</label>
      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/contact">Contact</Link>
        <Link to="/login" className="get-started">Get Started</Link>
      </div>
    </nav>
  );
};

export default Navbar;
