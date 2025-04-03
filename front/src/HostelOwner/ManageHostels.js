import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaPlus, FaTrash, FaEdit } from "react-icons/fa";
import OwnerSidebar from "./OwnerSidebar";
import "../HostelOwner/ManageHostels.css";

const ManageHostels = () => {
  const owner = JSON.parse(localStorage.getItem("user")); // Get owner details
  const owner_id = owner ? owner.id : null; // Extract owner ID

  const [hostels, setHostels] = useState([]);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editingHostel, setEditingHostel] = useState(null);
  const [image, setImage] = useState(null); // Store selected image

  const [hostelData, setHostelData] = useState({
    hostel_name: "",
    location: "",
    total_rooms: "",
    available_rooms: "",
    rent_per_month: "",
    amenities: "",
    gender_specific: "",
    contact_number: "",
  });

  useEffect(() => {
    if (owner_id) {
      fetchHostels();
    } else {
      setMessage({ type: "error", text: "⚠️ Owner ID not found. Please log in again!" });
    }
  }, [owner_id]);

  const fetchHostels = () => {
    axios
      .get(`http://localhost:5000/hostels?owner_id=${owner_id}`)
      .then((response) => setHostels(response.data))
      .catch((error) => console.error("❌ Error fetching hostels:", error.response?.data || error));
  };

  const handleChange = (e) => {
    setHostelData({ ...hostelData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setImage(e.target.files[0]); // Store selected image file
  };

  const handleSaveHostel = () => {
    if (!owner_id) {
      setMessage({ type: "error", text: "⚠️ Owner ID not found. Please log in again!" });
      return;
    }

    if (Object.values(hostelData).some((val) => val === "")) {
      setMessage({ type: "error", text: "⚠️ All fields are required!" });
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("owner_id", owner_id);
    formData.append("hostel_name", hostelData.hostel_name);
    formData.append("location", hostelData.location);
    formData.append("total_rooms", hostelData.total_rooms);
    formData.append("available_rooms", hostelData.available_rooms);
    formData.append("rent_per_month", hostelData.rent_per_month);
    formData.append("amenities", hostelData.amenities);
    formData.append("gender_specific", hostelData.gender_specific);
    formData.append("contact_number", hostelData.contact_number);
    if (image) formData.append("image", image); // Add image file

    const apiUrl = editingHostel
      ? `http://localhost:5000/hostels/${editingHostel.id}`
      : "http://localhost:5000/hostels";

    const method = editingHostel ? axios.put : axios.post;

    method(apiUrl, formData, { headers: { "Content-Type": "multipart/form-data" } })
      .then(() => {
        setMessage({
          type: "success",
          text: editingHostel ? "✅ Hostel updated successfully!" : "✅ Hostel added successfully!",
        });
        setHostelData({
          hostel_name: "",
          location: "",
          total_rooms: "",
          available_rooms: "",
          rent_per_month: "",
          amenities: "",
          gender_specific: "",
          contact_number: "",
        });
        setImage(null);
        setEditingHostel(null);
        fetchHostels();
      })
      .catch((error) => {
        console.error("❌ Error:", error.response?.data || error);
        setMessage({ type: "error", text: "❌ Error processing request!" });
      })
      .finally(() => setLoading(false));
  };

  const handleDeleteHostel = (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this hostel?");
    if (!confirmDelete) {
      return; // If user clicks "No", cancel deletion
    }
  
    axios
      .delete(`http://localhost:5000/hostels/${id}`)
      .then(() => {
        setHostels(hostels.filter((hostel) => hostel.id !== id));
        setMessage({ type: "success", text: "✅ Hostel deleted successfully!" });
      })
      .catch((error) => {
        console.error("❌ Error deleting hostel:", error);
        setMessage({ type: "error", text: "❌ Error deleting hostel!" });
      });
  };
  

  const handleEditHostel = (hostel) => {
    setEditingHostel(hostel);
    setHostelData(hostel);
  };

  return (
    <div className="manage-hostels-container">
  <OwnerSidebar />
  <div className="manage-hostels-content">
    <header className="dashboard-header">
      <h2>Manage Hostels</h2>
    </header>

    {message && <div className={`manage-hostels-alert ${message.type}`}>{message.text}</div>}

    {/* Form to Add/Edit Hostel */}
    <div className="manage-hostels-form">
      <input type="text" name="hostel_name" placeholder="Hostel Name" value={hostelData.hostel_name} onChange={handleChange} />
      <input type="text" name="location" placeholder="Location" value={hostelData.location} onChange={handleChange} />
      <input type="number" name="total_rooms" placeholder="Total Rooms" value={hostelData.total_rooms} onChange={handleChange} />
      <input type="number" name="available_rooms" placeholder="Available Rooms" value={hostelData.available_rooms} onChange={handleChange} />
      <input type="number" name="rent_per_month" placeholder="Rent per Month" value={hostelData.rent_per_month} onChange={handleChange} />
      <input type="text" name="amenities" placeholder="Amenities" value={hostelData.amenities} onChange={handleChange} />

      <select name="gender_specific" value={hostelData.gender_specific} onChange={handleChange}>
        <option value="">Select Gender-Specific</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
        <option value="Co-Ed">Co-Ed</option>
      </select>

      <input type="text" name="contact_number" placeholder="Contact Number" value={hostelData.contact_number} onChange={handleChange} />

      {/* File Input for Image Upload */}
      <input type="file" accept="image/*" onChange={handleFileChange} />

      <button onClick={handleSaveHostel} className="manage-hostels-add-btn" disabled={loading}>
        {editingHostel ? <FaEdit /> : <FaPlus />} {loading ? "Saving..." : editingHostel ? "Update Hostel" : "Add Hostel"}
      </button>
    </div>

    {/* Display Hostels in Horizontal Flex Layout */}
    <div className="manage-hostels-list">
      {hostels.map((hostel) => (
        <div key={hostel.id} className="manage-hostels-item">
          {hostel.image_url && <img src={`http://localhost:5000${hostel.image_url}`} alt="Hostel" className="manage-hostels-image" />}
          <div className="manage-hostels-details">
            <p><strong>Name:</strong> {hostel.hostel_name}</p>
            <p><strong>Location:</strong> {hostel.location}</p>
            <p><strong>Rooms:</strong> {hostel.total_rooms} total, {hostel.available_rooms} available</p>
            <p><strong>Rent:</strong> ₹{hostel.rent_per_month}/month</p>
            <p><strong>Gender:</strong> {hostel.gender_specific}</p>
            <p><strong>Contact:</strong> {hostel.contact_number}</p>
          </div>
          <div className="manage-hostels-action-buttons">
            <button className="manage-hostels-edit-btn" onClick={() => handleEditHostel(hostel)}><FaEdit /> Edit</button>
            <button className="manage-hostels-remove-btn" onClick={() => handleDeleteHostel(hostel.id)}><FaTrash /> Delete</button>
          </div>
        </div>
      ))}
    </div>
  </div>
</div>

  );
};

export default ManageHostels;
