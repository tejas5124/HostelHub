import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HostelLayout from '../../layouts/HostelLayout';
import Swal from "sweetalert2";
import '../../styles/AddHostel.css';
import DashboardHeader from '../admin/AdminHeader';
import api from '../../api/api';

const AddHostel = () => {
  const navigate = useNavigate();
  const [ownerId, setOwnerId] = useState(null);
  const [hostelData, setHostelData] = useState({
    owner_id: "",
    name: "",
    address: "",
    description: "",
    total_rooms: "",
    available_rooms: "",
    rent: "",
    facilities: [],
    hostel_gender: "",
    approval_status: "pending"
  });

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    const storedOwnerId = localStorage.getItem("owner_id");
    if (storedOwnerId) {
      setOwnerId(storedOwnerId);
      setHostelData(prev => ({ ...prev, owner_id: storedOwnerId }));
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
    const { name, value } = e.target;
    setHostelData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setHostelData(prev => ({
      ...prev,
      facilities: checked
        ? [...prev.facilities, value]
        : prev.facilities.filter(item => item !== value)
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenderChange = (e) => {
    setHostelData(prev => ({ ...prev, hostel_gender: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!hostelData.hostel_gender) {
      Swal.fire({ icon: "error", title: "Error", text: "Please select hostel type (Boys/Girls)" });
      return;
    }

    if (!image) {
      Swal.fire({ icon: "error", title: "Error", text: "Please select an image" });
      return;
    }

    Swal.fire({
      title: "Submitting...",
      text: "Please wait while we add your hostel.",
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const formData = new FormData();
      Object.entries(hostelData).forEach(([key, value]) => {
        formData.append(key, key === "facilities" ? JSON.stringify(value) : value);
      });
      formData.append("image", image);

      const response = await api.post("/add-hostel", formData);
      Swal.close();

      Swal.fire({
        icon: "success",
        title: "Hostel Added!",
        text: "Your hostel has been successfully added.",
      }).then(() => navigate("/owner-dashboard"));

    } catch (error) {
      console.error("Error submitting form:", error);
      Swal.close();
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Something went wrong! Please try again.",
      });
    }
  };

  return (
    <HostelLayout>
      <DashboardHeader role="owner" />
      <div className="form-card">
        <div className="form-header">
          <h2>Add New Hostel</h2>
          <p className="form-subtitle">Fill in the details to add your hostel</p>
        </div>
        
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                <i className="fas fa-building"></i> Hostel Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Enter hostel name"
                value={hostelData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="address" className="form-label">
                <i className="fas fa-map-marker-alt"></i> Address
              </label>
              <input
                type="text"
                id="address"
                name="address"
                placeholder="Enter hostel address"
                value={hostelData.address}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="description" className="form-label">
                <i className="fas fa-align-left"></i> Description
              </label>
              <textarea
                id="description"
                name="description"
                placeholder="Describe your hostel"
                value={hostelData.description}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="total_rooms" className="form-label">
                <i className="fas fa-door-open"></i> Total Rooms
              </label>
              <input
                type="number"
                id="total_rooms"
                name="total_rooms"
                placeholder="Enter total rooms"
                value={hostelData.total_rooms}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="available_rooms" className="form-label">
                <i className="fas fa-bed"></i> Available Rooms
              </label>
              <input
                type="number"
                id="available_rooms"
                name="available_rooms"
                placeholder="Enter available rooms"
                value={hostelData.available_rooms}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="rent" className="form-label">
                <i className="fas fa-rupee-sign"></i> Monthly Rent
              </label>
              <input
                type="number"
                id="rent"
                name="rent"
                placeholder="Enter monthly rent"
                value={hostelData.rent}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <i className="fas fa-venus-mars"></i> Hostel Type
              </label>
              <div className="gender-selection">
                <label className="gender-option">
                  <input
                    type="radio"
                    name="hostel_gender"
                    value="boys"
                    checked={hostelData.hostel_gender === "boys"}
                    onChange={handleGenderChange}
                    required
                  />
                  <span>Boys Hostel</span>
                </label>
                <label className="gender-option">
                  <input
                    type="radio"
                    name="hostel_gender"
                    value="girls"
                    checked={hostelData.hostel_gender === "girls"}
                    onChange={handleGenderChange}
                    required
                  />
                  <span>Girls Hostel</span>
                </label>
              </div>
            </div>
          </div>

          <div className="facilities-section">
            <label className="section-label">
              <i className="fas fa-concierge-bell"></i> Available Facilities
            </label>
            <p className="facilities-subtitle">Select the facilities available in your hostel</p>
            
            <div className="facilities-categories">
              <div className="facility-category">
                <h3 className="category-title">
                  <i className="fas fa-wifi"></i> Basic Amenities
                </h3>
                <div className="facilities-grid">
                  {[
                    { name: "WiFi", icon: "fas fa-wifi", description: "High-speed internet access" },
                    { name: "Hot Water", icon: "fas fa-hot-tub", description: "24/7 hot water supply" },
                    { name: "AC", icon: "fas fa-snowflake", description: "Air conditioning in rooms" },
                    { name: "Power Backup", icon: "fas fa-bolt", description: "Uninterrupted power supply" }
                  ].map(({ name, icon, description }) => (
                    <label key={name} className="facility-badge">
                      <input
                        type="checkbox"
                        value={name}
                        onChange={handleCheckboxChange}
                      />
                      <div className="facility-content">
                        <i className={icon}></i>
                        <span className="facility-name">{name}</span>
                        <span className="facility-description">{description}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="facility-category">
                <h3 className="category-title">
                  <i className="fas fa-utensils"></i> Food & Services
                </h3>
                <div className="facilities-grid">
                  {[
                    { name: "Mess", icon: "fas fa-utensils", description: "In-house mess facility" },
                    { name: "Laundry", icon: "fas fa-tshirt", description: "Laundry service available" },
                    { name: "Housekeeping", icon: "fas fa-broom", description: "Regular room cleaning" },
                    { name: "Cafeteria", icon: "fas fa-coffee", description: "On-site cafeteria" }
                  ].map(({ name, icon, description }) => (
                    <label key={name} className="facility-badge">
                      <input
                        type="checkbox"
                        value={name}
                        onChange={handleCheckboxChange}
                      />
                      <div className="facility-content">
                        <i className={icon}></i>
                        <span className="facility-name">{name}</span>
                        <span className="facility-description">{description}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="facility-category">
                <h3 className="category-title">
                  <i className="fas fa-dumbbell"></i> Recreation & Security
                </h3>
                <div className="facilities-grid">
                  {[
                    { name: "Gym", icon: "fas fa-dumbbell", description: "Fitness center access" },
                    { name: "Parking", icon: "fas fa-parking", description: "Secure parking space" },
                    { name: "Security", icon: "fas fa-shield-alt", description: "24/7 security" },
                    { name: "Common Room", icon: "fas fa-tv", description: "Recreation area" }
                  ].map(({ name, icon, description }) => (
                    <label key={name} className="facility-badge">
                      <input
                        type="checkbox"
                        value={name}
                        onChange={handleCheckboxChange}
                      />
                      <div className="facility-content">
                        <i className={icon}></i>
                        <span className="facility-name">{name}</span>
                        <span className="facility-description">{description}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="image-upload-section">
            <label className="section-label">
              <i className="fas fa-image"></i> Hostel Image
            </label>
            <div className="image-upload-container">
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={handleImageChange}
                required
                className="image-input"
              />
              <label htmlFor="image" className="image-upload-label">
                <i className="fas fa-cloud-upload-alt"></i>
                <span>Choose an image</span>
              </label>
              {imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview} alt="Preview" />
                </div>
              )}
            </div>
          </div>

          <button type="submit" className="submit-button">
            <i className="fas fa-plus-circle"></i>
            Add Hostel
          </button>
        </form>
      </div>
    </HostelLayout>
  );
};

export default AddHostel;











// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import HostelLayout from '../../layouts/HostelLayout';
// import Swal from "sweetalert2";
// import '../../styles/AddHostel.css';
// import DashboardHeader from '../admin/AdminHeader';

// const AddHostel = () => {
//   const navigate = useNavigate();
//   const [ownerId, setOwnerId] = useState(null);
//   const [hostelData, setHostelData] = useState({
//     owner_id: "",
//     name: "",
//     address: "",
//     description: "",
//     total_rooms: "",
//     available_rooms: "",
//     rent: "",
//     facilities: [],
//     hostel_gender: "",
//     approval_status: "pending"
//   });

//   const [image, setImage] = useState(null);
//   const [imagePreview, setImagePreview] = useState(null);

//   useEffect(() => {
//     const storedOwnerId = localStorage.getItem("owner_id");
//     if (storedOwnerId) {
//       setOwnerId(storedOwnerId);
//       setHostelData(prev => ({ ...prev, owner_id: storedOwnerId }));
//     } else {
//       Swal.fire({
//         icon: "error",
//         title: "Unauthorized",
//         text: "Please log in first!",
//       }).then(() => {
//         navigate("/owner-login"); 
//       });
//     }
//   }, [navigate]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setHostelData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const handleCheckboxChange = (e) => {
//     const { value, checked } = e.target;
//     setHostelData(prev => ({
//       ...prev,
//       facilities: checked
//         ? [...prev.facilities, value]
//         : prev.facilities.filter(item => item !== value)
//     }));
//   };

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setImage(file);
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setImagePreview(reader.result);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const handleGenderChange = (e) => {
//     const genderValue = e.target.value;
//     setHostelData(prev => ({
//       ...prev,
//       hostel_gender: genderValue
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     // Validate required fields
//     if (!hostelData.hostel_gender) {
//       Swal.fire({
//         icon: "error",
//         title: "Error",
//         text: "Please select hostel type (Boys/Girls)",
//       });
//       return;
//     }

//     if (!image) {
//       Swal.fire({
//         icon: "error",
//         title: "Error",
//         text: "Please select an image",
//       });
//       return;
//     }

//     Swal.fire({
//       title: "Submitting...",
//       text: "Please wait while we add your hostel.",
//       allowOutsideClick: false,
//       showConfirmButton: false,
//       didOpen: () => {
//         Swal.showLoading();
//       },
//     });

//     try {
//       const formData = new FormData();
      
//       // Add all fields exactly as they appear in the database
//       formData.append("owner_id", hostelData.owner_id);
//       formData.append("name", hostelData.name);
//       formData.append("address", hostelData.address);
//       formData.append("description", hostelData.description);
//       formData.append("total_rooms", hostelData.total_rooms);
//       formData.append("available_rooms", hostelData.available_rooms);
//       formData.append("rent", hostelData.rent);
//       formData.append("facilities", JSON.stringify(hostelData.facilities));
//       formData.append("hostel_gender", hostelData.hostel_gender);
//       formData.append("approval_status", "pending");
//       formData.append("image", image);

//       const response = await fetch("http://localhost:5000/add-hostel", {
//         method: "POST",
//         body: formData,
//       });

//       const data = await response.json();
//       Swal.close();

//       if (response.ok) {
//         Swal.fire({
//           icon: "success",
//           title: "Hostel Added!",
//           text: "Your hostel has been successfully added.",
//         }).then(() => {
//           navigate("/owner-dashboard");
//         });
//       } else {
//         Swal.fire({
//           icon: "error",
//           title: "Error",
//           text: data.message || "Failed to add hostel.",
//         });
//       }
//     } catch (error) {
//       console.error("Error submitting form:", error);
//       Swal.fire({
//         icon: "error",
//         title: "Error",
//         text: "Something went wrong! Please try again.",
//       });
//     }
//   };

//   return (
//     <HostelLayout>
//       <DashboardHeader role="owner" />
//       <div className="form-card">
//         <div className="form-header">
//           <h2>Add New Hostel</h2>
//           <p className="form-subtitle">Fill in the details to add your hostel</p>
//         </div>
        
//         <form onSubmit={handleSubmit} encType="multipart/form-data">
//           <div className="form-grid">
//             <div className="form-group">
//               <label htmlFor="name" className="form-label">
//                 <i className="fas fa-building"></i> Hostel Name
//               </label>
//               <input
//                 type="text"
//                 id="name"
//                 name="name"
//                 placeholder="Enter hostel name"
//                 value={hostelData.name}
//                 onChange={handleChange}
//                 required
//               />
//             </div>

//             <div className="form-group">
//               <label htmlFor="address" className="form-label">
//                 <i className="fas fa-map-marker-alt"></i> Address
//               </label>
//               <input
//                 type="text"
//                 id="address"
//                 name="address"
//                 placeholder="Enter hostel address"
//                 value={hostelData.address}
//                 onChange={handleChange}
//                 required
//               />
//             </div>

//             <div className="form-group full-width">
//               <label htmlFor="description" className="form-label">
//                 <i className="fas fa-align-left"></i> Description
//               </label>
//               <textarea
//                 id="description"
//                 name="description"
//                 placeholder="Describe your hostel"
//                 value={hostelData.description}
//                 onChange={handleChange}
//                 required
//               />
//             </div>

//             <div className="form-group">
//               <label htmlFor="total_rooms" className="form-label">
//                 <i className="fas fa-door-open"></i> Total Rooms
//               </label>
//               <input
//                 type="number"
//                 id="total_rooms"
//                 name="total_rooms"
//                 placeholder="Enter total rooms"
//                 value={hostelData.total_rooms}
//                 onChange={handleChange}
//                 required
//               />
//             </div>

//             <div className="form-group">
//               <label htmlFor="available_rooms" className="form-label">
//                 <i className="fas fa-bed"></i> Available Rooms
//               </label>
//               <input
//                 type="number"
//                 id="available_rooms"
//                 name="available_rooms"
//                 placeholder="Enter available rooms"
//                 value={hostelData.available_rooms}
//                 onChange={handleChange}
//                 required
//               />
//             </div>

//             <div className="form-group">
//               <label htmlFor="rent" className="form-label">
//                 <i className="fas fa-rupee-sign"></i> Monthly Rent
//               </label>
//               <input
//                 type="number"
//                 id="rent"
//                 name="rent"
//                 placeholder="Enter monthly rent"
//                 value={hostelData.rent}
//                 onChange={handleChange}
//                 required
//               />
//             </div>

//             <div className="form-group">
//               <label className="form-label">
//                 <i className="fas fa-venus-mars"></i> Hostel Type
//               </label>
//               <div className="gender-selection">
//                 <label className="gender-option">
//                   <input
//                     type="radio"
//                     name="hostel_gender"
//                     value="boys"
//                     checked={hostelData.hostel_gender === "boys"}
//                     onChange={handleGenderChange}
//                     required
//                   />
//                   <span>Boys Hostel</span>
//                 </label>
//                 <label className="gender-option">
//                   <input
//                     type="radio"
//                     name="hostel_gender"
//                     value="girls"
//                     checked={hostelData.hostel_gender === "girls"}
//                     onChange={handleGenderChange}
//                     required
//                   />
//                   <span>Girls Hostel</span>
//                 </label>
//               </div>
//             </div>
//           </div>

//           <div className="facilities-section">
//             <label className="section-label">
//               <i className="fas fa-concierge-bell"></i> Available Facilities
//             </label>
//             <p className="facilities-subtitle">Select the facilities available in your hostel</p>
            
//             <div className="facilities-categories">
//               <div className="facility-category">
//                 <h3 className="category-title">
//                   <i className="fas fa-wifi"></i> Basic Amenities
//                 </h3>
//                 <div className="facilities-grid">
//                   {[
//                     { name: "WiFi", icon: "fas fa-wifi", description: "High-speed internet access" },
//                     { name: "Hot Water", icon: "fas fa-hot-tub", description: "24/7 hot water supply" },
//                     { name: "AC", icon: "fas fa-snowflake", description: "Air conditioning in rooms" },
//                     { name: "Power Backup", icon: "fas fa-bolt", description: "Uninterrupted power supply" }
//                   ].map(({ name, icon, description }) => (
//                     <label key={name} className="facility-badge">
//                       <input
//                         type="checkbox"
//                         value={name}
//                         onChange={handleCheckboxChange}
//                       />
//                       <div className="facility-content">
//                         <i className={icon}></i>
//                         <span className="facility-name">{name}</span>
//                         <span className="facility-description">{description}</span>
//                       </div>
//                     </label>
//                   ))}
//                 </div>
//               </div>

//               <div className="facility-category">
//                 <h3 className="category-title">
//                   <i className="fas fa-utensils"></i> Food & Services
//                 </h3>
//                 <div className="facilities-grid">
//                   {[
//                     { name: "Mess", icon: "fas fa-utensils", description: "In-house mess facility" },
//                     { name: "Laundry", icon: "fas fa-tshirt", description: "Laundry service available" },
//                     { name: "Housekeeping", icon: "fas fa-broom", description: "Regular room cleaning" },
//                     { name: "Cafeteria", icon: "fas fa-coffee", description: "On-site cafeteria" }
//                   ].map(({ name, icon, description }) => (
//                     <label key={name} className="facility-badge">
//                       <input
//                         type="checkbox"
//                         value={name}
//                         onChange={handleCheckboxChange}
//                       />
//                       <div className="facility-content">
//                         <i className={icon}></i>
//                         <span className="facility-name">{name}</span>
//                         <span className="facility-description">{description}</span>
//                       </div>
//                     </label>
//                   ))}
//                 </div>
//               </div>

//               <div className="facility-category">
//                 <h3 className="category-title">
//                   <i className="fas fa-dumbbell"></i> Recreation & Security
//                 </h3>
//                 <div className="facilities-grid">
//                   {[
//                     { name: "Gym", icon: "fas fa-dumbbell", description: "Fitness center access" },
//                     { name: "Parking", icon: "fas fa-parking", description: "Secure parking space" },
//                     { name: "Security", icon: "fas fa-shield-alt", description: "24/7 security" },
//                     { name: "Common Room", icon: "fas fa-tv", description: "Recreation area" }
//                   ].map(({ name, icon, description }) => (
//                     <label key={name} className="facility-badge">
//                       <input
//                         type="checkbox"
//                         value={name}
//                         onChange={handleCheckboxChange}
//                       />
//                       <div className="facility-content">
//                         <i className={icon}></i>
//                         <span className="facility-name">{name}</span>
//                         <span className="facility-description">{description}</span>
//                       </div>
//                     </label>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="image-upload-section">
//             <label className="section-label">
//               <i className="fas fa-image"></i> Hostel Image
//             </label>
//             <div className="image-upload-container">
//               <input
//                 type="file"
//                 id="image"
//                 accept="image/*"
//                 onChange={handleImageChange}
//                 required
//                 className="image-input"
//               />
//               <label htmlFor="image" className="image-upload-label">
//                 <i className="fas fa-cloud-upload-alt"></i>
//                 <span>Choose an image</span>
//               </label>
//               {imagePreview && (
//                 <div className="image-preview">
//                   <img src={imagePreview} alt="Preview" />
//                 </div>
//               )}
//             </div>
//           </div>

//           <button type="submit" className="submit-button">
//             <i className="fas fa-plus-circle"></i>
//             Add Hostel
//           </button>
//         </form>
//       </div>
//     </HostelLayout>
//   );
// };

// export default AddHostel;
