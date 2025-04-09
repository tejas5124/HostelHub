import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import OwnerHeader from "./OwnerHeader";
import Swal from "sweetalert2";
import "../styles/AddHostel.css";

const AddHostel = () => {
  const navigate = useNavigate();
  const [ownerId, setOwnerId] = useState(null);
  const [hostelData, setHostelData] = useState({
    owner_id: "", // Will be updated with actual logged-in owner ID
    name: "",
    address: "",
    description: "",
    total_rooms: "",
    available_rooms: "",
    rent: "",
    facilities: [],
  });

  const [image, setImage] = useState(null);

  useEffect(() => {
    const storedOwnerId = localStorage.getItem("owner_id");
    if (storedOwnerId) {
      setOwnerId(storedOwnerId);
      setHostelData((prevState) => ({ ...prevState, owner_id: storedOwnerId }));
    } else {
      Swal.fire({
        icon: "error",
        title: "Unauthorized",
        text: "Please log in first!",
      }).then(() => {
        navigate("/owner-login");
      });
    }
  }, [navigate]);

  const handleChange = (e) => {
    setHostelData({ ...hostelData, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setHostelData((prevState) => ({
      ...prevState,
      facilities: checked
        ? [...prevState.facilities, value]
        : prevState.facilities.filter((item) => item !== value),
    }));
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    Swal.fire({
      title: "Submitting...",
      text: "Please wait while we add your hostel.",
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const formData = new FormData();
      Object.keys(hostelData).forEach((key) => {
        if (key === "facilities") {
          formData.append(key, JSON.stringify(hostelData[key]));
        } else {
          formData.append(key, hostelData[key]);
        }
      });

      if (image) {
        formData.append("image", image);
      }

      const response = await fetch("http://localhost:5000/add-hostel", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      Swal.close();

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Hostel Added!",
          text: "Your hostel has been successfully added.",
        }).then(() => {
          navigate("/owner-dashboard");
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message || "Failed to add hostel.",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong! Please try again.",
      });
    }
  };

  return (
    <div className="add-hostel-container">
      <OwnerHeader />
      <div className="form-card">
        <h2>Add New Hostel</h2>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="form">
            {[
              { name: "name", label: "Hostel Name" },
              { name: "address", label: "Address" },
              { name: "description", label: "Description" },
              { name: "total_rooms", label: "Total Rooms" },
              { name: "available_rooms", label: "Available Rooms" },
              { name: "rent", label: "Monthly Rent" },
            ].map(({ name, label }) => (
              <div key={name} className="form-group">
                <label htmlFor={name} className="form-label">{label}:</label>
                <input
                  type={name.includes("rooms") || name === "rent" ? "number" : "text"}
                  id={name}
                  name={name}
                  placeholder={label}
                  value={hostelData[name]}
                  onChange={handleChange}
                  required
                />
              </div>
            ))}
          </div>

          {/* Facilities Section */}
          <div className="facilities-section">
            <label className="section-label">Facilities:</label>
            <div className="facilities-list">
              {["WiFi", "Hot Water", "Parking", "Laundry", "Gym"].map((facility) => (
                <label key={facility} className="facility-badge">
                  <input type="checkbox" value={facility} onChange={handleCheckboxChange} />
                  {facility}
                </label>
              ))}
            </div>
          </div>

          {/* Image Upload */}
          <div className="form-group">
            <label className="form-label">Upload Image:</label>
            <input type="file" accept="image/*" onChange={handleImageChange} required />
          </div>

          <button type="submit" className="submit-button">Add Hostel</button>
        </form>
      </div>
    </div>
  );
};

export default AddHostel;
