import React from 'react';
import '../styles/Contact.css';
import { FaPhone, FaEnvelope, FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import emailjs from '@emailjs/browser';
import Navbar from '../home/Navbar';
import Footer from '../home/Footer';

// Initialize EmailJS with your public key
emailjs.init("bTyrXO1tKE3gpruGw"); // Replace with your actual public key from EmailJS dashboard

class Contact extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      formData: {
        name: '',
        email: '',
        subject: '',
        message: ''
      },
      isSubmitting: false
    };
  }

  handleChange = (e) => {
    this.setState({
      formData: {
        ...this.state.formData,
        [e.target.name]: e.target.value
      }
    });
  }

  handleSubmit = async (e) => {
    e.preventDefault();
    this.setState({ isSubmitting: true });

    try {
      // Send email using EmailJS
      const response = await emailjs.send(
        'service_6z9ccrf', // Your EmailJS service ID
        'template_q87wpur', // Your EmailJS template ID
        
        {
          to_email: 'help.hostelhub@gmail.com',
          from_name: this.state.formData.name,
          from_email: this.state.formData.email,
          subject: this.state.formData.subject,
          message: this.state.formData.message,
        }
      );

      if (response.status === 200) {
        // Show success message
        alert('Message sent successfully! We will get back to you soon.');
        
        // Reset form
        this.setState({
          formData: {
            name: '',
            email: '',
            subject: '',
            message: ''
          },
          isSubmitting: false
        });

        // Redirect to homepage
        window.location.href = '/home';
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again later.');
      this.setState({ isSubmitting: false });
    }
  }

  render() {
    const { formData, isSubmitting } = this.state;

    return (
      <>
        <div>
          <Navbar/>
          {/* Spacer div to account for fixed navbar */}
          <div style={{ height: '80px' }}></div>
          <main>
            <div className="contact-container">
              {/* Hero Section */}
              <div className="contact-hero">
                <h1>Get in Touch</h1>
                <p>We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
              </div>

              <div className="contact-content">
                {/* Contact Information */}
                <div className="contact-info">
                  <div className="info-card">
                    <FaPhone className="info-icon" />
                    <h3>Phone</h3>
                    <p>+91 9561152287</p>
                  </div>
                  <div className="info-card">
                    <FaEnvelope className="info-icon" />
                    <h3>Email</h3>
                    <p>help.hostelhub@gmail.com</p>
                  </div>
                </div>

                {/* Contact Form */}
                <div className="contact-form-container">
                  <form onSubmit={this.handleSubmit} className="contact-form">
                    <div className="form-group">
                      <label htmlFor="name">Name</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={this.handleChange}
                        required
                        placeholder="Your name"
                        className="modern-input"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="email">Email</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={this.handleChange}
                        required
                        placeholder="Your email"
                        className="modern-input"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="subject">Subject</label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={this.handleChange}
                        required
                        placeholder="Subject of your message"
                        className="modern-input"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="message">Message</label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={this.handleChange}
                        required
                        placeholder="Your message"
                        rows="5"
                        className="modern-input"
                      ></textarea>
                    </div>
                    <button 
                      type="submit" 
                      className={`submit-btn ${isSubmitting ? 'submitting' : ''}`}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Sending...' : 'Send Message'}
                    </button>
                  </form>
                </div>
              </div>

              {/* Social Media Section */}
              <div className="social-media-section">
                <h2>Connect With Us</h2>
                <div className="social-icons">
                  <a href="#" className="social-icon"><FaFacebook /></a>
                  <a href="#" className="social-icon"><FaTwitter /></a>
                  <a href="#" className="social-icon"><FaInstagram /></a>
                  <a href="#" className="social-icon"><FaLinkedin /></a>
                </div>
              </div>
            </div>
          </main>
          <div><Footer/></div>
        </div>
      </>
    );
  }
}

export default Contact;
