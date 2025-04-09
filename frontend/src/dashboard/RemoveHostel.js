import React, { useState, useEffect } from "react";
import OwnerHeader from "./OwnerHeader";
import "../styles/RemoveHostel.css";
import Swal from "sweetalert2"; // Import SweetAlert

const RemoveHostel = () => {
  const [hostels, setHostels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const ownerId = localStorage.getItem("owner_id");

  useEffect(() => {
    if (!ownerId) return;

    const fetchHostels = async () => {
      try {
        const response = await fetch(`http://localhost:5000/owner-hostels/${ownerId}`);
        const data = await response.json();
        if (response.ok) {
          setHostels(data);
        } else {
          Swal.fire("Error", data.message, "error");
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching hostels:", error);
        setIsLoading(false);
      }
    };

    fetchHostels();
  }, [ownerId]);

  if (!ownerId) {
    return <div>Error: Owner ID not found. Please log in again.</div>;
  }

  const handleDelete = async (hostelId) => {
    if (!hostelId) {
      Swal.fire("Warning", "Hostel ID not found", "warning");
      return;
    }

    Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch("http://localhost:5000/remove-hostel", {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ hostel_id: hostelId }),
          });

          const data = await response.json();
          if (response.ok) {
            Swal.fire("Deleted!", "Hostel removed successfully!", "success");
            setHostels(hostels.filter((hostel) => hostel.hostel_id !== hostelId));
          } else {
            Swal.fire("Error", data.message, "error");
          }
        } catch (error) {
          console.error("Error:", error);
          Swal.fire("Error", "An error occurred. Please try again.", "error");
        }
      }
    });
  };

  return (
    <div className="remove-hostel-container">
      <OwnerHeader />
      <div className="hostel-list">
        <h2>Your Hostels</h2>
        {isLoading ? (
          <p>Loading hostels...</p>
        ) : hostels.length === 0 ? (
          <div className="no-hostels">
            <img src="/no-data.png" alt="No Hostels" className="no-data-img" />
            <h3>No hostels available</h3>
            <p>Start by adding your first hostel!</p>
            <a href="/add-hostel" className="add-hostel-btn">Add Hostel</a>
          </div>
        ) : (
          <div className="hostel-grid">
            {hostels.map((hostel) => (
              <div key={hostel.hostel_id} className="hostel-card">
                <img
                  src={hostel.image_path || "/placeholder.png"} // Render the base64 image or fallback
                  alt={hostel.name}
                  className="hostel-image"
                />
                <div className="hostel-info">
                  <h3>{hostel.name}</h3>
                  <p>Students Staying: {hostel.student_count}</p>
                  <button
                    className="remove-btn"
                    onClick={() => handleDelete(hostel.hostel_id)}
                  >
                    Remove Hostel
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RemoveHostel;
