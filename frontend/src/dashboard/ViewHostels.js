import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import '../styles/ViewHostels.css';
import OwnerHeader from './OwnerHeader';

const ViewHostels = () => {
  const [hostels, setHostels] = useState([]);
  const [selectedHostel, setSelectedHostel] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const ownerId = localStorage.getItem('owner_id');

  useEffect(() => {
    const fetchHostels = async () => {
      if (!ownerId) {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Owner ID not found. Please log in again!',
        });
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get(`http://localhost:5000/owner-hostels/${ownerId}`);
        if (response.data.length === 0) {
          Swal.fire({
            icon: 'info',
            title: 'No Hostels Found',
            text: 'You have not added any hostels yet!',
          });
        }
        setHostels(response.data);
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: `Failed to fetch hostels: ${err.message}`,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchHostels();
  }, [ownerId]);

  const handleViewDetails = (hostel) => {
    setSelectedHostel(hostel);
  };

  const handleBack = () => {
    setSelectedHostel(null);
  };

  if (isLoading) {
    return <div className="loading">Loading hostels...</div>;
  }

  return (
    <div>
      <OwnerHeader />
      <h1 className="all-hostels-title">🏠 My Hostels</h1>

      <div className="view-hostels-container">
        {!selectedHostel ? (
          <div className="hostel-grid">
            {hostels.length > 0 ? (
              hostels.map((hostel, index) => (
                <div key={hostel.hostel_id} className="hostel-card">
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
                    <button onClick={() => handleViewDetails(hostel)} className="view-details-btn">🔍 View Details</button>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-hostels">No hostels found for this owner.</p>
            )}
          </div>
        ) : (
          <div className="hostel-details">
            <h1>🏨 </h1>
            <h2>{selectedHostel.name}</h2>

            <div className="hostel-img-container">
              {selectedHostel.image_path ? (
                <img src={`http://localhost:5000${selectedHostel.image_path}`} alt={selectedHostel.name} className="hostel-img" />
              ) : (
                <p className="no-image">🚫 No image available.</p>
              )}
            </div>

            {/* ✅ Structured Hostel Details with Icons */}
            <div className="hostel-detail-table">
              <div className="detail-row"><span className="detail-title">📍 Address:</span> {selectedHostel.address}</div>
              <div className="detail-row"><span className="detail-title">💰 Rent:</span> ₹{selectedHostel.rent || 'N/A'}</div>
              <div className="detail-row"><span className="detail-title">🛏️ Total Rooms:</span> {selectedHostel.total_rooms || 'N/A'}</div>
              <div className="detail-row"><span className="detail-title">🚪 Available Rooms:</span> {selectedHostel.available_rooms || 'N/A'}</div>
              <div className="detail-row"><span className="detail-title">✔️ Approval Status:</span> {selectedHostel.approval_status || 'Pending'}</div>
              <div className="detail-row"><span className="detail-title">📄 Description:</span> {selectedHostel.description || 'N/A'}</div>

              {/* ✅ Fixed Facilities Display */}
              <div className="detail-row"><span className="detail-title">🛠️ Facilities:</span>
                {selectedHostel.facilities ? (
                  Array.isArray(selectedHostel.facilities) ? (
                    <ul className="facility-list">
                      {selectedHostel.facilities.map((facility, index) => (
                        <li key={index}>✔️ {typeof facility === 'string' ? facility : JSON.stringify(facility)}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>{typeof selectedHostel.facilities === 'string' ? selectedHostel.facilities : 'Invalid facilities format'}</p>
                  )
                ) : (
                  <p>🚫 No facilities listed.</p>
                )}
              </div>
            </div>

            <button onClick={handleBack} className="back-btn">🔙 Back</button>
            </div>
        )}
      </div>
    </div>
  );
};

export default ViewHostels;
