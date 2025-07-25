import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './home/Homepage';
import AboutPage from './home/Aboutpage';
import ReviewPage from './home/ReviewPage';
import Contact from './common/Contact';
import Shc from './home/Shc';
import StudentLogin from './LoginRegister/StudentLogin';
import StudentRegister from './LoginRegister/StudentRegister';
import OwnerLogin from './LoginRegister/OwnerLogin';
import OwnerRegister from './LoginRegister/OwnerRegister';
import AdminLogin from './LoginRegister/AdminLogin';
import AdminRegister from './LoginRegister/AdminRegister';
import OwnerDashboard from './dashboard/owner/OwnerDashboard';
import AdminDashboard from './dashboard/admin/AdminDashboard';
import StudentDashboard from './dashboard/student/student-dashboard';
import HostelView from './home/HostelView';
import ManageStudents from './dashboard/admin/ManageStudents';
import MyBookings from './dashboard/student/MyBookings';
import AddHostel from "./dashboard/owner/AddHostel";
import RemoveHostel from "./dashboard/admin/RemoveHostel";
import ViewHostels from "./dashboard/owner/ViewHostels";
import UpdateHostels from "./dashboard/owner/UpdateHostel";
import ForgotPassword from './LoginRegister/ForgotPassword';
import ResetPassword from './LoginRegister/ResetPassword';
import Profile from './common/Profile';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/review" element={<ReviewPage />} />
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
        <Route path="/forgot-password-student" element={<ForgotPassword userType="student" />} />
        <Route path="/forgot-password-owner" element={<ForgotPassword userType="owner" />} />
        <Route path="/reset-password-student/:token" element={<ResetPassword userType="student" />} />
        <Route path="/reset-password-owner/:token" element={<ResetPassword userType="owner" />} />
        <Route path="/profile" element={<Profile role="admin" />} />
        <Route path="/owner-profile" element={<Profile role="owner" />} />
        <Route path="/student-profile" element={<Profile role="student" />} />
      </Routes>
    </Router>
  );
}

export default App;
