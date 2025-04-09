import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import '../styles/ViewHostels.css';
import OwnerHeader from './OwnerHeader';

const UpdateHostel = () => {
  const [hostels, setHostels] = useState([]);
  const [selectedHostel, setSelectedHostel] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState('');

  const ownerId = localStorage.getItem('owner_id');

  useEffect(() => {
    const fetchHostels = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/owner-hostels/${ownerId}`);
        setHostels(response.data);
      } catch (error) {
        Swal.fire('Error', 'Failed to fetch hostels', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHostels();
  }, [ownerId]);

  const handleUpdateClick = (hostel) => {
    setSelectedHostel(hostel);
    setFormData({
      hostel_id: hostel.hostel_id,
      name: hostel.name,
      address: hostel.address,
      rent: hostel.rent,
      total_rooms: hostel.total_rooms,
      available_rooms: hostel.available_rooms,
      description: hostel.description,
      facilities: hostel.facilities || '',
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateSubmit = async () => {
    try {
      const response = await axios.put('http://localhost:5000/update-hostel', formData);
      if (response.data.message) {
        setMessage('✅ Hostel updated successfully!');
        setTimeout(() => {
          setSelectedHostel(null);
          setMessage('');
          window.location.reload();
        }, 2000);
      } else {
        setMessage('❌ Error updating hostel details');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('❌ Error updating hostel details');
    }
  };

  if (isLoading) return <div className="loading">Loading hostels...</div>;

  return (
    <div>
      <OwnerHeader />
      <h1 className="all-hostels-title">✏️ Update My Hostels</h1>

      <div className="view-hostels-container">
        {!selectedHostel ? (
          <div className="hostel-grid">
            {hostels.map((hostel, index) => (
              <div key={hostel.hostel_id} className="hostel-card updated">
                <h3 className="hostel-name">{index + 1}. {hostel.name} 🏢</h3>
                <div className="hostel-img-container">
                  {hostel.image_path ? (
                    <img src={`http://localhost:5000${hostel.image_path}`} alt={hostel.name} className="hostel-img" />
                  ) : (
                    <p className="no-image">🚫 No Image Available</p>
                  )}
                </div>
                <div className="hostel-info">
                  <p>📍 <strong>Address:</strong> {hostel.address}</p>
                  <p>💰 <strong>Rent:</strong> ₹{hostel.rent || 'N/A'}</p>
                  <button onClick={() => handleUpdateClick(hostel)} className="view-details-btn update-btn">✏️ Update</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="hostel-details enhanced-form">
          <h2 className="form-heading">✏️ Update: {selectedHostel.name}</h2>
        
          <div className="hostel-update-form">
            <label>🏢 Name: <input name="name" value={formData.name} onChange={handleChange} /></label>
            <label>📍 Address: <input name="address" value={formData.address} onChange={handleChange} /></label>
            <label>💰 Rent (₹): <input name="rent" type="number" value={formData.rent} onChange={handleChange} /></label>
            <label>🛏️ Total Rooms: <input name="total_rooms" type="number" value={formData.total_rooms} onChange={handleChange} /></label>
            <label>🚪 Available Rooms: <input name="available_rooms" type="number" value={formData.available_rooms} onChange={handleChange} /></label>
            <label>📝 Description: <textarea name="description" value={formData.description} onChange={handleChange} /></label>
            <label>🛠️ Facilities (comma separated): <input name="facilities" value={formData.facilities} onChange={handleChange} /></label>
        
            <div className="btn-container">
              <button onClick={handleUpdateSubmit} className="submit-button">✅ Submit Update</button>
              <button onClick={() => setSelectedHostel(null)} className="back-btn">🔙 Back</button>
            </div>
        
            {message && <p className="message">{message}</p>}
          </div>
        </div>
        
        )}
      </div>
    </div>
  );
};

export default UpdateHostel;
