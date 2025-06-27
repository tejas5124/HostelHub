import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from '../api'; // ✅ Centralized Axios instance
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
    const { name, email, password, confirmPassword, phone_number, date_of_birth, gender, address } = student;

    if (!name.trim()) newErrors.name = 'Full name is required';
    else if (name.length < 2) newErrors.name = 'Full name must be at least 2 characters long';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) newErrors.email = 'Email address is required';
    else if (!emailRegex.test(email)) newErrors.email = 'Please enter a valid email address';

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!password) newErrors.password = 'Password is required';
    else if (!passwordRegex.test(password)) newErrors.password =
      'Password must be at least 8 characters long and contain uppercase, lowercase, number and special character';

    if (!confirmPassword) newErrors.confirmPassword = 'Confirm password is required';
    else if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    const phoneRegex = /^[0-9]{10}$/;
    if (!phone_number) newErrors.phone_number = 'Phone number is required';
    else if (!phoneRegex.test(phone_number)) newErrors.phone_number = 'Please enter a valid 10-digit phone number';

    if (!date_of_birth) newErrors.date_of_birth = 'Date of birth is required';
    else {
      const dob = new Date(date_of_birth);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      if (age < 16) newErrors.date_of_birth = 'You must be at least 16 years old';
    }

    if (!gender) newErrors.gender = 'Gender is required';

    if (!address.trim()) newErrors.address = 'Address is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStudent(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
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
      const response = await api.post('/register', {
        name: student.name,
        email: student.email,
        password: student.password,
        date_of_birth: student.date_of_birth,
        phone_number: student.phone_number,
        gender: student.gender,
        address: student.address,
      });

      Swal.fire({
        icon: 'success',
        title: 'Registration Successful! 🎉',
        text: 'Redirecting to login page...',
        timer: 2000,
        showConfirmButton: false,
      });

      setTimeout(() => navigate('/student-login'), 2000);
    } catch (error) {
      console.error('Registration Error:', error);
      const message = error?.response?.data?.message;
      if (message === 'Email is already registered. Please use a different email.') {
        Swal.fire({
          icon: 'error',
          title: 'Email Already Exists!',
          text: message,
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Registration Failed!',
          text: message || 'Something went wrong. Please try again.',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateFormProgress = () => {
    const fields = [
      'name', 'email', 'password', 'confirmPassword',
      'date_of_birth', 'phone_number', 'gender', 'address',
    ];
    const filled = fields.filter(f => student[f]?.trim());
    return Math.round((filled.length / fields.length) * 100);
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <h2 className="card-title">🎓 Student Registration</h2>

        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${calculateFormProgress()}%` }}></div>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          {/* NAME & EMAIL */}
          <div className="form-row">
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" name="name" value={student.name} onChange={handleChange} className={errors.name ? 'error' : ''} />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input type="email" name="email" value={student.email} onChange={handleChange} className={errors.email ? 'error' : ''} />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>
          </div>

          {/* PASSWORDS */}
          <div className="form-row">
            <div className="form-group">
              <label>Password</label>
              <input type="password" name="password" value={student.password} onChange={handleChange} className={errors.password ? 'error' : ''} />
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <input type="password" name="confirmPassword" value={student.confirmPassword} onChange={handleChange} className={errors.confirmPassword ? 'error' : ''} />
              {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
            </div>
          </div>

          {/* DOB & PHONE */}
          <div className="form-row">
            <div className="form-group">
              <label>Date of Birth</label>
              <input type="date" name="date_of_birth" value={student.date_of_birth} onChange={handleChange} className={errors.date_of_birth ? 'error' : ''} />
              {errors.date_of_birth && <span className="error-message">{errors.date_of_birth}</span>}
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input type="tel" name="phone_number" value={student.phone_number} onChange={handleChange} className={errors.phone_number ? 'error' : ''} />
              {errors.phone_number && <span className="error-message">{errors.phone_number}</span>}
            </div>
          </div>

          {/* GENDER & ADDRESS */}
          <div className="form-group">
            <label>Gender</label>
            <select name="gender" value={student.gender} onChange={handleChange} className={errors.gender ? 'error' : ''}>
              <option value="">Select Gender</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
            {errors.gender && <span className="error-message">{errors.gender}</span>}
          </div>

          <div className="form-group">
            <label>Address</label>
            <textarea name="address" value={student.address} onChange={handleChange} rows="3" className={errors.address ? 'error' : ''}></textarea>
            {errors.address && <span className="error-message">{errors.address}</span>}
          </div>

          <button type="submit" className="register-submit-btn" disabled={loading}>
            {loading ? 'Registering...' : 'Register Account'}
          </button>
        </form>

        <div className="switch-page">
          Already Registered?
          <button type="button" onClick={() => navigate('/student-login')} className="login-redirect-btn">
            Login here
          </button>
        </div>
      </div>
    </div>
  );
}

export default StudentRegister;














// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import Swal from 'sweetalert2';
// import '../styles/StudentRegister.css';

// function StudentRegister() {
//   const [student, setStudent] = useState({
//     name: '',
//     email: '',
//     password: '',
//     confirmPassword: '',
//     date_of_birth: '',
//     phone_number: '',
//     gender: '',
//     address: '',
//   });

//   const [loading, setLoading] = useState(false);
//   const [errors, setErrors] = useState({});
//   const navigate = useNavigate();

//   const validateForm = () => {
//     const newErrors = {};
    
//     // Name validation
//     if (!student.name.trim()) {
//       newErrors.name = 'Full name is required';
//     } else if (student.name.length < 2) {
//       newErrors.name = 'Full name must be at least 2 characters long';
//     }

//     // Email validation
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!student.email) {
//       newErrors.email = 'Email address is required';
//     } else if (!emailRegex.test(student.email)) {
//       newErrors.email = 'Please enter a valid email address';
//     }

//     // Password validation
//     const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
//     if (!student.password) {
//       newErrors.password = 'Password is required';
//     } else if (!passwordRegex.test(student.password)) {
//       newErrors.password = 'Password must be at least 8 characters long and contain uppercase, lowercase, number and special character';
//     }

//     // Confirm password validation
//     if (!student.confirmPassword) {
//       newErrors.confirmPassword = 'Confirm password is required';
//     } else if (student.password !== student.confirmPassword) {
//       newErrors.confirmPassword = 'Passwords do not match';
//     }

//     // Phone number validation
//     const phoneRegex = /^[0-9]{10}$/;
//     if (!student.phone_number) {
//       newErrors.phone_number = 'Phone number is required';
//     } else if (!phoneRegex.test(student.phone_number)) {
//       newErrors.phone_number = 'Please enter a valid 10-digit phone number';
//     }

//     // Date of birth validation
//     if (!student.date_of_birth) {
//       newErrors.date_of_birth = 'Date of birth is required';
//     } else {
//       const dob = new Date(student.date_of_birth);
//       const today = new Date();
//       const age = today.getFullYear() - dob.getFullYear();
//       if (age < 16) {
//         newErrors.date_of_birth = 'You must be at least 16 years old';
//       }
//     }

//     // Gender validation
//     if (!student.gender) {
//       newErrors.gender = 'Gender is required';
//     }

//     // Address validation
//     if (!student.address.trim()) {
//       newErrors.address = 'Address is required';
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setStudent(prev => ({
//       ...prev,
//       [name]: value
//     }));
//     // Clear error when user starts typing
//     if (errors[name]) {
//       setErrors(prev => ({
//         ...prev,
//         [name]: ''
//       }));
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!validateForm()) {
//       Swal.fire({
//         icon: 'error',
//         title: 'Validation Error',
//         text: 'Please check the form for errors',
//       });
//       return;
//     }

//     setLoading(true);

//     try {
//       const response = await fetch('http://localhost:5000/register', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           name: student.name,
//           email: student.email,
//           password: student.password,
//           date_of_birth: student.date_of_birth,
//           phone_number: student.phone_number,
//           gender: student.gender,
//           address: student.address,
//         }),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         Swal.fire({
//           icon: 'success',
//           title: 'Registration Successful! 🎉',
//           text: 'Redirecting to login page...',
//           timer: 2000,
//           showConfirmButton: false,
//         });
//         setTimeout(() => navigate('/student-login'), 2000);
//       } else {
//         if (data.message === 'Email is already registered. Please use a different email.') {
//           Swal.fire({
//             icon: 'error',
//             title: 'Email Already Exists!',
//             text: 'This email is already registered. Please try a different email.',
//           });
//         } else {
//           Swal.fire({
//             icon: 'error',
//             title: 'Registration Failed!',
//             text: data.message || 'Something went wrong. Please try again.',
//           });
//         }
//       }
//     } catch (error) {
//       console.error('Error registering:', error);
//       Swal.fire({
//         icon: 'error',
//         title: 'Unexpected Error',
//         text: 'An error occurred. Please try again later.',
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const calculateFormProgress = () => {
//     const fields = ['name', 'email', 'password', 'confirmPassword', 'date_of_birth', 'phone_number', 'gender', 'address'];
//     const filledFields = fields.filter(field => student[field] && student[field].trim() !== '');
//     return Math.round((filledFields.length / fields.length) * 100);
//   };

//   return (
//     <div className="register-page">
//       <div className="register-card">
//         <h2 className="card-title">🎓 Student Registration</h2>
        
//         <div className="progress-bar">
//           <div 
//             className="progress-fill"
//             style={{ width: `${calculateFormProgress()}%` }}
//           ></div>
//         </div>
        
//         <form onSubmit={handleSubmit} className="register-form">
//           <div className="form-row">
//             <div className="form-group">
//               <label htmlFor="name">Full Name</label>
//               <input
//                 type="text"
//                 id="name"
//                 name="name"
//                 value={student.name}
//                 onChange={handleChange}
//                 placeholder="John Doe"
//                 className={errors.name ? 'error' : ''}
//               />
//               {errors.name && <span className="error-message">{errors.name}</span>}
//             </div>

//             <div className="form-group">
//               <label htmlFor="email">Email Address</label>
//               <input
//                 type="email"
//                 id="email"
//                 name="email"
//                 value={student.email}
//                 onChange={handleChange}
//                 placeholder="john.doe@example.com"
//                 className={errors.email ? 'error' : ''}
//               />
//               {errors.email && <span className="error-message">{errors.email}</span>}
//             </div>
//           </div>

//           <div className="form-row">
//             <div className="form-group">
//               <label htmlFor="password">Password</label>
//               <input
//                 type="password"
//                 id="password"
//                 name="password"
//                 value={student.password}
//                 onChange={handleChange}
//                 placeholder="Minimum 8 characters, strong password"
//                 className={errors.password ? 'error' : ''}
//               />
//               {errors.password && <span className="error-message">{errors.password}</span>}
//             </div>

//             <div className="form-group">
//               <label htmlFor="confirmPassword">Confirm Password</label>
//               <input
//                 type="password"
//                 id="confirmPassword"
//                 name="confirmPassword"
//                 value={student.confirmPassword}
//                 onChange={handleChange}
//                 placeholder="Re-enter your password"
//                 className={errors.confirmPassword ? 'error' : ''}
//               />
//               {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
//             </div>
//           </div>

//           <div className="form-row">
//             <div className="form-group">
//               <label htmlFor="date_of_birth">Date of Birth</label>
//               <input
//                 type="date"
//                 id="date_of_birth"
//                 name="date_of_birth"
//                 value={student.date_of_birth}
//                 onChange={handleChange}
//                 className={errors.date_of_birth ? 'error' : ''}
//               />
//               {errors.date_of_birth && <span className="error-message">{errors.date_of_birth}</span>}
//             </div>

//             <div className="form-group">
//               <label htmlFor="phone_number">Phone Number</label>
//               <input
//                 type="tel"
//                 id="phone_number"
//                 name="phone_number"
//                 value={student.phone_number}
//                 onChange={handleChange}
//                 placeholder="e.g., 9876543210"
//                 className={errors.phone_number ? 'error' : ''}
//               />
//               {errors.phone_number && <span className="error-message">{errors.phone_number}</span>}
//             </div>
//           </div>

//           <div className="form-group">
//             <label htmlFor="gender">Gender</label>
//             <select
//               id="gender"
//               name="gender"
//               value={student.gender}
//               onChange={handleChange}
//               className={errors.gender ? 'error' : ''}
//             >
//               <option value="">Select Gender</option>
//               <option value="Male">Male</option>
//               <option value="Female">Female</option>
//               <option value="Other">Other</option>
//             </select>
//             {errors.gender && <span className="error-message">{errors.gender}</span>}
//           </div>

//           <div className="form-group">
//             <label htmlFor="address">Address</label>
//             <textarea
//               id="address"
//               name="address"
//               value={student.address}
//               onChange={handleChange}
//               placeholder="Your full address"
//               rows="3"
//               className={errors.address ? 'error' : ''}
//             ></textarea>
//             {errors.address && <span className="error-message">{errors.address}</span>}
//           </div>

//           <button type="submit" className="register-submit-btn" disabled={loading}>
//             {loading ? 'Registering...' : 'Register Account'}
//           </button>
//         </form>

//         <div className="switch-page">
//           Already Registered? 
//           <button type="button" onClick={() => navigate('/student-login')} className="login-redirect-btn">
//             Login here
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default StudentRegister;

