  import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
  import Home from "./pages/Home";
  import Login from "./pages/Login";
  import StudentDashboard from "./Student/StudentDashboard";
  import OwnerDashboard from "./HostelOwner/OwnerDashboard";
  import AdminDashboard from "./Admin/AdminDashboard";
import ManageHostels from "./HostelOwner/ManageHostels";
import ManageRooms from "./HostelOwner/ManageRooms";
import ViewHostels from "./Admin/ViewHostels";
import ApproveRejectHostels from "./Admin/ApproveRejectHostels";
import ViewApprovedRejectedHostels from "./Admin/ViewApprovedRejectedHostels";
import ViewStatusWiseHostels from "./Student/ViewStatusWiseHostels";
import BookHostel from "./Student/BookHostel";

  function App() {
    return (
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/student-dashboard/:id" element={<StudentDashboard />} />
          <Route path="/owner-dashboard/:id" element={<OwnerDashboard />} />
          <Route path="/admin-dashboard/:id" element={<AdminDashboard />} />
          <Route path="/owner-dashboard/:id/manage-hostels" element={<ManageHostels />} />
          <Route path="/owner-dashboard/:id/manage-rooms" element={<ManageRooms/>} />
          <Route path="/admin-dashboard/:id/view-hostels" element={<ViewHostels />} />
          <Route path="/admin-dashboard/:id/approve-hostels" element={<ApproveRejectHostels />} />
          <Route path="/admin-dashboard/:id/view-approved-rejected" element={<ViewApprovedRejectedHostels />} />
          <Route path="/student-dashboard/:student_id/view-status-wise-hostels" element={<ViewStatusWiseHostels />} />
          <Route path="/student-dashboard/:student_id/book-hostel" element={<BookHostel />} />


        </Routes>
      </Router>
    );
  }

  export default App;
