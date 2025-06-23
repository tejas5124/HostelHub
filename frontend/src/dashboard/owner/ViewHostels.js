import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import HostelLayout from '../../layouts/HostelLayout';
import '../../styles/ViewHostels.css';
import DashboardHeader from '../admin/AdminHeader';

const ViewHostels = () => {
  const [hostels, setHostels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedHostel, setSelectedHostel] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchFilters, setSearchFilters] = useState({
    name: '',
    address: '',
    gender: '',
    rent: '',
    status: ''
  });
  const ownerId = localStorage.getItem('owner_id');

  useEffect(() => {
    if (!ownerId) {
      setError("Owner ID not found. Please log in again.");
      setIsLoading(false);
      return;
    }

    const fetchHostels = async () => {
      try {
        const response = await fetch(`http://localhost:5000/owner-hostels/${ownerId}`);
        const data = await response.json();
        if (response.ok) {
          setHostels(data);
        } else {
          setError(data.message || "Failed to fetch hostels");
          Swal.fire("Error", data.message, "error");
        }
      } catch (error) {
        setError("Failed to fetch hostels. Please try again.");
        Swal.fire("Error", "Failed to fetch hostels. Please try again.", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHostels();
  }, [ownerId]);

  const handleViewImage = (imagePath) => {
    if (!imagePath) {
      Swal.fire("No Image Available", "This hostel doesn't have an image uploaded yet.", "info");
      return;
    }
    const imageUrl = `http://localhost:5000/${imagePath.replace(/^\/+/, '')}`;
    Swal.fire({
      imageUrl,
      imageAlt: 'Hostel Image',
      width: '80%',
      confirmButtonText: 'Close',
    });
  };

  const handleViewDetails = (hostel) => setSelectedHostel(hostel);
  const handleBack = () => setSelectedHostel(null);

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const filteredHostels = hostels.filter(hostel => {
    const matchesName = hostel.name.toLowerCase().includes(searchFilters.name.toLowerCase());
    const matchesAddress = hostel.address.toLowerCase().includes(searchFilters.address.toLowerCase());
    const matchesGender = !searchFilters.gender || hostel.hostel_gender === searchFilters.gender;
    const matchesRent = !searchFilters.rent || hostel.rent <= parseInt(searchFilters.rent);
    const matchesStatus = !searchFilters.status || hostel.approval_status === searchFilters.status;

    return matchesName && matchesAddress && matchesGender && matchesRent && matchesStatus;
  });

  if (error) {
    return (
      <HostelLayout>
        <div className="error-container">
          <h2>⚠️ Error</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-button">Retry</button>
        </div>
      </HostelLayout>
    );
  }

  return (
    <HostelLayout>
      <DashboardHeader role="owner" />
      <div className="view-hostels-container">
        <div className="page-header">
          <h1>🏢</h1>
          <h2 className="page-title">Your Hostels</h2>
          <p className="page-subtitle">View and manage your hostel listings</p>
        </div>

        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading your hostels...</p>
          </div>
        ) : hostels.length === 0 ? (
          <div className="no-hostels">
            <img src="/no-data.png" alt="No Hostels" className="no-data-img" />
            <h3>No hostels available</h3>
            <p>Start by adding your first hostel!</p>
            <a href="/add-hostel" className="add-hostel-btn">
              <span className="button-icon">➕</span>Add Hostel
            </a>
          </div>
        ) : (
          !selectedHostel ? (
            <>
              <div className="search-container">
                <div className="search-filters">
                  <input
                    type="text"
                    name="name"
                    placeholder="🔍 Search by name..."
                    value={searchFilters.name}
                    onChange={handleSearchChange}
                    className="search-input"
                  />
                  <input
                    type="text"
                    name="address"
                    placeholder="📍 Search by address..."
                    value={searchFilters.address}
                    onChange={handleSearchChange}
                    className="search-input"
                  />
                  <select
                    name="gender"
                    value={searchFilters.gender}
                    onChange={handleSearchChange}
                    className="search-select"
                  >
                    <option value="">All Genders</option>
                    <option value="boys">Boys</option>
                    <option value="girls">Girls</option>
                  </select>
                  <input
                    type="number"
                    name="rent"
                    placeholder="💰 Max Rent"
                    value={searchFilters.rent}
                    onChange={handleSearchChange}
                    className="search-input"
                  />
                  <select
                    name="status"
                    value={searchFilters.status}
                    onChange={handleSearchChange}
                    className="search-select"
                  >
                    <option value="">All Status</option>
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="hostel-table-container">
                <table className="hostel-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Address</th>
                      <th>Gender</th>
                      <th>Rent</th>
                      <th>Total Rooms</th>
                      <th>Available Rooms</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHostels.map((hostel, index) => (
                      <tr key={hostel.hostel_id}>
                        <td>{index + 1}</td>
                        <td>{hostel.name}</td>
                        <td>{hostel.address}</td>
                        <td>{hostel.hostel_gender === 'boys' ? 'Boys' : 'Girls'}</td>
                        <td>₹{hostel.rent || 'N/A'}</td>
                        <td>{hostel.total_rooms || 'N/A'}</td>
                        <td>{hostel.available_rooms || 'N/A'}</td>
                        <td>
                          <span className={`status-badge ${hostel.approval_status}`}>
                            {hostel.approval_status}
                          </span>
                        </td>
                        <td>
                          <button onClick={() => handleViewDetails(hostel)}>View</button>
                          <button onClick={() => handleViewImage(hostel.image_path)}>Image</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="hostel-detail-view">
              <button className="back-btn" onClick={handleBack}>← Back to List</button>
              <div className="hostel-detail-card">
                <div className="hostel-detail-image-container">
                  <img
                    src={selectedHostel.image_path ? `http://localhost:5000/${selectedHostel.image_path.replace(/^\/+/, '')}` : "/placeholder.png"}
                    alt={selectedHostel.name}
                    className="hostel-detail-image"
                    onError={(e) => (e.target.src = "/placeholder.png")}
                  />
                  <div className="hostel-detail-status">
                    <span className={`approval-status-badge ${selectedHostel.approval_status}`}>
                      {selectedHostel.approval_status}
                    </span>
                  </div>
                </div>
                <div className="hostel-detail-info">
                  <h2>{selectedHostel.name}</h2>
                  <p><strong>👥 Gender:</strong> {selectedHostel.hostel_gender === 'boys' ? 'Boys Hostel' : 'Girls Hostel'}</p>
                  <p><strong>📍 Address:</strong> {selectedHostel.address}</p>
                  <p><strong>💰 Rent:</strong> ₹{selectedHostel.rent || 'N/A'}</p>
                  <p><strong>🛏️ Rooms:</strong> {selectedHostel.total_rooms} Total / {selectedHostel.available_rooms} Available</p>
                  {selectedHostel.description && (
                    <div className="hostel-description">
                      <h3>Description</h3>
                      <p>{selectedHostel.description}</p>
                    </div>
                  )}
                  {selectedHostel.facilities?.length > 0 && (
                    <div className="hostel-facilities">
                      <h3>Facilities</h3>
                      <div className="facilities-grid">
                        {selectedHostel.facilities.map((f, idx) => (
                          <span key={idx} className="facility-badge">{f}</span>
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
    </HostelLayout>
  );
};

export default ViewHostels;

