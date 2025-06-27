import React, { useEffect, useState } from 'react';
import api from '../api'; // ✅ Use your configured Axios instance
import '../../styles/StudentList.css';

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [genderFilter, setGenderFilter] = useState('');
  const [hostelFilter, setHostelFilter] = useState('');
  const [search, setSearch] = useState('');
  const [hostelOptions, setHostelOptions] = useState([]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await api.get('/api/students'); // ✅ using centralized API
        setStudents(response.data);

        // Get unique hostel names for filter dropdown
        const hostels = Array.from(new Set(response.data.map(s => s.hostel_name).filter(Boolean)));
        setHostelOptions(hostels);

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const filteredStudents = students.filter(student => {
    const matchesGender = genderFilter ? student.gender === genderFilter : true;
    const matchesHostel = hostelFilter ? student.hostel_name === hostelFilter : true;
    const matchesSearch =
      student.name.toLowerCase().includes(search.toLowerCase()) ||
      student.email.toLowerCase().includes(search.toLowerCase());
    return matchesGender && matchesHostel && matchesSearch;
  });

  if (loading) return <p className="loading">Loading...</p>;
  if (error) return <p className="error">Error: {error}</p>;

  return (
    <div className="student-list-container">
      <h1>Student List</h1>

      <div className="filters-row">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="student-search-input"
        />

        <select value={genderFilter} onChange={e => setGenderFilter(e.target.value)}>
          <option value="">All Genders</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>

        <select value={hostelFilter} onChange={e => setHostelFilter(e.target.value)}>
          <option value="">All Hostels</option>
          {hostelOptions.map(h => (
            <option key={h} value={h}>{h}</option>
          ))}
        </select>
      </div>

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
            <th>Hostel</th>
            <th>Allocation Status</th>
          </tr>
        </thead>
        <tbody>
          {filteredStudents.map((student) => (
            <tr key={student.student_id}>
              <td>{student.student_id}</td>
              <td>{student.name}</td>
              <td>{student.email}</td>
              <td>{student.phone_number}</td>
              <td>{student.address}</td>
              <td>{student.date_of_birth}</td>
              <td>{student.gender}</td>
              <td>{student.hostel_name || '-'}</td>
              <td>{student.hostel_name ? 'Allocated' : 'Not Allocated'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentList;












// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import '../../styles/StudentList.css'; // Import the CSS file

// const StudentList = () => {
//   const [students, setStudents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [genderFilter, setGenderFilter] = useState('');
//   const [hostelFilter, setHostelFilter] = useState('');
//   const [search, setSearch] = useState('');
//   const [hostelOptions, setHostelOptions] = useState([]);

//   useEffect(() => {
//     const fetchStudents = async () => {
//       try {
//         const response = await axios.get('http://localhost:5000/api/students');
//         setStudents(response.data);
//         // Extract unique hostel names for filter dropdown
//         const hostels = Array.from(new Set(response.data.map(s => s.hostel_name).filter(Boolean)));
//         setHostelOptions(hostels);
//         setLoading(false);
//       } catch (err) {
//         setError(err.message);
//         setLoading(false);
//       }
//     };
//     fetchStudents();
//   }, []);

//   const filteredStudents = students.filter(student => {
//     const matchesGender = genderFilter ? student.gender === genderFilter : true;
//     const matchesHostel = hostelFilter ? student.hostel_name === hostelFilter : true;
//     const matchesSearch =
//       student.name.toLowerCase().includes(search.toLowerCase()) ||
//       student.email.toLowerCase().includes(search.toLowerCase());
//     return matchesGender && matchesHostel && matchesSearch;
//   });

//   if (loading) return <p className="loading">Loading...</p>;
//   if (error) return <p className="error">Error: {error}</p>;

//   return (
//     <div className="student-list-container">
//       <h1>Student List</h1>
//       <div className="filters-row">
//         <input
//           type="text"
//           placeholder="Search by name or email..."
//           value={search}
//           onChange={e => setSearch(e.target.value)}
//           className="student-search-input"
//         />
//         <select value={genderFilter} onChange={e => setGenderFilter(e.target.value)}>
//           <option value="">All Genders</option>
//           <option value="male">Male</option>
//           <option value="female">Female</option>
//           <option value="other">Other</option>
//         </select>
//         <select value={hostelFilter} onChange={e => setHostelFilter(e.target.value)}>
//           <option value="">All Hostels</option>
//           {hostelOptions.map(h => (
//             <option key={h} value={h}>{h}</option>
//           ))}
//         </select>
//       </div>
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
//             <th>Hostel</th>
//             <th>Allocation Status</th>
//           </tr>
//         </thead>
//         <tbody>
//           {filteredStudents.map((student) => (
//             <tr key={student.student_id}>
//               <td>{student.student_id}</td>
//               <td>{student.name}</td>
//               <td>{student.email}</td>
//               <td>{student.phone_number}</td>
//               <td>{student.address}</td>
//               <td>{student.date_of_birth}</td>
//               <td>{student.gender}</td>
//               <td>{student.hostel_name || '-'}</td>
//               <td>{student.hostel_name ? 'Allocated' : 'Not Allocated'}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default StudentList;
