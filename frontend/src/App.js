import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './home/Homepage'; // Correct path
import AboutPage from './home/Aboutpage';
import Shc from './home/Shc';
import StudentLogin from './LoginRegister/StudentLogin';
import StudentRegister from './LoginRegister/StudentRegister';
import OwnerLogin from './LoginRegister/OwnerLogin';
import OwnerRegister from './LoginRegister/OwnerRegister';
import AdminLogin from './LoginRegister/AdminLogin';
import AdminRegister from './LoginRegister/AdminRegister';
import OwnerDashboard from './dashboard/OwnerDashboard';
import AdminDashboard from './dashboard/AdminDashboard';
import StudentDashboard from './dashboard/student-dashboard';
import HostelView from './home/HostelView';
import ManageStudents from './dashboard/ManageStudents';
import MyBookings from './dashboard/MyBookings';
import AddHostel from "./dashboard/AddHostel";
import RemoveHostel from "./dashboard/RemoveHostel";
import ViewHostels from "./dashboard/ViewHostels";
import UpdateHostels from "./dashboard/UpdateHostel";
import Profile from './dashboard/Profile';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/login" element={<Shc/>} />
        <Route path="/student-login" element={<StudentLogin />} />
        <Route path="/student-register" element={<StudentRegister />} />
        <Route path="/owner-login" element={<OwnerLogin />} />
        <Route path="/owner-register" element={<OwnerRegister />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-register" element={<AdminRegister />} />
        <Route path="/owner-dashboard" element={<OwnerDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/add-hostel" element={<AddHostel />} />
        <Route path="/remove-hostel" element={<RemoveHostel />} />
        <Route path="/view-hostels" element={<ViewHostels />} />
        <Route path="/update-hostels" element={<UpdateHostels />} />
        <Route path="/hostel-view" element={<HostelView />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/manage-students" element={<ManageStudents />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}

export default App;
