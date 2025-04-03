import React, { useState, useEffect } from "react";
import axios from "axios";
import StudentSidebar from "./StudentSidebar";
import "../Student/BookHostel.css";

const BookHostel = () => {
  const [hostels, setHostels] = useState([]);
  const [rooms, setRooms] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRooms, setShowRooms] = useState({});
  const [expandedHostel, setExpandedHostel] = useState(null); // Track expanded owner details
  const student_id = localStorage.getItem("student_id");

  useEffect(() => {
    const fetchAvailableHostels = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get("http://localhost:5000/api/hostels/available");
        setHostels(response.data);
      } catch (err) {
        setError("Failed to fetch hostels!");
      } finally {
        setLoading(false);
      }
    };
    fetchAvailableHostels();
  }, []);

  // Fetch rooms for a specific hostel
  const toggleRooms = async (hostel_id) => {
    setShowRooms((prev) => ({
      ...prev,
      [hostel_id]: !prev[hostel_id], // Toggle visibility
    }));
  
    // Only fetch rooms if not already fetched
    if (!rooms[hostel_id] && !showRooms[hostel_id]) {
      try {
        const response = await axios.get(`http://localhost:5000/api/rooms/${hostel_id}`);
        setRooms((prev) => ({
          ...prev,
          [hostel_id]: response.data.rooms || [],
        }));
      } catch (err) {
        alert(`No rooms found for this hostel.`);
      }
    }
  };
  

  // Toggle hostel owner details
  const toggleOwnerDetails = (hostelId) => {
    setExpandedHostel(expandedHostel === hostelId ? null : hostelId);
  };

  // Function to handle booking
  const bookHostel = async (hostel_id) => {
    const student_id = localStorage.getItem("student_id"); // Get logged-in student ID
  
    if (!student_id) {
      alert("❌ Please log in to book a hostel!");
      return;
    }
  
    try {
      const response = await axios.post("http://localhost:5000/api/bookings", {
        student_id,
        hostel_id,
      });
  
      alert(response.data.message);
    } catch (err) {
      alert("❌ Booking failed! Please try again.");
    }
  };
  

  return (
    <div className="book-hostel-container">
      <StudentSidebar />
      <div className="hostels-content">
        <h2>Book a Hostel</h2>

        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : (
          <div className="hostels-grid">
            {hostels.length === 0 ? (
              <p>No hostels available for booking.</p>
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
                    <p><strong>Available Rooms:</strong> {hostel.available_rooms}</p>
                    <p><strong>Rent:</strong> ₹{hostel.rent_per_month}/month</p>
                    <p><strong>Amenities:</strong> {hostel.amenities}</p>

                    {/* Toggle Owner Details Button */}
                    <button className="toggle-owner-btn" onClick={() => toggleOwnerDetails(hostel.id)}>
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

                    {/* View Rooms Button */}
                    <button className="view-rooms-btn" onClick={() => toggleRooms(hostel.id)}>
                      {showRooms[hostel.id] ? "Hide Rooms" : "View Rooms"}
                    </button>

                    {showRooms[hostel.id] && rooms[hostel.id] ? (
                      <div className="rooms-list">
                        <h4>Rooms in {hostel.hostel_name}</h4>
                        {rooms[hostel.id].length === 0 ? (
                          <p>No rooms available</p>
                        ) : (
                          rooms[hostel.id].map((room) => (
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
                    ) : null}

                    {/* Book Hostel Button */}
                    <button className="book-hostel-btn" onClick={() => bookHostel(hostel.id)}>
                      Book Hostel
                    </button>
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

export default BookHostel;
