import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import HostelLayout from '../../layouts/HostelLayout';
import '../../styles/ViewHostels.css';
import DashboardHeader from '../admin/AdminHeader';
import api from '../../api'; // centralized axios

const ViewHostels = () => {
  const [hostels, setHostels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedHostel, setSelectedHostel] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [searchFilters, setSearchFilters] = useState({
    name: '',
    address: '',
    gender: '',
    rent: '',
    status: ''
  });

  const ownerId = localStorage.getItem('owner_id');

  useEffect(() => {
    if (!ownerId) {
      setError("Owner ID not found. Please log in again.");
      setIsLoading(false);
      return;
    }

    const fetchHostels = async () => {
      try {
        const response = await api.get(`/owner-hostels/${ownerId}`);
        const data = response.data.map(h => ({
          ...h,
          facilities: Array.isArray(h.facilities)
            ? h.facilities
            : h.facilities
            ? JSON.parse(h.facilities)
            : []
        }));
        setHostels(data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch hostels. Please try again.");
        Swal.fire("Error", "Failed to fetch hostels. Please try again.", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHostels();
  }, [ownerId]);

  // Enhanced image handling with fallback
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    // Handle different path formats
    const cleanPath = imagePath.replace(/^\/+/, '');
    return `${process.env.REACT_APP_API_URL}/${cleanPath}`;
  };

  const handleImageError = (e, fallbackSrc = '/api/placeholder/300/200') => {
    if (e.target.src !== fallbackSrc) {
      e.target.src = fallbackSrc;
    } else {
      // If even fallback fails, use a data URL placeholder
      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMjUgNzVIMTc1VjEyNUgxMjVWNzVaIiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0ibm9uZSIvPgo8Y2lyY2xlIGN4PSIxNDAiIGN5PSI5MCIgcj0iNSIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNMTMwIDExMEwxNDAgMTAwTDE1NSAxMTVMMTcwIDEwMCIgc3Ryb2tlPSIjOUNBM0FGIiBzdHJva2Utd2lkdGg9IjIiIGZpbGw9Im5vbmUiLz4KPHRleHQgeD0iMTUwIiB5PSIxNTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5Q0EzQUYiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCI+Tm8gSW1hZ2U8L3RleHQ+Cjwvc3ZnPgo=';
    }
  };

  const handleViewImage = (imagePath) => {
    if (!imagePath) {
      Swal.fire({
        title: "No Image Available",
        text: "This hostel doesn't have an image uploaded yet.",
        icon: "info",
        confirmButtonColor: '#3b82f6'
      });
      return;
    }
    
    const imageUrl = getImageUrl(imagePath);
    Swal.fire({
      imageUrl,
      imageAlt: 'Hostel Image',
      width: '80%',
      confirmButtonText: 'Close',
      confirmButtonColor: '#3b82f6',
      background: '#fff',
      backdrop: 'rgba(0,0,0,0.8)'
    });
  };

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setSearchFilters({
      name: '',
      address: '',
      gender: '',
      rent: '',
      status: ''
    });
  };

  const filteredHostels = hostels.filter(hostel => {
    const matchesName = hostel.name?.toLowerCase().includes(searchFilters.name.toLowerCase());
    const matchesAddress = hostel.address?.toLowerCase().includes(searchFilters.address.toLowerCase());
    const matchesGender = !searchFilters.gender || hostel.hostel_gender === searchFilters.gender;
    const matchesRent = !searchFilters.rent || hostel.rent <= parseInt(searchFilters.rent);
    const matchesStatus = !searchFilters.status || hostel.approval_status === searchFilters.status;

    return matchesName && matchesAddress && matchesGender && matchesRent && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'rejected': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const handleBack = () => setSelectedHostel(null);

  if (error) {
    return (
      <HostelLayout>
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h2>Something went wrong</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-button">
            Try Again
          </button>
        </div>
      </HostelLayout>
    );
  }

  return (
    <HostelLayout>
      <DashboardHeader role="owner" />
      <div className="view-hostels-container">
        <div className="page-header">
          <div className="header-content">
            <div className="header-text">
              <h1 className="page-title">
                <span className="title-icon">🏢</span>
                Your Hostels
              </h1>
              <p className="page-subtitle">Manage and monitor your hostel listings</p>
            </div>
            <div className="header-stats">
              <div className="stat-card">
                <span className="stat-value">{hostels.length}</span>
                <span className="stat-label">Total Hostels</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{hostels.filter(h => h.approval_status === 'approved').length}</span>
                <span className="stat-label">Approved</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{hostels.filter(h => h.approval_status === 'pending').length}</span>
                <span className="stat-label">Pending</span>
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading your hostels...</p>
          </div>
        ) : hostels.length === 0 ? (
          <div className="no-hostels">
            <div className="no-data-illustration">
              <div className="building-icon">🏗️</div>
            </div>
            <h3>No hostels yet</h3>
            <p>Start your journey by adding your first hostel listing</p>
            <a href="/add-hostel" className="add-hostel-btn">
              <span className="button-icon">➕</span>
              Add Your First Hostel
            </a>
          </div>
        ) : (
          !selectedHostel ? (
            <>
              {/* Enhanced Search and Controls */}
              <div className="controls-container">
                <div className="search-section">
                  <div className="search-filters">
                    <div className="filter-group">
                      <input 
                        name="name" 
                        type="text" 
                        placeholder="🔍 Search by name..." 
                        value={searchFilters.name} 
                        onChange={handleSearchChange} 
                        className="search-input" 
                      />
                      <input 
                        name="address" 
                        type="text" 
                        placeholder="📍 Search by location..." 
                        value={searchFilters.address} 
                        onChange={handleSearchChange} 
                        className="search-input" 
                      />
                    </div>
                    <div className="filter-group">
                      <select name="gender" value={searchFilters.gender} onChange={handleSearchChange} className="search-select">
                        <option value="">All Genders</option>
                        <option value="boys">Boys Only</option>
                        <option value="girls">Girls Only</option>
                      </select>
                      <input 
                        name="rent" 
                        type="number" 
                        placeholder="💰 Max Rent" 
                        value={searchFilters.rent} 
                        onChange={handleSearchChange} 
                        className="search-input" 
                      />
                      <select name="status" value={searchFilters.status} onChange={handleSearchChange} className="search-select">
                        <option value="">All Status</option>
                        <option value="approved">✅ Approved</option>
                        <option value="pending">⏳ Pending</option>
                        <option value="rejected">❌ Rejected</option>
                      </select>
                    </div>
                  </div>
                  {Object.values(searchFilters).some(val => val) && (
                    <button onClick={clearFilters} className="clear-filters-btn">
                      Clear Filters
                    </button>
                  )}
                </div>

                <div className="view-controls">
                  <div className="view-toggle">
                    <button 
                      className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                      onClick={() => setViewMode('grid')}
                    >
                      <span className="toggle-icon">⊞</span> Grid
                    </button>
                    <button 
                      className={`toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
                      onClick={() => setViewMode('table')}
                    >
                      <span className="toggle-icon">☰</span> Table
                    </button>
                  </div>
                  <div className="results-count">
                    {filteredHostels.length} hostel{filteredHostels.length !== 1 ? 's' : ''} found
                  </div>
                </div>
              </div>

              {/* Grid/Table View */}
              {viewMode === 'grid' ? (
                <div className="hostels-grid">
                  {filteredHostels.map((hostel) => (
                    <div key={hostel.hostel_id} className="hostel-card">
                      <div className="card-image-container">
                        <img
                          src={getImageUrl(hostel.image_path) || '/api/placeholder/300/200'}
                          alt={hostel.name}
                          className="card-image"
                          onError={(e) => handleImageError(e)}
                        />
                        <div className="card-overlay">
                          <button 
                            onClick={() => handleViewImage(hostel.image_path)}
                            className="view-image-btn"
                          >
                            👁️ View Image
                          </button>
                        </div>
                        <div className="status-overlay">
                          <span 
                            className="status-badge"
                            style={{ backgroundColor: getStatusColor(hostel.approval_status) }}
                          >
                            {hostel.approval_status}
                          </span>
                        </div>
                      </div>
                      
                      <div className="card-content">
                        <h3 className="card-title">{hostel.name}</h3>
                        <p className="card-address">📍 {hostel.address}</p>
                        
                        <div className="card-details">
                          <div className="detail-item">
                            <span className="detail-icon">👥</span>
                            <span>{hostel.hostel_gender === 'boys' ? 'Boys' : 'Girls'}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-icon">💰</span>
                            <span>₹{hostel.rent}/month</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-icon">🛏️</span>
                            <span>{hostel.available_rooms}/{hostel.total_rooms} available</span>
                          </div>
                        </div>
                        
                        <button 
                          onClick={() => setSelectedHostel(hostel)}
                          className="view-details-btn"
                        >
                          View Details →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="table-container">
                  <table className="modern-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Image</th>
                        <th>Name</th>
                        <th>Location</th>
                        <th>Gender</th>
                        <th>Rent</th>
                        <th>Rooms</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredHostels.map((hostel, index) => (
                        <tr key={hostel.hostel_id}>
                          <td>{index + 1}</td>
                          <td>
                            <img
                              src={getImageUrl(hostel.image_path) || '/api/placeholder/60/40'}
                              alt={hostel.name}
                              className="table-image"
                              onError={(e) => handleImageError(e, '/api/placeholder/60/40')}
                            />
                          </td>
                          <td className="name-cell">{hostel.name}</td>
                          <td className="address-cell">{hostel.address}</td>
                          <td>
                            <span className={`gender-badge ${hostel.hostel_gender}`}>
                              {hostel.hostel_gender === 'boys' ? '👦 Boys' : '👧 Girls'}
                            </span>
                          </td>
                          <td className="rent-cell">₹{hostel.rent}</td>
                          <td className="rooms-cell">
                            <span className="rooms-info">
                              {hostel.available_rooms}/{hostel.total_rooms}
                            </span>
                          </td>
                          <td>
                            <span 
                              className="status-badge"
                              style={{ backgroundColor: getStatusColor(hostel.approval_status) }}
                            >
                              {hostel.approval_status}
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button 
                                onClick={() => setSelectedHostel(hostel)}
                                className="action-btn view-btn"
                                title="View Details"
                              >
                                👁️
                              </button>
                              <button 
                                onClick={() => handleViewImage(hostel.image_path)}
                                className="action-btn image-btn"
                                title="View Image"
                              >
                                🖼️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : (
            <div className="hostel-detail-view">
              <div className="detail-header">
                <button className="back-btn" onClick={handleBack}>
                  ← Back to List
                </button>
                <div className="detail-actions">
                  <button className="edit-btn">✏️ Edit</button>
                  <button className="share-btn">📤 Share</button>
                </div>
              </div>
              
              <div className="hostel-detail-card">
                <div className="detail-image-section">
                  <img
                    src={getImageUrl(selectedHostel.image_path) || '/api/placeholder/500/300'}
                    alt={selectedHostel.name}
                    className="detail-image"
                    onError={(e) => handleImageError(e, '/api/placeholder/500/300')}
                  />
                  <div className="detail-status-overlay">
                    <span 
                      className="detail-status-badge"
                      style={{ backgroundColor: getStatusColor(selectedHostel.approval_status) }}
                    >
                      {selectedHostel.approval_status}
                    </span>
                  </div>
                </div>
                
                <div className="detail-content">
                  <div className="detail-main">
                    <h1 className="detail-title">{selectedHostel.name}</h1>
                    
                    <div className="detail-grid">
                      <div className="detail-item">
                        <span className="detail-label">👥 Gender</span>
                        <span className="detail-value">
                          {selectedHostel.hostel_gender === 'boys' ? 'Boys Hostel' : 'Girls Hostel'}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">📍 Location</span>
                        <span className="detail-value">{selectedHostel.address}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">💰 Monthly Rent</span>
                        <span className="detail-value">₹{selectedHostel.rent}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">🛏️ Room Status</span>
                        <span className="detail-value">
                          {selectedHostel.available_rooms} available out of {selectedHostel.total_rooms}
                        </span>
                      </div>
                    </div>

                    {selectedHostel.description && (
                      <div className="detail-section">
                        <h3 className="section-title">📝 Description</h3>
                        <p className="description-text">{selectedHostel.description}</p>
                      </div>
                    )}

                    {selectedHostel.facilities.length > 0 && (
                      <div className="detail-section">
                        <h3 className="section-title">🏠 Facilities</h3>
                        <div className="facilities-grid">
                          {selectedHostel.facilities.map((facility, idx) => (
                            <span key={idx} className="facility-tag">
                              {facility}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </HostelLayout>
  );
};

export default ViewHostels;







// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import Swal from 'sweetalert2';
// import HostelLayout from '../../layouts/HostelLayout';
// import '../../styles/ViewHostels.css';
// import DashboardHeader from '../admin/AdminHeader';

// const ViewHostels = () => {
//   const [hostels, setHostels] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [selectedHostel, setSelectedHostel] = useState(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [searchFilters, setSearchFilters] = useState({
//     name: '',
//     address: '',
//     gender: '',
//     rent: '',
//     status: ''
//   });
//   const ownerId = localStorage.getItem('owner_id');

//   useEffect(() => {
//     if (!ownerId) {
//       setError("Owner ID not found. Please log in again.");
//       setIsLoading(false);
//       return;
//     }

//     const fetchHostels = async () => {
//       try {
//         const response = await fetch(`http://localhost:5000/owner-hostels/${ownerId}`);
//         const data = await response.json();
//         if (response.ok) {
//           setHostels(data);
//         } else {
//           setError(data.message || "Failed to fetch hostels");
//           Swal.fire("Error", data.message, "error");
//         }
//       } catch (error) {
//         setError("Failed to fetch hostels. Please try again.");
//         Swal.fire("Error", "Failed to fetch hostels. Please try again.", "error");
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchHostels();
//   }, [ownerId]);

//   const handleViewImage = (imagePath) => {
//     if (!imagePath) {
//       Swal.fire("No Image Available", "This hostel doesn't have an image uploaded yet.", "info");
//       return;
//     }
//     const imageUrl = `http://localhost:5000/${imagePath.replace(/^\/+/, '')}`;
//     Swal.fire({
//       imageUrl,
//       imageAlt: 'Hostel Image',
//       width: '80%',
//       confirmButtonText: 'Close',
//     });
//   };

//   const handleViewDetails = (hostel) => setSelectedHostel(hostel);
//   const handleBack = () => setSelectedHostel(null);

//   const handleSearchChange = (e) => {
//     const { name, value } = e.target;
//     setSearchFilters(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const filteredHostels = hostels.filter(hostel => {
//     const matchesName = hostel.name.toLowerCase().includes(searchFilters.name.toLowerCase());
//     const matchesAddress = hostel.address.toLowerCase().includes(searchFilters.address.toLowerCase());
//     const matchesGender = !searchFilters.gender || hostel.hostel_gender === searchFilters.gender;
//     const matchesRent = !searchFilters.rent || hostel.rent <= parseInt(searchFilters.rent);
//     const matchesStatus = !searchFilters.status || hostel.approval_status === searchFilters.status;

//     return matchesName && matchesAddress && matchesGender && matchesRent && matchesStatus;
//   });

//   if (error) {
//     return (
//       <HostelLayout>
//         <div className="error-container">
//           <h2>⚠️ Error</h2>
//           <p>{error}</p>
//           <button onClick={() => window.location.reload()} className="retry-button">Retry</button>
//         </div>
//       </HostelLayout>
//     );
//   }

//   return (
//     <HostelLayout>
//       <DashboardHeader role="owner" />
//       <div className="view-hostels-container">
//         <div className="page-header">
//           <h1>🏢</h1>
//           <h2 className="page-title">Your Hostels</h2>
//           <p className="page-subtitle">View and manage your hostel listings</p>
//         </div>

//         {isLoading ? (
//           <div className="loading-container">
//             <div className="loading-spinner"></div>
//             <p>Loading your hostels...</p>
//           </div>
//         ) : hostels.length === 0 ? (
//           <div className="no-hostels">
//             <img src="/no-data.png" alt="No Hostels" className="no-data-img" />
//             <h3>No hostels available</h3>
//             <p>Start by adding your first hostel!</p>
//             <a href="/add-hostel" className="add-hostel-btn">
//               <span className="button-icon">➕</span>Add Hostel
//             </a>
//           </div>
//         ) : (
//           !selectedHostel ? (
//             <>
//               <div className="search-container">
//                 <div className="search-filters">
//                   <input
//                     type="text"
//                     name="name"
//                     placeholder="🔍 Search by name..."
//                     value={searchFilters.name}
//                     onChange={handleSearchChange}
//                     className="search-input"
//                   />
//                   <input
//                     type="text"
//                     name="address"
//                     placeholder="📍 Search by address..."
//                     value={searchFilters.address}
//                     onChange={handleSearchChange}
//                     className="search-input"
//                   />
//                   <select
//                     name="gender"
//                     value={searchFilters.gender}
//                     onChange={handleSearchChange}
//                     className="search-select"
//                   >
//                     <option value="">All Genders</option>
//                     <option value="boys">Boys</option>
//                     <option value="girls">Girls</option>
//                   </select>
//                   <input
//                     type="number"
//                     name="rent"
//                     placeholder="💰 Max Rent"
//                     value={searchFilters.rent}
//                     onChange={handleSearchChange}
//                     className="search-input"
//                   />
//                   <select
//                     name="status"
//                     value={searchFilters.status}
//                     onChange={handleSearchChange}
//                     className="search-select"
//                   >
//                     <option value="">All Status</option>
//                     <option value="approved">Approved</option>
//                     <option value="pending">Pending</option>
//                     <option value="rejected">Rejected</option>
//                   </select>
//                 </div>
//               </div>

//               <div className="hostel-table-container">
//                 <table className="hostel-table">
//                   <thead>
//                     <tr>
//                       <th>#</th>
//                       <th>Name</th>
//                       <th>Address</th>
//                       <th>Gender</th>
//                       <th>Rent</th>
//                       <th>Total Rooms</th>
//                       <th>Available Rooms</th>
//                       <th>Status</th>
//                       <th>Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {filteredHostels.map((hostel, index) => (
//                       <tr key={hostel.hostel_id}>
//                         <td>{index + 1}</td>
//                         <td>{hostel.name}</td>
//                         <td>{hostel.address}</td>
//                         <td>{hostel.hostel_gender === 'boys' ? 'Boys' : 'Girls'}</td>
//                         <td>₹{hostel.rent || 'N/A'}</td>
//                         <td>{hostel.total_rooms || 'N/A'}</td>
//                         <td>{hostel.available_rooms || 'N/A'}</td>
//                         <td>
//                           <span className={`status-badge ${hostel.approval_status}`}>
//                             {hostel.approval_status}
//                           </span>
//                         </td>
//                         <td>
//                           <button onClick={() => handleViewDetails(hostel)}>View</button>
//                           <button onClick={() => handleViewImage(hostel.image_path)}>Image</button>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </>
//           ) : (
//             <div className="hostel-detail-view">
//               <button className="back-btn" onClick={handleBack}>← Back to List</button>
//               <div className="hostel-detail-card">
//                 <div className="hostel-detail-image-container">
//                   <img
//                     src={selectedHostel.image_path ? `http://localhost:5000/${selectedHostel.image_path.replace(/^\/+/, '')}` : "/placeholder.png"}
//                     alt={selectedHostel.name}
//                     className="hostel-detail-image"
//                     onError={(e) => (e.target.src = "/placeholder.png")}
//                   />
//                   <div className="hostel-detail-status">
//                     <span className={`approval-status-badge ${selectedHostel.approval_status}`}>
//                       {selectedHostel.approval_status}
//                     </span>
//                   </div>
//                 </div>
//                 <div className="hostel-detail-info">
//                   <h2>{selectedHostel.name}</h2>
//                   <p><strong>👥 Gender:</strong> {selectedHostel.hostel_gender === 'boys' ? 'Boys Hostel' : 'Girls Hostel'}</p>
//                   <p><strong>📍 Address:</strong> {selectedHostel.address}</p>
//                   <p><strong>💰 Rent:</strong> ₹{selectedHostel.rent || 'N/A'}</p>
//                   <p><strong>🛏️ Rooms:</strong> {selectedHostel.total_rooms} Total / {selectedHostel.available_rooms} Available</p>
//                   {selectedHostel.description && (
//                     <div className="hostel-description">
//                       <h3>Description</h3>
//                       <p>{selectedHostel.description}</p>
//                     </div>
//                   )}
//                   {selectedHostel.facilities?.length > 0 && (
//                     <div className="hostel-facilities">
//                       <h3>Facilities</h3>
//                       <div className="facilities-grid">
//                         {selectedHostel.facilities.map((f, idx) => (
//                           <span key={idx} className="facility-badge">{f}</span>
//                         ))}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           )
//         )}
//       </div>
//     </HostelLayout>
//   );
// };

// export default ViewHostels;

