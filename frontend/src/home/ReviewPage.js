// frontend/ReviewPage.js
import React, { useState } from 'react';
import '../styles/review.css'; // Import the corresponding CSS file
import Navbar from './Navbar';
import Footer from './Footer';

const ReviewPage = () => {
  const [reviews, setReviews] = useState([
    {
      id: 1,
      name: "John Doe",
      rating: 5,
      comment: "Excellent hostel management system! Very user-friendly and efficient.",
      date: "2024-01-15",
      avatar: "JD"
    },
    {
      id: 2,
      name: "Sarah Smith",
      rating: 4,
      comment: "Great platform for managing our college hostel. The communication features are fantastic.",
      date: "2024-01-10",
      avatar: "SS"
    },
    {
      id: 3,
      name: "Mike Johnson",
      rating: 5,
      comment: "Love how streamlined everything is. Makes hostel operations so much easier!",
      date: "2024-01-08",
      avatar: "MJ"
    },
    {
      id: 4,
      name: "Emily Chen",
      rating: 4,
      comment: "Professional service and great support team. Highly recommended for hostel owners.",
      date: "2024-01-05",
      avatar: "EC"
    }
  ]);

  const [newReview, setNewReview] = useState({
    name: '',
    rating: 5,
    comment: ''
  });

  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newReview.name.trim() && newReview.comment.trim()) {
      const review = {
        id: reviews.length + 1,
        ...newReview,
        date: new Date().toISOString().split('T')[0],
        avatar: newReview.name.split(' ').map(n => n[0]).join('').toUpperCase()
      };
      setReviews([review, ...reviews]);
      setNewReview({ name: '', rating: 5, comment: '' });
      setShowForm(false);
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <span key={i} className={`star ${i < rating ? 'filled' : ''}`}>
        ★
      </span>
    ));
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <>
      <div>
        <Navbar />
        <main>
          <div className="review-section">
            <div className="review-header">
              <h1>Customer Reviews</h1>
              <p>See what our customers are saying about Hostel Hub</p>
              <button 
                className="add-review-btn"
                onClick={() => setShowForm(!showForm)}
              >
                {showForm ? 'Cancel' : 'Write a Review'}
              </button>
            </div>

            {/* Review Form */}
            {showForm && (
              <div className="review-form-container">
                <form onSubmit={handleSubmit} className="review-form">
                  <h3>Share Your Experience</h3>
                  <div className="form-group">
                    <label htmlFor="name">Name</label>
                    <input
                      type="text"
                      id="name"
                      value={newReview.name}
                      onChange={(e) => setNewReview({...newReview, name: e.target.value})}
                      placeholder="Enter your name"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="rating">Rating</label>
                    <select
                      id="rating"
                      value={newReview.rating}
                      onChange={(e) => setNewReview({...newReview, rating: parseInt(e.target.value)})}
                    >
                      <option value={5}>5 Stars - Excellent</option>
                      <option value={4}>4 Stars - Very Good</option>
                      <option value={3}>3 Stars - Good</option>
                      <option value={2}>2 Stars - Fair</option>
                      <option value={1}>1 Star - Poor</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="comment">Review</label>
                    <textarea
                      id="comment"
                      value={newReview.comment}
                      onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                      placeholder="Tell us about your experience..."
                      rows={4}
                      required
                    />
                  </div>
                  <button type="submit" className="submit-btn">
                    Submit Review
                  </button>
                </form>
              </div>
            )}

            {/* Reviews Grid */}
            <div className="reviews-grid">
              {reviews.map((review) => (
                <div key={review.id} className="review-card">
                  <div className="review-header-card">
                    <div className="reviewer-info">
                      <div className="avatar">{review.avatar}</div>
                      <div className="reviewer-details">
                        <h4>{review.name}</h4>
                        <p className="review-date">{formatDate(review.date)}</p>
                      </div>
                    </div>
                    <div className="rating">
                      {renderStars(review.rating)}
                    </div>
                  </div>
                  <div className="review-content">
                    <p>{review.comment}</p>
                  </div>
                </div>
              ))}
            </div>

            {reviews.length === 0 && (
              <div className="no-reviews">
                <p>No reviews yet. Be the first to share your experience!</p>
              </div>
            )}
          </div>
        </main>
        <div><Footer /></div>
      </div>
    </>
  );
};

export default ReviewPage;