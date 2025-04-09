// import React, { useState } from 'react';
// import '../styles/StudentRegister.css';

// function StudentRegister() {
//   const [name, setName] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [dateOfBirth, setDateOfBirth] = useState('');
//   const [phoneNumber, setPhoneNumber] = useState('');
//   const [gender, setGender] = useState('');
//   const [address, setAddress] = useState('');

//   const handleSubmit = (e) => {
//     e.preventDefault();
  
//     const studentData = {
//       name,
//       email,
//       password,
//       date_of_birth: dateOfBirth,
//       phone_number: phoneNumber,
//       gender,
//       address,
//     };
  
//     fetch('http://localhost:5000/register', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(studentData),
//     })
//       .then(response => response.json())
//       .then(data => {
//         if (data.message) {
//           alert('Registration successful!'); // Show success alert
//           window.location.href = '/student-login'; // Redirect to login page
//         }
//       })
//       .catch((error) => {
//         console.error('Error:', error);
//       });
//   };
  
//   return (
//     <div className="register-container">
//       <div className="right-section">
//         <div className="logo">
//           <img src="/image.png" alt="HostelHub Logo" />
//         </div>

//         <div className="form-container">
//           <h2>Create New Account</h2>
//           <p>
//             Already Registered? <a href="/student-login">Login as Student</a> 
//           </p>
//           <form onSubmit={handleSubmit}>
//             <input
//               type="text"
//               name="name"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               placeholder="Please enter your name"
//               required
//             />
//             <input
//               type="email"
//               name="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               placeholder="Please enter Email"
//               required
//             />
//             <input
//               type="password"
//               name="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               placeholder="Please enter password"
//               required
//             />
//             <input
//               type="date"
//               name="date_of_birth"
//               value={dateOfBirth}
//               onChange={(e) => setDateOfBirth(e.target.value)}
//               placeholder="Please enter date of birth"
//               required
//             />
//             <input
//               type="tel"
//               name="phone_number"
//               value={phoneNumber}
//               onChange={(e) => setPhoneNumber(e.target.value)}
//               placeholder="Please enter phone number"
//               required
//             />
//             <select
//               name="gender"
//               value={gender}
//               onChange={(e) => setGender(e.target.value)}
//               required
//             >
//               <option value="" disabled>Select your gender</option>
//               <option value="male">Male</option>
//               <option value="female">Female</option>
//               <option value="other">Other</option>
//             </select>
//             <textarea
//               name="address"
//               value={address}
//               onChange={(e) => setAddress(e.target.value)}
//               placeholder="Please enter your address"
//               rows="3"
//               required
//             />
//             <button type="submit" className="register-button">Sign Up</button>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default StudentRegister;


import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import '../styles/StudentRegister.css'; // Ensure the correct CSS file is imported

function StudentRegister() {
  const [student, setStudent] = useState({
    name: '',
    email: '',
    password: '',
    date_of_birth: '',
    phone_number: '',
    gender: '',
    address: '',
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setStudent({ ...student, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (
      !student.name ||
      !student.email ||
      !student.password ||
      !student.phone_number ||
      !student.address ||
      !student.date_of_birth ||
      !student.gender
    ) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Fields!',
        text: 'Please fill in all the required fields, including your date of birth.',
      });
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/register', { // Ensure correct backend route
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(student),
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
        // Check if the email is already registered
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
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <h2>🎓 Student Registration</h2>
        <form onSubmit={handleSubmit}>
          <input type="text" name="name" value={student.name} onChange={handleChange} required placeholder="👤 Full Name" />
          <input type="email" name="email" value={student.email} onChange={handleChange} required placeholder="📧 Email" />
          <input type="password" name="password" value={student.password} onChange={handleChange} required placeholder="🔒 Password" />
          <input type="date" name="date_of_birth" value={student.date_of_birth} onChange={handleChange} required />
          <select name="gender" value={student.gender} onChange={handleChange} required>
            <option value="">⚥ Select Gender</option>
            <option value="Male">♂️ Male</option>
            <option value="Female">♀️ Female</option>
            <option value="Other">⚧ Other</option>
          </select>
          <input type="text" name="phone_number" value={student.phone_number} onChange={handleChange} required placeholder="📞 Phone Number" />
          <textarea name="address" value={student.address} onChange={handleChange} required placeholder="📍 Address"></textarea>
          <button type="submit" className="register-btn">📝 Register</button>
        </form>
        <p className="switch-page">
          Already have an account?{' '}
          <span onClick={() => navigate('/student-login')} className="link-text">Login here</span>
        </p>
      </div>
    </div>
  );
}

export default StudentRegister;

