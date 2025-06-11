import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import '../styles/StudentRegister.css';

function StudentRegister() {
  const [student, setStudent] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    date_of_birth: '',
    phone_number: '',
    gender: '',
    address: '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    
    // Name validation
    if (!student.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (student.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters long';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!student.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(student.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!student.password) {
      newErrors.password = 'Password is required';
    } else if (!passwordRegex.test(student.password)) {
      newErrors.password = 'Password must be at least 8 characters long and contain uppercase, lowercase, number and special character';
    }

    // Confirm password validation
    if (student.password !== student.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Phone number validation
    const phoneRegex = /^[0-9]{10}$/;
    if (!student.phone_number) {
      newErrors.phone_number = 'Phone number is required';
    } else if (!phoneRegex.test(student.phone_number)) {
      newErrors.phone_number = 'Please enter a valid 10-digit phone number';
    }

    // Date of birth validation
    if (!student.date_of_birth) {
      newErrors.date_of_birth = 'Date of birth is required';
    } else {
      const dob = new Date(student.date_of_birth);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      if (age < 16) {
        newErrors.date_of_birth = 'You must be at least 16 years old';
      }
    }

    // Gender validation
    if (!student.gender) {
      newErrors.gender = 'Gender is required';
    }

    // Address validation
    if (!student.address.trim()) {
      newErrors.address = 'Address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStudent(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please check the form for errors',
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: student.name,
          email: student.email,
          password: student.password,
          date_of_birth: student.date_of_birth,
          phone_number: student.phone_number,
          gender: student.gender,
          address: student.address,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Registration Successful! 🎉',
          text: 'Redirecting to login page...',
          timer: 2000,
          showConfirmButton: false,
        });
        setTimeout(() => navigate('/student-login'), 2000);
      } else {
        if (data.message === 'Email is already registered. Please use a different email.') {
          Swal.fire({
            icon: 'error',
            title: 'Email Already Exists!',
            text: 'This email is already registered. Please try a different email.',
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Registration Failed!',
            text: data.message || 'Something went wrong. Please try again.',
          });
        }
      }
    } catch (error) {
      console.error('Error registering:', error);
      Swal.fire({
        icon: 'error',
        title: 'Unexpected Error',
        text: 'An error occurred. Please try again later.',
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateFormProgress = () => {
    const fields = ['name', 'email', 'password', 'confirmPassword', 'date_of_birth', 'phone_number', 'gender', 'address'];
    const filledFields = fields.filter(field => student[field] && student[field].trim() !== '');
    return Math.round((filledFields.length / fields.length) * 100);
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <h2>🎓 Student Registration</h2>
        
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${calculateFormProgress()}%` }}
          ></div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              name="name"
              value={student.name}
              onChange={handleChange}
              placeholder="👤 Full Name"
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-group">
            <input
              type="email"
              name="email"
              value={student.email}
              onChange={handleChange}
              placeholder="📧 Email"
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <input
              type="password"
              name="password"
              value={student.password}
              onChange={handleChange}
              placeholder="🔒 Password"
              className={errors.password ? 'error' : ''}
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          <div className="form-group">
            <input
              type="password"
              name="confirmPassword"
              value={student.confirmPassword}
              onChange={handleChange}
              placeholder="🔒 Confirm Password"
              className={errors.confirmPassword ? 'error' : ''}
            />
            {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
          </div>

          <div className="form-group">
            <input
              type="date"
              name="date_of_birth"
              value={student.date_of_birth}
              onChange={handleChange}
              className={errors.date_of_birth ? 'error' : ''}
            />
            {errors.date_of_birth && <span className="error-message">{errors.date_of_birth}</span>}
          </div>

          <div className="form-group">
            <select
              name="gender"
              value={student.gender}
              onChange={handleChange}
              className={errors.gender ? 'error' : ''}
            >
              <option value="">⚥ Select Gender</option>
              <option value="Male">♂️ Male</option>
              <option value="Female">♀️ Female</option>
              <option value="Other">⚧ Other</option>
            </select>
            {errors.gender && <span className="error-message">{errors.gender}</span>}
          </div>

          <div className="form-group">
            <input
              type="tel"
              name="phone_number"
              value={student.phone_number}
              onChange={handleChange}
              placeholder="📞 Phone Number"
              className={errors.phone_number ? 'error' : ''}
            />
            {errors.phone_number && <span className="error-message">{errors.phone_number}</span>}
          </div>

          <div className="form-group">
            <textarea
              name="address"
              value={student.address}
              onChange={handleChange}
              placeholder="📍 Address"
              className={errors.address ? 'error' : ''}
            ></textarea>
            {errors.address && <span className="error-message">{errors.address}</span>}
          </div>

          <button 
            type="submit" 
            className="register-btn"
            disabled={loading}
          >
            {loading ? '⏳ Registering...' : '📝 Register'}
          </button>
        </form>

        <p className="switch-page">
          Already have an account?{' '}
          <span onClick={() => navigate('/student-login')} className="link-text">
            Login here
          </span>
        </p>
      </div>
    </div>
  );
}

export default StudentRegister;

