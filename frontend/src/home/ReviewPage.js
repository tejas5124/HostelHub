import React, { useState, useEffect } from 'react';
import api from '../api'; // ✅ Axios instance
import '../styles/review.css';
import Navbar from './Navbar';
import Footer from './Footer';

const ReviewPage = () => {
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({
    name: '',
    rating: 5,
    comment: ''
  });
  const [showForm, setShowForm] = useState(false);

  // ✅ Fetch reviews from backend
  useEffect(() => {
    api.get('/api/reviews')
      .then((res) => {
        const enriched = res.data.map((review) => ({
          ...review,
          avatar: review.name.split(' ').map(n => n[0]).join('').toUpperCase()
        }));
        setReviews(enriched);
      })
      .catch((err) => {
        console.error('Error fetching reviews:', err);
      });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newReview.name.trim() || !newReview.comment.trim()) return;

    api.post('/api/reviews', newReview)
      .then((res) => {
        const avatar = newReview.name.split(' ').map(n => n[0]).join('').toUpperCase();
        const addedReview = { ...res.data, avatar };
        setReviews([addedReview, ...reviews]);
        setNewReview({ name: '', rating: 5, comment: '' });
        setShowForm(false);
      })
      .catch((err) => {
        console.error('Error posting review:', err);
      });
  };

  const renderStars = (rating) =>
    [...Array(5)].map((_, i) => (
      <span key={i} className={`star ${i < rating ? 'filled' : ''}`}>★</span>
    ));

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

  return (
    <>
      <Navbar />
    <div style={{ height: '80px' }}></div>
      <main>
        <div className="review-section">
          <div className="review-header">
            <h1>Customer Reviews</h1>
            <p>See what our customers are saying about Hostel Hub</p>
            <button className="add-review-btn" onClick={() => setShowForm(!showForm)}>
              {showForm ? 'Cancel' : 'Write a Review'}
            </button>
          </div>

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
                    onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                    placeholder="Enter your name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="rating">Rating</label>
                  <select
                    id="rating"
                    value={newReview.rating}
                    onChange={(e) => setNewReview({ ...newReview, rating: parseInt(e.target.value) })}
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
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    placeholder="Tell us about your experience..."
                    rows={4}
                    required
                  />
                </div>
                <button type="submit" className="submit-btn">Submit Review</button>
              </form>
            </div>
          )}

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
                  <div className="rating">{renderStars(review.rating)}</div>
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
      <Footer />
    </>
  );
};

export default ReviewPage;
