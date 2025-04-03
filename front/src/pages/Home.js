import { Link } from "react-router-dom";
import "../styles/Home.css";
import Navbar from "./Navbar";

const Home = () => {
  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-container">
          <h2 className="hero-heading">Find Your Perfect Hostel</h2>
          <p className="hero-description">Safe, Comfortable, and Affordable Hostels Near You</p>
          <Link to="/login" className="btn-main">Get Started</Link>
        </div>
      </div>

      {/* Features & How It Works Section */}
      <div className="info-section">

        {/* Features Section */}
        <section className="features-area">
          <h2 className="section-heading">Why Choose HostelHub?</h2>
          <div className="features-list">
            <div className="feature-card">
              <img src="/images/cleanroom.jpg" alt="Clean Rooms" />
              <h3>Comfortable & Affordable</h3>
              <p>Find hostels that match your budget without compromising comfort.</p>
            </div>
            <div className="feature-card">
              <img src="/images/studentfriendly.jpg" alt="Student Friendly" />
              <h3>Student-Friendly Environment</h3>
              <p>Hostels designed to meet students' needs with study spaces and WiFi.</p>
            </div>
            <div className="feature-card">
              <img src="/images/secured.png" alt="Security" />
              <h3>Safe & Secure</h3>
              <p>24/7 security and CCTV to ensure your safety.</p>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="process-area">
          <h2 className="section-heading">How It Works</h2>
          <div className="process-steps">
            {[
              "Search for a Hostel",
              "Compare & Choose",
              "Book Instantly",
              "Contact Hostel Owner",
              "Move In & Enjoy",
            ].map((title, index) => (
              <div className="process-step" key={index}>
                <span className="step-number">{index + 1}</span>
                <h3>{title}</h3>
                <p>Quick and easy steps to find your ideal hostel.</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Testimonials Section */}
      <section className="testimonials-area">
        <h2 className="section-heading">What Our Users Say</h2>
        <div className="testimonial-container">
          {[
            { quote: "HostelHub made it so easy to find the perfect place. I love it!", author: "Rahul Sharma" },
            { quote: "A great platform with verified hostels and secure bookings.", author: "Priya Singh" },
            { quote: "Best hostel booking experience ever! Highly recommended.", author: "Aman Verma" },
          ].map((testimonial, index) => (
            <div className="testimonial-box" key={index}>
              <p>"{testimonial.quote}"</p>
              <h4>- {testimonial.author}</h4>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta-area">
        <h2>Ready to Find Your Hostel?</h2>
        <p>Join thousands of students who have found their ideal hostel with HostelHub.</p>
        <Link to="/login" className="btn-main">Start Now</Link>
      </section>
    </>
  );
};

export default Home;
