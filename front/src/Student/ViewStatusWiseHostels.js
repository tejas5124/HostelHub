import React, { useState, useEffect } from "react";
import axios from "axios";
import StudentSidebar from "./StudentSidebar";
import "../Student/ViewStatusWiseHostels.css";

const ViewStatusWiseHostels = () => {
  const [hostels, setHostels] = useState([]);
  const [rooms, setRooms] = useState({});
  const [status, setStatus] = useState("Approved");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRooms, setShowRooms] = useState({});
  const [roomLoading, setRoomLoading] = useState({}); // Track room loading state
  const [roomError, setRoomError] = useState({}); // Track room fetch errors

  useEffect(() => {
    const fetchHostelsByStatus = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`http://localhost:5000/api/hostels/status/${status}`);
        setHostels(response.data);
      } catch (err) {
        setError("Failed to fetch hostels! Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchHostelsByStatus();
  }, [status]);

  // Function to fetch and toggle rooms
  const toggleRooms = async (hostel_id) => {
    setShowRooms((prev) => ({
      ...prev,
      [hostel_id]: !prev[hostel_id],
    }));

    if (!rooms[hostel_id]) {
      setRoomLoading((prev) => ({ ...prev, [hostel_id]: true }));
      setRoomError((prev) => ({ ...prev, [hostel_id]: null }));

      try {
        const response = await axios.get(`http://localhost:5000/api/rooms/${hostel_id}`);
        setRooms((prev) => ({
          ...prev,
          [hostel_id]: response.data.rooms || [],
        }));
      } catch (err) {
        setRoomError((prev) => ({ ...prev, [hostel_id]: "Failed to load rooms!" }));
      } finally {
        setRoomLoading((prev) => ({ ...prev, [hostel_id]: false }));
      }
    }
  };

  return (
    <div className="view-hostels-container">
      <StudentSidebar />
      <div className="hostels-content">
        <h2>View Status Wise Hostels</h2>

        {/* Status Filter Buttons */}
        <div className="filter-buttons">
          {["Approved", "Pending", "Rejected"].map((stat) => (
            <button
              key={stat}
              onClick={() => setStatus(stat)}
              className={status === stat ? "active" : ""}
            >
              {stat}
            </button>
          ))}
        </div>

        {/* Loading & Error Handling */}
        {loading ? (
          <p>Loading hostels...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : (
          <div className="hostels-grid">
            {hostels.length === 0 ? (
              <p>No {status} hostels found.</p>
            ) : (
              hostels.map((hostel) => (
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
                    <p><strong>Approval Status:</strong> {hostel.approval_status}</p>

                    {/* View Rooms Button */}
                    <button className="view-rooms-btn" onClick={() => toggleRooms(hostel.id)}>
                      {showRooms[hostel.id] ? "Hide Rooms" : "View Rooms"}
                    </button>

                    {showRooms[hostel.id] && (
                      <div className="rooms-list">
                        <h4>Rooms in {hostel.hostel_name}</h4>

                        {roomLoading[hostel.id] ? (
                          <p>Loading rooms...</p>
                        ) : roomError[hostel.id] ? (
                          <p className="error">{roomError[hostel.id]}</p>
                        ) : rooms[hostel.id] && rooms[hostel.id].length === 0 ? (
                          <p>No rooms available</p>
                        ) : (
                          rooms[hostel.id]?.map((room) => (
                            <div key={room.id} className="room-card">
                              {room.image_url && (
                                <img
                                  src={`http://localhost:5000${room.image_url}`}
                                  alt="Room"
                                  className="room-image"
                                />
                              )}
                              <p><strong>Room No:</strong> {room.room_number}</p>
                              <p><strong>Type:</strong> {room.room_type}</p>
                              <p><strong>Rent:</strong> ₹{room.rent_per_month}/month</p>
                              <p><strong>Amenities:</strong> {room.amenities}</p>
                              <p><strong>Availability:</strong> {room.availability ? "Available" : "Not Available"}</p>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewStatusWiseHostels;
