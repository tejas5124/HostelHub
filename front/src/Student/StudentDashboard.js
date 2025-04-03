import React, { useState } from "react";
import "../Student/StudentDashboard.css";
import StudentSidebar from "./StudentSidebar";

const StudentDashboard = () => {
  const [student] = useState({
    id: 101,
    name: "Alice Johnson",
    role: "student",
  });

  const [bookings] = useState([
    { id: 1, hostelName: "Green View Hostel", roomNumber: 101, status: "Confirmed" },
    { id: 2, hostelName: "Blue Sky Residency", roomNumber: 203, status: "Pending" },
  ]);

  const [paymentHistory] = useState([
    { id: 1, amount: 1200, date: "2025-03-01", status: "Paid" },
    { id: 2, amount: 1500, date: "2025-02-20", status: "Pending" },
  ]);

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <StudentSidebar student={student} />

      <div className="student-dashboard">
        <main className="dashboard-content">
          <h2>Welcome, {student.name}!</h2>

          {/* Current Bookings */}
          <div className="dashboard-section">
            <h3>Your Bookings</h3>
            <ul>
              {bookings.map((booking) => (
                <li key={booking.id}>
                  {booking.hostelName} - Room {booking.roomNumber} ({booking.status})
                </li>
              ))}
            </ul>
          </div>

          {/* Payment History */}
          <div className="dashboard-section">
            <h3>Payment History</h3>
            <ul>
              {paymentHistory.map((payment) => (
                <li key={payment.id}>
                  ${payment.amount} - {payment.date} ({payment.status})
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Actions */}
          <div className="dashboard-section">
            <h3>Quick Actions</h3>
            <button onClick={() => alert("Booking a new hostel!")}>Book a Hostel</button>
            <button onClick={() => alert("Viewing payment history!")}>View Payments</button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;
