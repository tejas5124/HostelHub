import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import '../styles/OwnerRegister.css';

function OwnerRegister() {
  const [owner, setOwner] = useState({
    name: '',
    email: '',
    password: '',
    phone_number: '+91',
    address: '',
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setOwner({ ...owner, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!owner.name || !owner.email || !owner.password || !owner.phone_number || !owner.address) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Fields!',
        text: 'Please fill in all the fields.',
      });
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/register_owner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(owner),
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Registration Successful!',
          text: 'Redirecting to login page...',
          timer: 2000,
          showConfirmButton: false,
        });

        setTimeout(() => navigate('/owner-login'), 2000);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Registration Failed!',
          text: data.message || 'Something went wrong. Please try again.',
        });
      }
    } catch (error) {
      console.error('Error registering:', error);
      Swal.fire({
        icon: 'error',
        title: 'Unexpected Error',
        text: 'An error occurred. Please try again later.',
      });
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <h2>🏠 Hostel Owner Registration</h2>
        <form onSubmit={handleSubmit}>
          <input type="text" name="name" value={owner.name} onChange={handleChange} required placeholder="👤 Full Name" />
          <input type="email" name="email" value={owner.email} onChange={handleChange} required placeholder="📧 Email" />
          <input type="password" name="password" value={owner.password} onChange={handleChange} required placeholder="🔒 Password" />
          <input type="text" name="phone_number" value={owner.phone_number} onChange={handleChange} required placeholder="📞 Phone Number" />
          <textarea name="address" value={owner.address} onChange={handleChange} required placeholder="📍 Address"></textarea>
          <button type="submit" className="register-btn">📝 Register</button>
        </form>
        <p className="switch-page">Already have an account? <span onClick={() => navigate('/owner-login')}>Login here</span></p>
      </div>
    </div>
  );
}

export default OwnerRegister;
