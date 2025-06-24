import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiUser, FiLogOut } from "react-icons/fi"; // Importing icons
import api from "../utils/api"; // Import the shared API instance

const UserInfo = ({ user }) => {
  // Crucial null check: If user is null, don't render any hooks or JSX
  // This must be the very first executable line to follow Rules of Hooks
  if (!user) {
    return null;
  }

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(null); // New state for photo URL
  const [userName, setUserName] = useState(null); // New state for user's name
  const [isImageModalOpen, setIsImageModalToOpen] = useState(false); // New state for image modal
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [showAiModal, setShowAiModal] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user"); // Clear user data as well
    navigate("/login"); // Redirect to login page
  };

  const handleEditProfile = () => {
    navigate("/edit-profile");
    setDropdownOpen(false);
  };

  const toggleImageModal = () => {
    setIsImageModalToOpen(!isImageModalOpen);
  };

  const handleAiSuggestion = async () => {
    try {
      // Try to get salary from user object or fallback
      const salary = user?.salary || 0;
      const response = await api.get(
        `/AiChat/getaisuggestionforfinancial?salary=${salary}`
      );
      setAiSuggestion(response.data.suggestion || "No suggestion found.");
      setShowAiModal(true);
    } catch (error) {
      setAiSuggestion("Failed to fetch suggestion.");
      setShowAiModal(true);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch profile photo and user info
  useEffect(() => {
    const fetchProfilePhoto = async () => {
      if (user && user.token) {
        try {
          const response = await api.get("/User/GetPhoto", {
            responseType: "blob",
          });
          if (response.data && response.data.size > 0) {
            const imageUrl = URL.createObjectURL(response.data);
            setProfilePhotoUrl(imageUrl);
          } else {
            setProfilePhotoUrl(null);
          }
        } catch (error) {
          setProfilePhotoUrl(null);
        }
      } else {
        setProfilePhotoUrl(null);
      }
    };

    const fetchUserName = async () => {
      if (user && user.token) {
        try {
          const response = await api.get("/User/UserInformation");
          if (response.data) {
            const { firstName, lastName } = response.data;
            setUserName(`${firstName || ""} ${lastName || ""}`.trim());
          }
        } catch (error) {
          console.error("Error fetching user name:", error);
          setUserName(user?.email || "User"); // Fallback to email or "User"
        }
      } else {
        setUserName(null); // Clear name if user is not logged in
      }
    };

    fetchProfilePhoto();
    fetchUserName(); // Call the new function

    return () => {
      if (profilePhotoUrl) {
        URL.revokeObjectURL(profilePhotoUrl);
      }
    };
  }, [user]); // Removed profilePhotoUrl from dependencies to avoid infinite loop

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center space-x-2 text-white hover:text-blue-400 transition-colors focus:outline-none"
      >
        <div
          onClick={toggleImageModal}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold overflow-hidden cursor-pointer"
        >
          {profilePhotoUrl ? (
            <img
              src={profilePhotoUrl}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : userName ? (
            userName.charAt(0).toUpperCase()
          ) : user?.email ? (
            user.email.charAt(0).toUpperCase()
          ) : (
            "U"
          )}
        </div>
        <span className="hidden sm:inline">
          {userName || user?.email || "User"}
        </span>
        {/* Salary display with AI suggestion button */}
        {user?.salary !== undefined && (
          <span className="ml-2 flex items-center text-sm text-gray-300">
            Salary:{" "}
            <span className="font-bold text-white ml-1">{user.salary}</span>
            <button
              onClick={handleAiSuggestion}
              className="ml-2 px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 focus:outline-none"
              title="Get AI Suggestion"
              type="button"
            >
              AI Suggest
            </button>
          </span>
        )}
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-[#1a1a1a] rounded-md shadow-lg py-1 z-50">
          <button
            onClick={handleEditProfile}
            className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-blue-600 hover:text-white w-full text-left"
          >
            <FiUser className="mr-2" /> Edit Profile
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-red-700 hover:text-white w-full text-left"
          >
            <FiLogOut className="mr-2" /> Logout
          </button>
        </div>
      )}

      {/* Image Modal */}
      {isImageModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[100]"
          onClick={toggleImageModal}
        >
          <div
            className="relative p-4 max-w-full max-h-full bg-gray-800 rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={toggleImageModal}
              className="absolute top-2 right-2 text-white text-3xl font-bold p-2 rounded-full hover:bg-gray-700 transition-colors"
            >
              &times;
            </button>
            {profilePhotoUrl ? (
              <img
                src={profilePhotoUrl}
                alt="Profile Large"
                className="max-w-full max-h-[80vh] object-contain"
              />
            ) : userName ? (
              <div className="flex items-center justify-center text-white text-9xl">
                {userName.charAt(0).toUpperCase()}
              </div>
            ) : user?.email ? (
              <div className="flex items-center justify-center text-white text-9xl">
                {user.email.charAt(0).toUpperCase()}
              </div>
            ) : (
              <div className="flex items-center justify-center text-white text-9xl">
                {"U"}
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Suggestion Modal */}
      {showAiModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[200]">
          <div className="bg-white rounded-lg p-6 max-w-md w-full relative">
            <button
              onClick={() => setShowAiModal(false)}
              className="absolute top-2 right-2 text-gray-700 text-2xl font-bold p-1 rounded-full hover:bg-gray-200"
            >
              &times;
            </button>
            <h2 className="text-lg font-semibold mb-2 text-gray-800">
              AI Financial Suggestion
            </h2>
            <div className="text-gray-700 whitespace-pre-line">
              {aiSuggestion}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserInfo;
