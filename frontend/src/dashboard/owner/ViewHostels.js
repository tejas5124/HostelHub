import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import HostelLayout from '../../layouts/HostelLayout';
import '../../styles/ViewHostels.css';
import DashboardHeader from '../admin/AdminHeader';
import api from '../../api'; // centralized axios

const ViewHostels = () => {
  const [hostels, setHostels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedHostel, setSelectedHostel] = useState(null);
  const [searchFilters, setSearchFilters] = useState({
    name: '',
    address: '',
    gender: '',
    rent: '',
    status: ''
  });

  const ownerId = localStorage.getItem('owner_id');

  // Default placeholder as base64 data URI to avoid 404 errors
  const defaultPlaceholder = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f0f0f0'/%3E%3Ctext x='200' y='150' text-anchor='middle' dy='.3em' font-family='Arial, sans-serif' font-size='18' fill='%23999'%3ENo Image Available%3C/text%3E%3C/svg%3E";

  useEffect(() => {
    if (!ownerId) {
      setError("Owner ID not found. Please log in again.");
      setIsLoading(false);
      return;
    }

    const fetchHostels = async () => {
      try {
        const response = await api.get(`/owner-hostels/${ownerId}`);
        const data = response.data.map(h => ({
          ...h,
          facilities: Array.isArray(h.facilities)
            ? h.facilities
            : h.facilities
            ? JSON.parse(h.facilities)
            : []
        }));
        setHostels(data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch hostels. Please try again.");
        Swal.fire({
          title: "Error",
          text: "Failed to fetch hostels. Please try again.",
          icon: "error",
          confirmButtonColor: "#3085d6"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchHostels();
  }, [ownerId]);

  const handleViewImage = (imagePath) => {
    if (!imagePath) {
      Swal.fire({
        title: "No Image Available",
        text: "This hostel doesn't have an image uploaded yet.",
        icon: "info",
        confirmButtonColor: "#3085d6"
      });
      return;
    }
    const imageUrl = `${process.env.REACT_APP_API_URL}/${imagePath.replace(/^\/+/, '')}`;
    Swal.fire({
      imageUrl,
      imageAlt: 'Hostel Image',
      width: '80%',
      confirmButtonText: 'Close',
      confirmButtonColor: "#3085d6",
      imageWidth: 600,
      imageHeight: 400,
      customClass: {
        image: 'swal-image-rounded'
      }
    });
  };

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setSearchFilters({
      name: '',
      address: '',
      gender: '',
      rent: '',
      status: ''
    });
  };

  const filteredHostels = hostels.filter(hostel => {
    const matchesName = hostel.name?.toLowerCase().includes(searchFilters.name.toLowerCase());
    const matchesAddress = hostel.address?.toLowerCase().includes(searchFilters.address.toLowerCase());
    const matchesGender = !searchFilters.gender || hostel.hostel_gender === searchFilters.gender;
    const matchesRent = !searchFilters.rent || hostel.rent <= parseInt(searchFilters.rent);
    const matchesStatus = !searchFilters.status || hostel.approval_status === searchFilters.status;

    return matchesName && matchesAddress && matchesGender && matchesRent && matchesStatus;
  });

  const handleBack = () => setSelectedHostel(null);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return '✅';
      case 'pending': return '⏳';
      case 'rejected': return '❌';
      default: return '📋';
    }
  };

  const getGenderIcon = (gender) => {
    return gender === 'boys' ? '👨‍🎓' : '👩‍🎓';
  };

  if (error) {
    return (
      <HostelLayout>
        <div className="error-container">
          <div className="error-content">
            <div className="error-icon">⚠️</div>
            <h2>Oops! Something went wrong</h2>
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="retry-button">
              🔄 Try Again
            </button>
          </div>
        </div>
      </HostelLayout>
    );
  }

  return (
    <HostelLayout>
      <DashboardHeader role="owner" />
      <div className="view-hostels-wrapper">
        <div className="view-hostels-container">
        <div className="page-header">
          <div className="header-content">
            <div className="header-icon">🏢</div>
            <div className="header-text">
              <h1 className="page-title">My Hostels</h1>
              <p className="page-subtitle">Manage and view your hostel properties</p>
            </div>
          </div>
          <div className="header-stats">
            <div className="stat-card">
              <span className="stat-number">{hostels.length}</span>
              <span className="stat-label">Total Hostels</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{hostels.filter(h => h.approval_status === 'approved').length}</span>
              <span className="stat-label">Approved</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{hostels.filter(h => h.approval_status === 'pending').length}</span>
              <span className="stat-label">Pending</span>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading your hostels...</p>
          </div>
        ) : hostels.length === 0 ? (
          <div className="no-hostels">
            <div className="no-data-illustration">
              <div className="no-data-icon">🏗️</div>
              <h3>No hostels found</h3>
              <p>Start building your hostel empire by adding your first property!</p>
              <a href="/add-hostel" className="add-hostel-btn">
                <span className="button-icon">➕</span>
                Add Your First Hostel
              </a>
            </div>
          </div>
        ) : (
          !selectedHostel ? (
            <>
              {/* Enhanced Search Filters */}
              <div className="search-container">
                <div className="search-header">
                  <h3>🔍 Search & Filter</h3>
                  <button onClick={clearFilters} className="clear-filters-btn">
                    Clear All
                  </button>
                </div>
                <div className="search-filters">
                  <div className="filter-group">
                    <label>Hostel Name</label>
                    <input 
                      name="name" 
                      type="text" 
                      placeholder="Search by name..." 
                      value={searchFilters.name} 
                      onChange={handleSearchChange} 
                      className="search-input" 
                    />
                  </div>
                  <div className="filter-group">
                    <label>Address</label>
                    <input 
                      name="address" 
                      type="text" 
                      placeholder="Search by location..." 
                      value={searchFilters.address} 
                      onChange={handleSearchChange} 
                      className="search-input" 
                    />
                  </div>
                  <div className="filter-group">
                    <label>Gender</label>
                    <select name="gender" value={searchFilters.gender} onChange={handleSearchChange} className="search-select">
                      <option value="">All Genders</option>
                      <option value="boys">👨‍🎓 Boys</option>
                      <option value="girls">👩‍🎓 Girls</option>
                    </select>
                  </div>
                  <div className="filter-group">
                    <label>Max Rent</label>
                    <input 
                      name="rent" 
                      type="number" 
                      placeholder="Maximum rent..." 
                      value={searchFilters.rent} 
                      onChange={handleSearchChange} 
                      className="search-input" 
                    />
                  </div>
                  <div className="filter-group">
                    <label>Status</label>
                    <select name="status" value={searchFilters.status} onChange={handleSearchChange} className="search-select">
                      <option value="">All Status</option>
                      <option value="approved">✅ Approved</option>
                      <option value="pending">⏳ Pending</option>
                      <option value="rejected">❌ Rejected</option>
                    </select>
                  </div>
                </div>
                {filteredHostels.length !== hostels.length && (
                  <div className="filter-results">
                    Showing {filteredHostels.length} of {hostels.length} hostels
                  </div>
                )}
              </div>

              {/* Enhanced Hostel Cards */}
              <div className="hostels-grid">
                {filteredHostels.map((hostel, index) => (
                  <div key={hostel.hostel_id} className="hostel-card">
                    <div className="hostel-image-container">
                      <img
                        src={hostel.image_path ? `${process.env.REACT_APP_API_URL}/${hostel.image_path.replace(/^\/+/, '')}` : defaultPlaceholder}
                        alt={hostel.name}
                        className="hostel-image"
                        onError={(e) => {
                          e.target.src = defaultPlaceholder;
                        }}
                      />
                      <div className="hostel-status-overlay">
                        <span className={`status-badge ${hostel.approval_status}`}>
                          {getStatusIcon(hostel.approval_status)} {hostel.approval_status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="hostel-content">
                      <div className="hostel-header">
                        <h3 className="hostel-name">{hostel.name}</h3>
                        <div className="hostel-gender">
                          {getGenderIcon(hostel.hostel_gender)}
                        </div>
                      </div>
                      
                      <div className="hostel-details">
                        <div className="detail-item">
                          <span className="detail-icon">📍</span>
                          <span className="detail-text">{hostel.address}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-icon">💰</span>
                          <span className="detail-text">₹{hostel.rent}/month</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-icon">🛏️</span>
                          <span className="detail-text">{hostel.available_rooms}/{hostel.total_rooms} rooms available</span>
                        </div>
                      </div>

                      <div className="hostel-actions">
                        <button 
                          onClick={() => setSelectedHostel(hostel)}
                          className="view-btn primary"
                        >
                          👁️ View Details
                        </button>
                        <button 
                          onClick={() => handleViewImage(hostel.image_path)}
                          className="view-btn secondary"
                        >
                          🖼️ View Image
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            /* Enhanced Detail View */
            <div className="hostel-detail-view">
              <div className="detail-header">
                <button className="back-btn" onClick={handleBack}>
                  ← Back to List
                </button>
                <div className="detail-actions">
                  <button 
                    onClick={() => handleViewImage(selectedHostel.image_path)}
                    className="action-btn"
                  >
                    🖼️ View Full Image
                  </button>
                </div>
              </div>

              <div className="hostel-detail-card">
                <div className="detail-image-section">
                  <img
                    src={selectedHostel.image_path ? `${process.env.REACT_APP_API_URL}/${selectedHostel.image_path.replace(/^\/+/, '')}` : defaultPlaceholder}
                    alt={selectedHostel.name}
                    className="hostel-detail-image"
                    onError={(e) => {
                      e.target.src = defaultPlaceholder;
                    }}
                  />
                  <div className="detail-status-overlay">
                    <span className={`approval-status-badge ${selectedHostel.approval_status}`}>
                      {getStatusIcon(selectedHostel.approval_status)} {selectedHostel.approval_status}
                    </span>
                  </div>
                </div>

                <div className="detail-info-section">
                  <div className="detail-title">
                    <h1>{selectedHostel.name}</h1>
                    <span className="gender-badge">
                      {getGenderIcon(selectedHostel.hostel_gender)} {selectedHostel.hostel_gender === 'boys' ? 'Boys Hostel' : 'Girls Hostel'}
                    </span>
                  </div>

                  <div className="detail-info-grid">
                    <div className="info-card">
                      <div className="info-icon">📍</div>
                      <div className="info-content">
                        <h4>Location</h4>
                        <p>{selectedHostel.address}</p>
                      </div>
                    </div>

                    <div className="info-card">
                      <div className="info-icon">💰</div>
                      <div className="info-content">
                        <h4>Monthly Rent</h4>
                        <p>₹{selectedHostel.rent}</p>
                      </div>
                    </div>

                    <div className="info-card">
                      <div className="info-icon">🛏️</div>
                      <div className="info-content">
                        <h4>Room Availability</h4>
                        <p>{selectedHostel.available_rooms} available out of {selectedHostel.total_rooms} total</p>
                      </div>
                    </div>

                    <div className="info-card">
                      <div className="info-icon">📊</div>
                      <div className="info-content">
                        <h4>Occupancy Rate</h4>
                        <p>{Math.round(((selectedHostel.total_rooms - selectedHostel.available_rooms) / selectedHostel.total_rooms) * 100)}%</p>
                      </div>
                    </div>
                  </div>

                  {selectedHostel.description && (
                    <div className="description-section">
                      <h3>📝 Description</h3>
                      <p className="description-text">{selectedHostel.description}</p>
                    </div>
                  )}

                  {selectedHostel.facilities.length > 0 && (
                    <div className="facilities-section">
                      <h3>🏠 Facilities & Amenities</h3>
                      <div className="facilities-grid">
                        {selectedHostel.facilities.map((facility, idx) => (
                          <div key={idx} className="facility-item">
                            <span className="facility-icon">✅</span>
                            <span className="facility-name">{facility}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        )}
      </div>
      </div>
    </HostelLayout>
  );
};

export default ViewHostels;
