import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import './HostelView.css';

const HostelView = () => {
  const hostelFeatures = [
    {
      title: "Comfortable Rooms",
      description: "Well-furnished rooms with modern amenities",
      icon: "🏠"
    },
    {
      title: "24/7 Security",
      description: "Round-the-clock security for your safety",
      icon: "🔒"
    },
    {
      title: "High-Speed WiFi",
      description: "Fast and reliable internet connection",
      icon: "📶"
    },
    {
      title: "Clean Environment",
      description: "Regular cleaning and maintenance",
      icon: "✨"
    }
  ];

  const roomTypes = [
    {
      type: "Single Room",
      price: "₹8,000/month",
      features: ["Single bed", "Study table", "Wardrobe", "Attached bathroom"]
    },
    {
      type: "Double Room",
      price: "₹6,000/month",
      features: ["Two beds", "Study tables", "Wardrobes", "Attached bathroom"]
    },
    {
      type: "Triple Room",
      price: "₹4,500/month",
      features: ["Three beds", "Study tables", "Wardrobes", "Shared bathroom"]
    }
  ];

  return (
    <div className="hostel-view">
      {/* Hero Section */}
      <div className="hero-section">
        <Container className="text-center">
          <h1 className="hotel-name">Grand Plaza Hostel</h1>
          <p className="tagline">Your home away from home</p>
        </Container>
      </div>

      {/* Features Section */}
      <Container className="features-section">
        <h2 className="section-title">Why Choose Us?</h2>
        <Row>
          {hostelFeatures.map((feature, index) => (
            <Col md={3} key={index} className="feature-col">
              <div className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            </Col>
          ))}
        </Row>
      </Container>

      {/* Room Types Section */}
      <Container className="room-types-section">
        <h2 className="section-title">Room Types</h2>
        <Row>
          {roomTypes.map((room, index) => (
            <Col md={4} key={index}>
              <Card className="room-card">
                <Card.Body>
                  <Card.Title>{room.type}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">{room.price}</Card.Subtitle>
                  <ul className="room-features">
                    {room.features.map((feature, idx) => (
                      <li key={idx}>{feature}</li>
                    ))}
                  </ul>
                  <Button variant="primary" className="book-now-btn">Book Now</Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      {/* Contact Section */}
      <Container className="contact-section">
        <Row className="justify-content-center">
          <Col md={8} className="text-center">
            <h2>Interested in Booking?</h2>
            <p>Contact us for more information or to schedule a visit</p>
            <Button variant="success" size="lg">Contact Us</Button>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default HostelView; 