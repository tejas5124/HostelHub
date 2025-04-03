import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminSidebar from "./AdminSidebar";
import "./ViewApprovedRejectedHostels.css";

const ViewApprovedRejectedHostels = () => {
  const [approvedHostels, setApprovedHostels] = useState([]);
  const [rejectedHostels, setRejectedHostels] = useState([]);
  const [pendingHostels, setPendingHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHostels = async () => {
      try {
        const response = await axios.get("http://localhost:5000/hostels/approved-rejected");

        setApprovedHostels(response.data.approved || []);
        setRejectedHostels(response.data.rejected || []);
        setPendingHostels(response.data.pending || []);
      } catch (err) {
        setError("Failed to fetch hostels! Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchHostels();
  }, []);

  return (
    <div className="view-hostels-container">
      <AdminSidebar />
      <div className="hostels-content">
        <h2>Approved, Rejected & Pending Hostels</h2>

        {loading ? (
          <p className="loading">Loading...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : (
          <>
            {/* Pending Hostels */}
            <h3>⏳ Pending Hostels</h3>
            {pendingHostels.length === 0 ? (
              <p className="no-data">No pending hostels.</p>
            ) : (
              <div className="hostels-grid">
                {pendingHostels.map((hostel) => (
                  <div key={hostel.id} className="hostel-card pending">
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
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Approved Hostels */}
            <h3>✅ Approved Hostels</h3>
            {approvedHostels.length === 0 ? (
              <p className="no-data">No approved hostels.</p>
            ) : (
              <div className="hostels-grid">
                {approvedHostels.map((hostel) => (
                  <div key={hostel.id} className="hostel-card approved">
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
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Rejected Hostels */}
            <h3>❌ Rejected Hostels</h3>
            {rejectedHostels.length === 0 ? (
              <p className="no-data">No rejected hostels.</p>
            ) : (
              <div className="hostels-grid">
                {rejectedHostels.map((hostel) => (
                  <div key={hostel.id} className="hostel-card rejected">
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
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ViewApprovedRejectedHostels;
