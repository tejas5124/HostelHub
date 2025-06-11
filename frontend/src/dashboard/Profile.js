import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import '../styles/student-dashboard.css';
import '../styles/Profile.css';
import OwnerHeader from './OwnerHeader';

const Profile = () => {
    const [userDetails, setUserDetails] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedPhone, setEditedPhone] = useState('');
    const [userType, setUserType] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const checkSession = async () => {
            try {
                // Check owner session first
                const ownerResponse = await fetch("/owner-session", {
                    method: "GET",
                    credentials: "include",
                });
                
                if (ownerResponse.ok) {
                    setIsLoggedIn(true);
                    setUserType('owner');
                    fetchOwnerDetails();
                    return;
                }

                // If not owner, check student session
                const studentResponse = await fetch("/student-session", {
                    method: "GET",
                    credentials: "include",
                });

                if (studentResponse.ok) {
                    setIsLoggedIn(true);
                    setUserType('student');
                    fetchStudentDetails();
                } else {
                    setIsLoggedIn(false);
                    Swal.fire({
                        icon: 'warning',
                        title: 'Session Expired',
                        text: 'Please log in again to continue.',
                    }).then(() => {
                        navigate(userType === 'owner' ? '/owner-login' : '/student-login');
                    });
                }
            } catch (error) {
                console.error("Error checking session:", error);
                setIsLoggedIn(false);
            }
        };

        checkSession();
    }, [navigate, userType]);

    const fetchOwnerDetails = async () => {
        const ownerId = localStorage.getItem('owner_id');
        if (!ownerId) return;

        try {
            const response = await fetch(`http://localhost:5000/owner-details/${ownerId}`);
            if (response.ok) {
                const data = await response.json();
                setUserDetails(data);
                setEditedPhone(data.phone_number || '');
            } else {
                console.error('Failed to fetch owner details');
            }
        } catch (error) {
            console.error('Error fetching owner details:', error);
        }
    };

    const fetchStudentDetails = async () => {
        const studentId = localStorage.getItem('student_id');
        if (!studentId) return;

        try {
            const response = await fetch(`http://localhost:5000/student-details/${studentId}`);
            if (response.ok) {
                const data = await response.json();
                setUserDetails(data);
                setEditedPhone(data.phone_number || '');
            } else {
                console.error('Failed to fetch student details');
            }
        } catch (error) {
            console.error('Error fetching student details:', error);
        }
    };

    const handleLogout = async () => {
        try {
            const endpoint = userType === 'owner' ? "/owner-logout" : "/student-logout";
            await fetch(endpoint, {
                method: "POST",
                credentials: "include",
            });
            
            if (userType === 'owner') {
                localStorage.removeItem('owner_id');
                navigate('/owner-login');
            } else {
                localStorage.removeItem('student_id');
                navigate('/student-login');
            }
        } catch (error) {
            console.error("Error logging out:", error);
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditedPhone(userDetails?.phone_number || '');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const userId = userType === 'owner' ? localStorage.getItem('owner_id') : localStorage.getItem('student_id');
        const endpoint = userType === 'owner' ? 'update-owner' : 'update-student';
        
        try {
            const response = await fetch(`http://localhost:5000/${endpoint}/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...userDetails,
                    phone_number: editedPhone
                })
            });

            if (response.ok) {
                const updatedData = await response.json();
                setUserDetails(updatedData);
                setIsEditing(false);
                Swal.fire({
                    icon: 'success',
                    title: 'Phone Number Updated',
                    text: 'Your phone number has been updated successfully!',
                });
            } else {
                throw new Error('Failed to update phone number');
            }
        } catch (error) {
            console.error('Error updating phone number:', error);
            Swal.fire({
                icon: 'error',
                title: 'Update Failed',
                text: 'Failed to update phone number. Please try again.',
            });
        }
    };

    if (!isLoggedIn) {
        return (
            <div className="login-message">
                <div className="loading-spinner"></div>
                <p>Please log in to access your profile.</p>
            </div>
        );
    }

    return (
        <div className="dashboard">
            {userType === 'owner' ? (
                <OwnerHeader />
            ) : (
                <header className="dashboard-header">
                    <div className="logo" onClick={() => navigate('/student-dashboard')} style={{ cursor: 'pointer' }}>
                        <img src="/image.png" alt="HostelHub Logo" className="logo-img" />
                        <h1>HostelHub</h1>
                    </div>
                    <div className="header-right">
                        {userDetails ? (
                            <div className="user-profile">
                                <div className="user-info">
                                    <span className="user-name">Welcome, {userDetails.name || 'Student'}</span>
                                    <span className="user-email">{userDetails.email || ''}</span>
                                </div>
                                <div className="profile-actions">
                                    <button className="profile-btn active" onClick={() => navigate('/profile')}>
                                        <span className="button-icon">👤</span>
                                        Profile
                                    </button>
                                    <button onClick={handleLogout} className="logout-btn">
                                        <span className="button-icon">🚪</span>
                                        Logout
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="profile-actions">
                                <button onClick={handleLogout} className="logout-btn">
                                    <span className="button-icon">🚪</span>
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </header>
            )}

            <div className="nav-menu">
                {userType === 'owner' ? (
                    <>
                        <button className="nav-button" onClick={() => navigate('/add-hostel')}>
                            <span className="button-icon">➕</span>
                            Add Hostel
                        </button>
                        <button className="nav-button" onClick={() => navigate('/view-hostels')}>
                            <span className="button-icon">👁️</span>
                            View Hostels
                        </button>
                        <button className="nav-button" onClick={() => navigate('/manage-students')}>
                            <span className="button-icon">👥</span>
                            Manage Students
                        </button>
                    </>
                ) : (
                    <>
                        <button className="nav-button" onClick={() => navigate('/student-dashboard')}>
                            <span className="button-icon">🏠</span>
                            Browse Hostels
                        </button>
                        <button className="nav-button" onClick={() => navigate('/my-bookings')}>
                            <span className="button-icon">📚</span>
                            My Bookings
                        </button>
                    </>
                )}
                <button className="nav-button active" onClick={() => navigate('/profile')}>
                    <span className="button-icon">👤</span>
                    Profile
                </button>
            </div>

            <div className="main-content">
                <div className="profile-container">
                    <div className="profile-header">
                        <h2>{userType === 'owner' ? 'Owner Profile' : 'Student Profile'}</h2>
                        {!isEditing && (
                            <button className="edit-btn" onClick={handleEdit}>
                                <span className="button-icon">✏️</span>
                                Update Phone Number
                            </button>
                        )}
                    </div>

                    {isEditing ? (
                        <form onSubmit={handleSubmit} className="profile-form">
                            <div className="form-group">
                                <label htmlFor="phone_number">Phone Number</label>
                                <input
                                    type="tel"
                                    id="phone_number"
                                    name="phone_number"
                                    value={editedPhone}
                                    onChange={(e) => setEditedPhone(e.target.value)}
                                    required
                                    pattern="[0-9]{10}"
                                    title="Please enter a valid 10-digit phone number"
                                />
                                <small className="form-text">Enter a valid 10-digit phone number</small>
                            </div>

                            <div className="form-actions">
                                <button type="button" className="cancel-btn" onClick={handleCancel}>
                                    Cancel
                                </button>
                                <button type="submit" className="save-btn">
                                    Update Phone Number
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="profile-details">
                            <div className="detail-group">
                                <h3>Personal Information</h3>
                                <div className="detail-item">
                                    <span className="detail-label">Full Name:</span>
                                    <span className="detail-value">{userDetails?.name}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Email:</span>
                                    <span className="detail-value">{userDetails?.email}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Phone Number:</span>
                                    <span className="detail-value">{userDetails?.phone_number}</span>
                                </div>
                                {userType === 'student' && (
                                    <>
                                        <div className="detail-item">
                                            <span className="detail-label">Date of Birth:</span>
                                            <span className="detail-value">
                                                {userDetails?.date_of_birth ? new Date(userDetails.date_of_birth).toLocaleDateString() : 'N/A'}
                                            </span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Gender:</span>
                                            <span className="detail-value">{userDetails?.gender}</span>
                                        </div>
                                    </>
                                )}
                            </div>

                            {userType === 'student' && (
                                <div className="detail-group">
                                    <h3>Address</h3>
                                    <div className="detail-item">
                                        <span className="detail-label">Current Address:</span>
                                        <span className="detail-value">{userDetails?.current_address}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Permanent Address:</span>
                                        <span className="detail-value">{userDetails?.permanent_address}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile; 