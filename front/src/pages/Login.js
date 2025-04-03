import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Login.css";

const Login = () => {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone_number: "",
    password: "",
    confirmPassword: "",
    role: "",
    agreeTerms: false,
  });
  const [error, setError] = useState("");
  const [showTerms, setShowTerms] = useState(false);

  // ✅ Handle Input Changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value.trim(),
    }));
    setError(""); // Clear errors on change
  };

  // ✅ Save User to Local Storage
  const saveUser = (user) => {
    localStorage.setItem("user", JSON.stringify(user));
  };

  // ✅ Log In Function
  const log_in = async () => {
    try {
      const { email, password } = formData;
      const response = await axios.post("http://localhost:5000/login", {
        email,
        password,
      });

      const user = response.data.user;
      saveUser(user); // Store user in local storage

      // ✅ Redirect based on role
      switch (user.role) {
        case "student":
          navigate(`/student-dashboard/${user.id}`);
          break;
        case "hostel_owner":
          navigate(`/owner-dashboard/${user.id}`);
          break;
        case "college_admin":
          navigate(`/admin-dashboard/${user.id}`);
          break;
        default:
          throw new Error("Unknown role. Please contact support.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Try again.");
    }
  };

  // ✅ Register Function
  const register = async () => {
    try {
      const { password, confirmPassword } = formData;

      if (password !== confirmPassword) {
        setError("Passwords do not match!");
        return;
      }

      const response = await axios.post("http://localhost:5000/register", formData);
      alert(response.data.message);
      setIsRegister(false); // Switch to login on successful registration
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Try again.");
    }
  };

  // ✅ Form Submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (isRegister) {
      const { name, email, password, confirmPassword, phone_number, role, agreeTerms } = formData;
      if (!name || !email || !password || !confirmPassword || !phone_number || !role) {
        setError("All fields are required for registration.");
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }
      if (!agreeTerms) {
        setError("You must agree to the Terms and Conditions.");
        return;
      }
      register(); // Call register function
    } else {
      const { email, password } = formData;
      if (!email || !password) {
        setError("Email and password are required.");
        return;
      }
      log_in(); // Call login function
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2 className="auth-title">{isRegister ? "Register" : "Log In"}</h2>

        {/* Toggle Between Login & Register */}
        <div className="toggle-container">
          <button
            className={`toggle-btn ${!isRegister ? "active" : ""}`}
            onClick={() => {
              setIsRegister(false);
              setError("");
            }}
          >
            Log In
          </button>
          <button
            className={`toggle-btn ${isRegister ? "active" : ""}`}
            onClick={() => {
              setIsRegister(true);
              setError("");
            }}
          >
            Register
          </button>
        </div>

        {/* Error Message */}
        {error && <p className="error-message">{error}</p>}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {isRegister && (
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          )}

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          {isRegister && (
            <>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />

              <select name="role" value={formData.role} onChange={handleChange} required>
                <option value="">Select Role</option>
                <option value="student">Student</option>
                <option value="hostel_owner">Hostel Owner</option>
                <option value="college_admin">College Admin</option>
              </select>

              <input
                type="text"
                name="phone_number"
                placeholder="Phone Number"
                value={formData.phone_number}
                onChange={handleChange}
                required
              />

              <label className="checkbox-group">
                <input
                  type="checkbox"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                />
                I agree to the
                <button
                  type="button"
                  className="read-terms-btn"
                  onClick={() => setShowTerms(true)}
                >
                  Terms and Conditions
                </button>
              </label>
            </>
          )}

          {/* Submit Button */}
          <button type="submit" className="gradient-btn">
            {isRegister ? "Register" : "Log In"}
          </button>
        </form>

        {/* Back to Home Link */}
        <Link to="/" className="back-home">← Back to Home</Link>
      </div>

      {/* Terms & Conditions Modal */}
      {showTerms && (
        <div className="terms-modal">
          <div className="terms-content">
            <h3>Terms & Conditions</h3>
            <ul>
              <li>You must provide accurate personal information.</li>
              <li>Do not share your credentials with others.</li>
              <li>All transactions and bookings are subject to verification.</li>
              <li>Any misuse of the platform will lead to a permanent ban.</li>
            </ul>
            <button onClick={() => setShowTerms(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
