import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import HostelLayout from '../../layouts/HostelLayout';
import '../../styles/ViewHostels.css';
import DashboardHeader from '../admin/AdminHeader';


import { useNavigate } from 'react-router-dom';

const UpdateHostel = () => {
  const navigate = useNavigate();
  const [hostels, setHostels] = useState([]);
  const [selectedHostel, setSelectedHostel] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);
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
        const response = await axios.get(`http://localhost:5000/owner-hostels/${ownerId}`);
        setHostels(response.data);
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

  const handleViewDetails = (hostel) => {
    setSelectedHostel(hostel);
    setFormData({
      hostel_id: hostel.hostel_id,
      owner_id: ownerId,
      name: hostel.name,
      address: hostel.address,
      rent: hostel.rent,
      total_rooms: hostel.total_rooms,
      available_rooms: hostel.available_rooms,
      description: hostel.description,
      facilities: Array.isArray(hostel.facilities) ? hostel.facilities.join(', ') : hostel.facilities || '',
    });
  };

  const handleBack = () => {
    setSelectedHostel(null);
    setFormData({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.name || !formData.address || !formData.rent || !formData.total_rooms || !formData.description) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Fields',
        text: 'Please fill in all required fields',
        confirmButtonColor: '#1e3c72'
      });
      return false;
    }
    if (formData.rent < 0 || formData.total_rooms < 0 || formData.available_rooms < 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Values',
        text: 'Values cannot be negative',
        confirmButtonColor: '#1e3c72'
      });
      return false;
    }
    if (formData.available_rooms > formData.total_rooms) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Room Count',
        text: 'Available rooms cannot be more than total rooms',
        confirmButtonColor: '#1e3c72'
      });
      return false;
    }
    return true;
  };

  const handleUpdateSubmit = async () => {
    if (!validateForm()) return;

    setIsUpdating(true);
    try {
      const processedData = {
        ...formData,
        facilities: formData.facilities.split(',').map(f => f.trim()).filter(f => f),
        owner_id: ownerId
      };

      console.log('Sending update data:', processedData);

      const response = await axios.put('http://localhost:5000/update-hostel', processedData);
      
      if (response.data.message) {
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Hostel updated successfully!',
          confirmButtonColor: '#1e3c72'
        });
        const updatedResponse = await axios.get(`http://localhost:5000/owner-hostels/${ownerId}`);
        setHostels(updatedResponse.data);
        setTimeout(() => {
          setSelectedHostel(null);
          setFormData({});
        }, 2000);
      }
    } catch (error) {
      console.error('Update error:', error.response?.data || error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to update hostel. Please try again.',
        confirmButtonColor: '#1e3c72'
      });
    } finally {
      setIsUpdating(false);
    }
  };

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
          <h2 className="page-title">Update Hostels</h2>
          <p className="page-subtitle">View and update your hostel listings</p>
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
                          <button onClick={() => handleViewDetails(hostel)}>Update</button>
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
                  <div className="form-group">
                    <label>🏢 Name:</label>
                    <input 
                      name="name" 
                      value={formData.name} 
                      onChange={handleChange} 
                      required 
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>📍 Address:</label>
                    <input 
                      name="address" 
                      value={formData.address} 
                      onChange={handleChange} 
                      required 
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>💰 Rent (₹):</label>
                    <input 
                      name="rent" 
                      type="number" 
                      value={formData.rent} 
                      onChange={handleChange} 
                      required 
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>🛏️ Total Rooms:</label>
                    <input 
                      name="total_rooms" 
                      type="number" 
                      value={formData.total_rooms} 
                      onChange={handleChange} 
                      required 
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>🛏️ Available Rooms:</label>
                    <input 
                      name="available_rooms" 
                      type="number" 
                      value={formData.available_rooms} 
                      onChange={handleChange} 
                      required 
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>📝 Description:</label>
                    <textarea 
                      name="description" 
                      value={formData.description} 
                      onChange={handleChange} 
                      required 
                      className="form-input"
                      rows="4"
                    />
                  </div>

                  <div className="form-group">
                    <label>✨ Facilities (comma-separated):</label>
                    <input 
                      name="facilities" 
                      value={formData.facilities} 
                      onChange={handleChange} 
                      className="form-input"
                      placeholder="e.g., WiFi, Laundry, Food"
                    />
                  </div>

                  <div className="action-buttons">
                    <button 
                      onClick={handleUpdateSubmit} 
                      disabled={isUpdating}
                      className="update-btn"
                    >
                      {isUpdating ? 'Updating...' : 'Update Hostel'}
                    </button>
                    <button onClick={() => handleViewImage(selectedHostel.image_path)}>View Image</button>
                  </div>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </HostelLayout>
  );
};

export default UpdateHostel;
