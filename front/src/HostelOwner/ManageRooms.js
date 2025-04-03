import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { FaPlus, FaTrash, FaEdit } from "react-icons/fa";
import "../HostelOwner/ManageRooms.css";
import OwnerSidebar from "./OwnerSidebar";

const ManageRooms = () => {
  const owner = JSON.parse(localStorage.getItem("user"));
  const owner_id = owner ? owner.id : null;

  const [hostels, setHostels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedHostel, setSelectedHostel] = useState("");
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [editingRoom, setEditingRoom] = useState(null);

  const [roomData, setRoomData] = useState({
    room_number: "",
    room_type: "Single",
    rent_per_month: "",
    amenities: "",
    availability: 1,
  });

  // Fetch Hostels
  const fetchHostels = useCallback(() => {
    axios
      .get(`http://localhost:5000/hostels?owner_id=${owner_id}`)
      .then((response) => setHostels(response.data))
      .catch((error) => console.error("❌ Error fetching hostels:", error));
  }, [owner_id]);

  // Fetch Rooms when hostel is selected
  useEffect(() => {
    if (selectedHostel) {
      axios
        .get(`http://localhost:5000/rooms?hostel_id=${selectedHostel}`)
        .then((response) => setRooms(response.data.rooms))
        .catch((error) => console.error("❌ Error fetching rooms:", error));
    }
  }, [selectedHostel]);

  useEffect(() => {
    if (owner_id) {
      fetchHostels();
    }
  }, [owner_id, fetchHostels]);

  const handleChange = (e) => {
    setRoomData({ ...roomData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleEditRoom = (room) => {
    setEditingRoom(room);
    setRoomData({
      room_number: room.room_number,
      room_type: room.room_type,
      rent_per_month: room.rent_per_month,
      amenities: room.amenities,
      availability: room.availability,
    });
    setImage(null);
  };

  const handleSaveRoom = () => {
    if (!selectedHostel) {
      setMessage({ type: "error", text: "⚠️ Select a hostel first!" });
      return;
    }

    if (Object.values(roomData).some((val) => val === "")) {
      setMessage({ type: "error", text: "⚠️ All fields are required!" });
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("hostel_id", selectedHostel);
    formData.append("owner_id", owner_id);
    formData.append("room_number", roomData.room_number);
    formData.append("room_type", roomData.room_type);
    formData.append("rent_per_month", roomData.rent_per_month);
    formData.append("amenities", roomData.amenities);
    formData.append("availability", roomData.availability);
    if (image) formData.append("image", image);

    const apiUrl = editingRoom
      ? `http://localhost:5000/rooms/${editingRoom.id}`
      : "http://localhost:5000/rooms";

    const method = editingRoom ? axios.put : axios.post;

    method(apiUrl, formData, { headers: { "Content-Type": "multipart/form-data" } })
      .then(() => {
        setMessage({
          type: "success",
          text: editingRoom ? "✅ Room updated successfully!" : "✅ Room added successfully!",
        });
        setRoomData({
          room_number: "",
          room_type: "Single",
          rent_per_month: "",
          amenities: "",
          availability: 1,
        });
        setImage(null);
        setEditingRoom(null);
        axios
          .get(`http://localhost:5000/rooms?hostel_id=${selectedHostel}`)
          .then((response) => setRooms(response.data.rooms));
      })
      .catch((error) => {
        console.error("❌ Error:", error);
        setMessage({ type: "error", text: "❌ Error processing request!" });
      })
      .finally(() => setLoading(false));
  };

  const handleDeleteRoom = (id) => {
    if (window.confirm("Are you sure you want to delete this room?")) {
      axios
        .delete(`http://localhost:5000/rooms/${id}`)
        .then(() => {
          setRooms(rooms.filter((room) => room.id !== id));
          setMessage({ type: "success", text: "✅ Room deleted successfully!" });
        })
        .catch((error) => {
          console.error("❌ Error deleting room:", error);
          setMessage({ type: "error", text: "❌ Error deleting room!" });
        });
    }
  };

  return (
    <div className="dashboard-container">
      <OwnerSidebar />
      <div className="owner-dashboard">
        <header className="dashboard-header">
          <h2>Manage Rooms</h2>
        </header>

        {message && <div className={`alert ${message.type}`}>{message.text}</div>}

        {/* Select Hostel Dropdown */}
        <div className="select-hostel">
          <label>Select Hostel:</label>
          <select value={selectedHostel} onChange={(e) => setSelectedHostel(e.target.value)}>
            <option value=""> Select Hostel </option>
            {hostels.map((hostel) => (
              <option key={hostel.id} value={hostel.id}>
                {hostel.hostel_name}
              </option>
            ))}
          </select>
        </div>

        {/* Add/Edit Room Form */}
        {selectedHostel && (
          <div className="add-room-form">
            <h3>{editingRoom ? "Edit Room" : "Add Room"}</h3>
            <input type="text" name="room_number" placeholder="Room Number" value={roomData.room_number} onChange={handleChange} />
            <select name="room_type" value={roomData.room_type} onChange={handleChange}>
              <option value="Single">Single</option>
              <option value="Double">Double</option>
              <option value="Suite">Suite</option>
            </select>
            <input type="text" name="rent_per_month" placeholder="Rent Per Month" value={roomData.rent_per_month} onChange={handleChange} />
            <input type="text" name="amenities" placeholder="Amenities" value={roomData.amenities} onChange={handleChange} />
            <input type="file" name="image" onChange={handleFileChange} />
            <button className="add-btn" onClick={handleSaveRoom} disabled={loading}>
              {editingRoom ? "Update Room" : "Add Room"}
            </button>
          </div>
        )}

        {/* Room List */}
        {selectedHostel && (
          <>
            <h3>Rooms in Selected Hostel</h3>
            <div className="room-list">
              {rooms.map((room) => (
                <div key={room.id} className="room-item">
                  <img src={`http://localhost:5000${room.image_url}`} alt="Room" className="room-image" />
                  <p><strong>Room No:</strong> {room.room_number}</p>
                  <p><strong>Type:</strong> {room.room_type}</p>
                  <p><strong>Rent:</strong> ₹{room.rent_per_month}/month</p>
                  <button className="edit-btn" onClick={() => handleEditRoom(room)}><FaEdit /> Edit</button>
                  <button className="delete-btn" onClick={() => handleDeleteRoom(room.id)}><FaTrash /> Delete</button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ManageRooms;
