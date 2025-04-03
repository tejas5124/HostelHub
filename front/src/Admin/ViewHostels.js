import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminSidebar from "./AdminSidebar";
import "./ViewHostels.css";

const ViewHostels = () => {
  const [hostels, setHostels] = useState([]);
  const [expandedHostel, setExpandedHostel] = useState(null); // Track expanded hostel
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHostels = async () => {
      try {
        const response = await axios.get("http://localhost:5000/hostels/admin");
        setHostels(response.data);
      } catch (err) {
        setError("Failed to fetch hostels!");
      } finally {
        setLoading(false);
      }
    };
    fetchHostels();
  }, []);

  // Toggle expand/collapse owner details
  const toggleOwnerDetails = (hostelId) => {
    setExpandedHostel(expandedHostel === hostelId ? null : hostelId);
  };

  return (
    <div className="view-hostels-container">
      <AdminSidebar />
      <div className="hostels-content">
        <h2>Hostel Details</h2>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : (
          <div className="hostels-grid">
            {hostels.map((hostel) => (
              <div key={hostel.id} className="hostel-card">
                {hostel.image_url && (
                  <img
                    src={`http://localhost:5000${hostel.image_url}`}
                    alt={hostel.hostel_name}
                    className="hostel-image"
                  />
                )}
                <div className="hostel-info">
                  <h3>{hostel.hostel_name}</h3>
                  <p><strong>Location:</strong> {hostel.location}</p>
                  <p><strong>Total Rooms:</strong> {hostel.total_rooms}</p>
                  <p><strong>Available Rooms:</strong> {hostel.available_rooms}</p>
                  <p><strong>Rent:</strong> ₹{hostel.rent_per_month}/month</p>
                  <p><strong>Amenities:</strong> {hostel.amenities}</p>
                  <p><strong>Gender:</strong> {hostel.gender_specific}</p>
                  <p><strong>Contact:</strong> {hostel.contact_number}</p>
                  <p><strong>Approval Status:</strong> {hostel.approval_status}</p>

                  {/* Expand/Collapse Button */}
                  <button 
                    className="toggle-owner-btn" 
                    onClick={() => toggleOwnerDetails(hostel.id)}
                  >
                    {expandedHostel === hostel.id ? "Hide Owner Details" : "Show Owner Details"}
                  </button>

                  {/* Owner Details Section */}
                  {expandedHostel === hostel.id && (
                    <div className="owner-details">
                      <h4>Owner Details</h4>
                      <p><strong>Name:</strong> {hostel.owner_name}</p>
                      <p><strong>Email:</strong> {hostel.owner_email}</p>
                      <p><strong>Phone:</strong> {hostel.owner_phone}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewHostels;
