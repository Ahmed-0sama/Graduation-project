import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import axios from "axios";

// Create axios instance with default config
const api = axios.create({
  baseURL: "https://ecofy.salmonpond-551ebfc8.italynorth.azurecontainerapps.io",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: false, // Changed to false
});

function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    secondName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(""); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      setLoading(false);
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    // Validate names are not empty
    if (!formData.firstName.trim() || !formData.secondName.trim()) {
      setError("First name and second name are required");
      setLoading(false);
      return;
    }

    try {
      const requestData = {
        lname: formData.secondName.trim(),
        fname: formData.firstName.trim(),
        email: formData.email.trim(),
        password: formData.password,
      };

      console.log("Sending registration request with data:", requestData);

      const response = await fetch("/api/User/Register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(requestData),
      });

      console.log("Response status:", response.status);
      const responseData = await response.json();
      console.log("Response data:", responseData);

      if (response.ok) {
        // Registration successful
        navigate("/login"); // Redirect to login page after successful registration
      } else {
        // Try to get a more specific error message from the response
        const errorMessage =
          responseData.message ||
          responseData.error ||
          `Registration failed with status: ${response.status}`;
        throw new Error(errorMessage);
      }
    } catch (err) {
      console.error("Registration error details:", {
        message: err.message,
        error: err,
      });
      setError(err.message || "Failed to register. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="bg-[#1a1a1a] p-8 rounded-xl shadow-2xl">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Create Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Join us and start managing your tasks
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* First Name Input */}
            <div>
              <label htmlFor="firstName" className="sr-only">
                First Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  className="appearance-none relative block w-full pl-10 px-3 py-3 border border-gray-700 bg-[#2a2a2a] placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Second Name Input */}
            <div>
              <label htmlFor="secondName" className="sr-only">
                Second Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="secondName"
                  name="secondName"
                  type="text"
                  required
                  className="appearance-none relative block w-full pl-10 px-3 py-3 border border-gray-700 bg-[#2a2a2a] placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Second Name"
                  value={formData.secondName}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="appearance-none relative block w-full pl-10 px-3 py-3 border border-gray-700 bg-[#2a2a2a] placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="appearance-none relative block w-full pl-10 pr-10 px-3 py-3 border border-gray-700 bg-[#2a2a2a] placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-300 focus:outline-none"
                  >
                    {showPassword ? (
                      <FiEyeOff className="h-5 w-5" />
                    ) : (
                      <FiEye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div>
              <label htmlFor="confirmPassword" className="sr-only">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  className="appearance-none relative block w-full pl-10 pr-10 px-3 py-3 border border-gray-700 bg-[#2a2a2a] placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-gray-400 hover:text-gray-300 focus:outline-none"
                  >
                    {showConfirmPassword ? (
                      <FiEyeOff className="h-5 w-5" />
                    ) : (
                      <FiEye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-blue-500 hover:text-blue-400"
              >
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SignUp;

// import React, { useState } from "react";
// import "./Signup.css";
// import { FaEnvelope, FaEye, FaEyeSlash } from "react-icons/fa";

// const Signup = () => {
//   const [passwordVisible, setPasswordVisible] = useState(false);
//   const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     password: "",
//     confirmPassword: "",
//   });

//   const togglePasswordVisibility = () => {
//     setPasswordVisible(!passwordVisible);
//   };

//   const toggleConfirmPasswordVisibility = () => {
//     setConfirmPasswordVisible(!confirmPasswordVisible);
//   };

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     console.log("Signup Data:", formData);
//   };

//   return (
//     <div className="signup-container">
//       <h2>SignUp Form</h2>
//       <form onSubmit={handleSubmit}>
//         <div className="input-group">
//           <input
//             type="text"
//             name="name"
//             placeholder="Name"
//             value={formData.name}
//             onChange={handleChange}
//             required
//           />
//         </div>

//         <div className="input-group">
//           <input
//             type="email"
//             name="email"
//             placeholder="Email"
//             value={formData.email}
//             onChange={handleChange}
//             required
//           />
//           <FaEnvelope className="icon" />
//         </div>

//         <div className="input-group">
//           <input
//             type={passwordVisible ? "text" : "password"}
//             name="password"
//             placeholder="Password"
//             value={formData.password}
//             onChange={handleChange}
//             required
//           />
//           {passwordVisible ? (
//             <FaEyeSlash className="icon" onClick={togglePasswordVisibility} />
//           ) : (
//             <FaEye className="icon" onClick={togglePasswordVisibility} />
//           )}
//         </div>

//         <div className="input-group">
//           <input
//             type={confirmPasswordVisible ? "text" : "password"}
//             name="confirmPassword"
//             placeholder="Confirm Password"
//             value={formData.confirmPassword}
//             onChange={handleChange}
//             required
//           />
//           {confirmPasswordVisible ? (
//             <FaEyeSlash className="icon" onClick={toggleConfirmPasswordVisibility} />
//           ) : (
//             <FaEye className="icon" onClick={toggleConfirmPasswordVisibility} />
//           )}
//         </div>

//         <button type="submit" className="signup-btn">
//           Signup
//         </button>
//       </form>
//     </div>
//   );
// };

// export default Signup;
