
import React, { useEffect, useState } from 'react';
import api from '../api/api'; // Use centralized API
import '../styles/ManageUsers.css';

const ManageUsers = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await api.get('/api/students');
        setStudents(response.data);
      } catch (err) {
        setError(err.message || 'Failed to fetch students');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const handleRemove = async (id) => {
    try {
      await api.delete(`/api/students/${id}`);
      setStudents(prev => prev.filter(student => student.student_id !== id));
      alert('Student deleted successfully');
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
      alert('Failed to delete student: ' + errorMessage);
    }
  };

  if (loading) return <p className="loading">Loading...</p>;
  if (error) return <p className="error">Error: {error}</p>;

  return (
    <div className="student-list-container">
      <h1>Student List</h1>
      <table>
        <thead>
          <tr>
            <th>Student ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone Number</th>
            <th>Address</th>
            <th>Date of Birth</th>
            <th>Gender</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.student_id}>
              <td>{student.student_id}</td>
              <td>{student.name}</td>
              <td>{student.email}</td>
              <td>{student.phone_number}</td>
              <td>{student.address}</td>
              <td>{student.date_of_birth}</td>
              <td>{student.gender}</td>
              <td>
                <button className="remove-btn" onClick={() => handleRemove(student.student_id)}>
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageUsers;








// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import '../styles/ManageUsers.css'; // Import the CSS file

// const ManageUsers = () => {
//   const [students, setStudents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchStudents = async () => {
//       try {
//         const response = await axios.get('http://localhost:5000/api/students');
//         setStudents(response.data);
//         setLoading(false);
//       } catch (err) {
//         setError(err.message);
//         setLoading(false);
//       }
//     };

//     fetchStudents();
//   }, []);

//   const handleRemove = async (id) => {
//     try {
//       await axios.delete(`http://localhost:5000/api/students/${id}`);
//       setStudents(students.filter(student => student.student_id !== id));
//       alert('Student deleted successfully');
//     } catch (err) {
//       const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
//       alert('Failed to delete student: ' + errorMessage);
//     }
//   };

//   if (loading) return <p className="loading">Loading...</p>;
//   if (error) return <p className="error">Error: {error}</p>;

//   return (
//     <div className="student-list-container">
//       <h1>Student List</h1>
//       <table>
//         <thead>
//           <tr>
//             <th>Student ID</th>
//             <th>Name</th>
//             <th>Email</th>
//             <th>Phone Number</th>
//             <th>Address</th>
//             <th>Date of Birth</th>
//             <th>Gender</th>
//             <th>Actions</th> {/* Add Actions column */}
//           </tr>
//         </thead>
//         <tbody>
//           {students.map((student) => (
//             <tr key={student.student_id}>
//               <td>{student.student_id}</td>
//               <td>{student.name}</td>
//               <td>{student.email}</td>
//               <td>{student.phone_number}</td>
//               <td>{student.address}</td>
//               <td>{student.date_of_birth}</td>
//               <td>{student.gender}</td>
//               <td>
//                 <button
//                   className="remove-btn"
//                   onClick={() => handleRemove(student.student_id)}
//                 >
//                   Remove
//                 </button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default ManageUsers;
