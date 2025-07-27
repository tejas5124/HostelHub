import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from '../api'; // ✅ centralized Axios instance
import '../styles/OwnerRegister.css';

function OwnerRegister() {
  const [owner, setOwner] = useState({
    name: '',
    email: '',
    password: '',
    phone_number: '+91',
    address: '',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();

  const validateField = (name, value) => {
    const errors = { ...fieldErrors };
    
    switch (name) {
      case 'name':
        if (!value.trim()) {
          errors.name = 'Name is required';
        } else if (value.trim().length < 2) {
          errors.name = 'Name must be at least 2 characters';
        } else {
          delete errors.name;
        }
        break;
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) {
          errors.email = 'Email is required';
        } else if (!emailRegex.test(value)) {
          errors.email = 'Please enter a valid email';
        } else {
          delete errors.email;
        }
        break;
      case 'password':
        if (!value) {
          errors.password = 'Password is required';
        } else if (value.length < 6) {
          errors.password = 'Password must be at least 6 characters';
        } else {
          delete errors.password;
        }
        break;
      case 'phone_number':
        const phoneRegex = /^\+91[6-9]\d{9}$/;
        if (!value) {
          errors.phone_number = 'Phone number is required';
        } else if (!phoneRegex.test(value)) {
          errors.phone_number = 'Please enter a valid Indian phone number';
        } else {
          delete errors.phone_number;
        }
        break;
      case 'address':
        if (!value.trim()) {
          errors.address = 'Address is required';
        } else if (value.trim().length < 10) {
          errors.address = 'Please provide a complete address';
        } else {
          delete errors.address;
        }
        break;
      default:
        break;
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setOwner({ ...owner, [name]: value });
    
    // Real-time validation
    validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Validate all fields
    const { name, email, password, phone_number, address } = owner;
    let isValid = true;
    
    ['name', 'email', 'password', 'phone_number', 'address'].forEach(field => {
      if (!validateField(field, owner[field])) {
        isValid = false;
      }
    });
    
    if (!isValid) {
      setIsLoading(false);
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error!',
        text: 'Please fix the errors in the form.',
      });
      return;
    }

    try {
      const response = await api.post('/register_owner', owner);
      
      Swal.fire({
        icon: 'success',
        title: 'Registration Successful!',
        text: 'Welcome aboard! Redirecting to login page...',
        timer: 2500,
        showConfirmButton: false,
        background: '#f8f9fa',
        customClass: {
          title: 'swal-title',
          content: 'swal-content'
        }
      });
      
      setTimeout(() => navigate('/owner-login'), 2500);
    } catch (error) {
      console.error('Registration error:', error);
      setIsLoading(false);
      
      Swal.fire({
        icon: 'error',
        title: 'Registration Failed!',
        text: error?.response?.data?.message || 'Something went wrong. Please try again.',
        background: '#f8f9fa',
        customClass: {
          title: 'swal-title',
          content: 'swal-content'
        }
      });
    }
  };

  const getInputClass = (fieldName) => {
    if (fieldErrors[fieldName]) return 'owner-register-input error';
    if (owner[fieldName] && !fieldErrors[fieldName]) return 'owner-register-input success';
    return 'owner-register-input';
  };

  const getTextareaClass = () => {
    if (fieldErrors.address) return 'owner-register-textarea error';
    if (owner.address && !fieldErrors.address) return 'owner-register-textarea success';
    return 'owner-register-textarea';
  };

  return (
    <div className="owner-register-container">
      <div className="owner-register-form-card">
        <h2 className="owner-register-title">🏠 Hostel Owner Registration</h2>
        
        <form onSubmit={handleSubmit} className="owner-register-form">
          <div className="owner-register-input-group">
            <input
              type="text"
              name="name"
              value={owner.name}
              onChange={handleChange}
              required
              placeholder="👤 Full Name"
              className={getInputClass('name')}
              disabled={isLoading}
            />
          </div>

          <div className="owner-register-input-group">
            <input
              type="email"
              name="email"
              value={owner.email}
              onChange={handleChange}
              required
              placeholder="📧 Email Address"
              className={getInputClass('email')}
              disabled={isLoading}
            />
          </div>

          <div className="owner-register-input-group">
            <input
              type="password"
              name="password"
              value={owner.password}
              onChange={handleChange}
              required
              placeholder="🔒 Password (min 6 characters)"
              className={getInputClass('password')}
              disabled={isLoading}
            />
          </div>

          <div className="owner-register-input-group">
            <input
              type="text"
              name="phone_number"
              value={owner.phone_number}
              onChange={handleChange}
              required
              placeholder="📞 Phone Number (+91XXXXXXXXXX)"
              className={getInputClass('phone_number')}
              disabled={isLoading}
            />
          </div>

          <div className="owner-register-input-group">
            <textarea
              name="address"
              value={owner.address}
              onChange={handleChange}
              required
              placeholder="📍 Complete Address (Street, City, State, PIN)"
              className={getTextareaClass()}
              disabled={isLoading}
            ></textarea>
          </div>

          <button 
            type="submit" 
            className="owner-register-submit-btn"
            disabled={isLoading || Object.keys(fieldErrors).length > 0}
          >
            {isLoading ? '📝 Registering...' : '📝 Register as Owner'}
          </button>
        </form>

        <p className="owner-register-switch-text">
          Already have an account?{' '}
          <span 
            className="owner-register-login-link"
            onClick={() => !isLoading && navigate('/owner-login')}
          >
            Login here
          </span>
        </p>
      </div>
    </div>
  );
}

