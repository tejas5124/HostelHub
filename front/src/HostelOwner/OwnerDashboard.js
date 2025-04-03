import React, { useState } from "react";
import "../HostelOwner/OwnerDashboard.css";
import OwnerSidebar from "./OwnerSidebar";
import { FaChartLine, FaUserGraduate, FaDollarSign, FaBed, FaClock } from "react-icons/fa";

const OwnerDashboard = () => {
  const [owner] = useState({
    id: 1,
    name: "John Doe",
    role: "hostel_owner",
  });

  const [stats] = useState({
    totalBookings: 45,
    totalRevenue: 12850,
    availableRooms: 12,
    pendingPayments: 3200,
    occupancyRate: 78,
  });

  const [recentBookings] = useState([
    { id: 1, studentName: "Alice Johnson", roomNumber: 101, hostelName: "Green View Hostel" },
    { id: 2, studentName: "Bob Smith", roomNumber: 203, hostelName: "Blue Sky Residency" },
    { id: 3, studentName: "Charlie Brown", roomNumber: 305, hostelName: "Sunrise Hostel" },
  ]);

  const [pendingApprovals] = useState([
    { id: 1, name: "Ocean Breeze Hostel" },
    { id: 2, name: "Mountain View Hostel" },
  ]);

  const [topPayingStudents] = useState([
    { id: 1, name: "Daisy Parker", amountPaid: 1500 },
    { id: 2, name: "Ethan Blake", amountPaid: 1200 },
    { id: 3, name: "Sophia Miller", amountPaid: 1100 },
  ]);

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <OwnerSidebar owner={owner} />

      {/* Main Dashboard */}
      <div className="owner-dashboard">
        <header className="dashboard-header">
          <h2>Welcome, {owner.name} 👋</h2>
        </header>

        <main className="dashboard-content">
          {/* Statistics Section */}
          <div className="dashboard-stats">
            <div className="stat-box">
              <FaChartLine className="stat-icon" />
              <div>
                <h3>{stats.totalBookings}</h3>
                <p>Total Bookings</p>
              </div>
            </div>

            <div className="stat-box">
              <FaDollarSign className="stat-icon" />
              <div>
                <h3>${stats.totalRevenue}</h3>
                <p>Total Revenue</p>
              </div>
            </div>

            <div className="stat-box">
              <FaBed className="stat-icon" />
              <div>
                <h3>{stats.availableRooms}</h3>
                <p>Available Rooms</p>
              </div>
            </div>

            <div className="stat-box">
              <FaClock className="stat-icon" />
              <div>
                <h3>${stats.pendingPayments}</h3>
                <p>Pending Payments</p>
              </div>
            </div>

            <div className="stat-box">
              <FaUserGraduate className="stat-icon" />
              <div>
                <h3>{stats.occupancyRate}%</h3>
                <p>Occupancy Rate</p>
              </div>
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="dashboard-section">
            <h3>Recent Bookings</h3>
            <ul>
              {recentBookings.map((booking) => (
                <li key={booking.id}>
                  {booking.studentName} booked Room {booking.roomNumber} at {booking.hostelName}
                </li>
              ))}
            </ul>
          </div>

          {/* Pending Approvals */}
          <div className="dashboard-section">
            <h3>Pending Hostel Approvals</h3>
            <ul>
              {pendingApprovals.map((hostel) => (
                <li key={hostel.id}>{hostel.name} - Waiting for Admin Approval</li>
              ))}
            </ul>
          </div>

          {/* Top Paying Students */}
          <div className="dashboard-section">
            <h3>Top Paying Students</h3>
            <ul>
              {topPayingStudents.map((student) => (
                <li key={student.id}>
                  {student.name} - Paid ${student.amountPaid}
                </li>
              ))}
            </ul>
          </div>
        </main>
      </div>
    </div>
  );
};

export default OwnerDashboard;
