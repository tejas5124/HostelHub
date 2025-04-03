import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminSidebar from "./AdminSidebar";
import "./ApproveRejectHostels.css";

const ApproveRejectHostels = () => {
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch hostels from the backend
  useEffect(() => {
    const fetchHostels = async () => {
      try {
        const response = await axios.get("http://localhost:5000/hostels/admin");
        setHostels(response.data);
      } catch (err) {
        setError("Failed to fetch hostels! Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchHostels();
  }, []);

  // Handle approval or rejection
  const updateApprovalStatus = async (hostelId, status) => {
    try {
      await axios.put(`http://localhost:5000/hostels/update-status/${hostelId}`, {
        approval_status: status,
      });

      // Update UI state after approval/rejection
      setHostels((prevHostels) =>
        prevHostels.map((hostel) =>
          hostel.id === hostelId ? { ...hostel, approval_status: status } : hostel
        )
      );
    } catch (err) {
      alert("Failed to update approval status. Please try again!");
    }
  };

  return (
    <div className="approve-reject-container">
      <AdminSidebar />
      <div className="hostels-content">
        <h2>Approve or Reject Hostels</h2>

        {loading ? (
          <p className="loading">Loading...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : hostels.length === 0 ? (
          <p className="no-data">No hostels available for approval.</p>
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
                  <p><strong>Approval Status:</strong> 
                    <span className={`status ${hostel.approval_status.toLowerCase()}`}>
                      {hostel.approval_status}
                    </span>
                  </p>

                  {/* Approve & Reject Buttons */}
                  <div className="action-buttons">
                    <button
                      className={`approve-btn ${hostel.approval_status === "Approved" ? "disabled" : ""}`}
                      onClick={() => updateApprovalStatus(hostel.id, "Approved")}
                      disabled={hostel.approval_status === "Approved"}
                    >
                      Approve
                    </button>
                    <button
                      className={`reject-btn ${hostel.approval_status === "Rejected" ? "disabled" : ""}`}
                      onClick={() => updateApprovalStatus(hostel.id, "Rejected")}
                      disabled={hostel.approval_status === "Rejected"}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApproveRejectHostels;
