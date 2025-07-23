import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './home/Homepage';
import AboutPage from './home/Aboutpage';
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
import ProtectedRoute, { AdminProtectedRoute, OwnerProtectedRoute } from './common/ProtectedRoute';
import ResetPasswordStudent from './LoginRegister/ResetPasswordStudent';
import ResetPasswordOwner from './LoginRegister/ResetPasswordOwner';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Shc/>} />
        <Route path="/student-login" element={<StudentLogin />} />
        <Route path="/student-register" element={<StudentRegister />} />
        <Route path="/owner-login" element={<OwnerLogin />} />
        <Route path="/owner-register" element={<OwnerRegister />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-register" element={<AdminRegister />} />
        <Route path="/owner-dashboard" element={
          <OwnerProtectedRoute>
            <OwnerDashboard />
          </OwnerProtectedRoute>
        } />
        <Route path="/admin-dashboard" element={
          <AdminProtectedRoute>
            <AdminDashboard />
          </AdminProtectedRoute>
        } />
        <Route path="/add-hostel" element={
          <OwnerProtectedRoute>
            <AddHostel />
          </OwnerProtectedRoute>
        } />
        <Route path="/remove-hostel" element={<RemoveHostel />} />
        <Route path="/view-hostels" element={
          <OwnerProtectedRoute>
            <ViewHostels />
          </OwnerProtectedRoute>
        } />
        <Route path="/update-hostels" element={
          <OwnerProtectedRoute>
            <UpdateHostels />
          </OwnerProtectedRoute>
        } />
        <Route path="/hostel-view" element={<HostelView />} />
        // <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/manage-students" element={<ManageStudents />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/forgot-password-student" element={<ForgotPassword userType="student" />} />
        <Route path="/forgot-password-owner" element={<ForgotPassword userType="owner" />} />
        <Route path="/reset-password-student/:token" element={<ResetPasswordStudent />} />
        <Route path="/reset-password-owner/:token" element={<ResetPasswordOwner />} />
        <Route path="/profile" element={<Profile role="admin" />} />
        <Route path="/owner-profile" element={
          <OwnerProtectedRoute>
            <Profile role="owner" />
          </OwnerProtectedRoute>
        } />
        <Route path="/student-profile" element={<Profile role="student" />} />


  {/* 🔒 Protected Dashboards */}
  <Route
    path="/student-dashboard"
    element={
      <ProtectedRoute>
        <StudentDashboard />
      </ProtectedRoute>
    }
  />
      </Routes>
    </Router>
  );
}

export default App;