export default OwnerRegister;













// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import Swal from 'sweetalert2';
// import '../styles/OwnerRegister.css';

// function OwnerRegister() {
//   const [owner, setOwner] = useState({
//     name: '',
//     email: '',
//     password: '',
//     phone_number: '+91',
//     address: '',
//   });

//   const navigate = useNavigate();

//   const handleChange = (e) => {
//     setOwner({ ...owner, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     // Validate required fields
//     if (!owner.name || !owner.email || !owner.password || !owner.phone_number || !owner.address) {
//       Swal.fire({
//         icon: 'warning',
//         title: 'Missing Fields!',
//         text: 'Please fill in all the fields.',
//       });
//       return;
//     }

//     try {
//       const response = await fetch('http://localhost:5000/register_owner', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(owner),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         Swal.fire({
//           icon: 'success',
//           title: 'Registration Successful!',
//           text: 'Redirecting to login page...',
//           timer: 2000,
//           showConfirmButton: false,
//         });

//         setTimeout(() => navigate('/owner-login'), 2000);
//       } else {
//         Swal.fire({
//           icon: 'error',
//           title: 'Registration Failed!',
//           text: data.message || 'Something went wrong. Please try again.',
//         });
//       }
//     } catch (error) {
//       console.error('Error registering:', error);
//       Swal.fire({
//         icon: 'error',
//         title: 'Unexpected Error',
//         text: 'An error occurred. Please try again later.',
//       });
//     }
//   };

//   return (
//     <div className="register-page">
//       <div className="register-card">
//         <h2>🏠 Hostel Owner Registration</h2>
//         <form onSubmit={handleSubmit}>
//           <input type="text" name="name" value={owner.name} onChange={handleChange} required placeholder="👤 Full Name" />
//           <input type="email" name="email" value={owner.email} onChange={handleChange} required placeholder="📧 Email" />
//           <input type="password" name="password" value={owner.password} onChange={handleChange} required placeholder="🔒 Password" />
//           <input type="text" name="phone_number" value={owner.phone_number} onChange={handleChange} required placeholder="📞 Phone Number" />
//           <textarea name="address" value={owner.address} onChange={handleChange} required placeholder="📍 Address"></textarea>
//           <button type="submit" className="register-btn">📝 Register</button>
//         </form>
//         <p className="switch-page">Already have an account? <span onClick={() => navigate('/owner-login')}>Login here</span></p>
//       </div>
//     </div>
//   );
// }

// export default OwnerRegister;
