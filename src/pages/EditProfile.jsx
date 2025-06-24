import React, { useState, useContext } from "react";
import {
  FiCamera,
  FiUser,
  FiDollarSign,
  FiFlag,
  FiCalendar,
} from "react-icons/fi";
import api from "../utils/api";
import UserInfoContext from "../Context/User/UserInfoContext";

const EditProfile = () => {
  const { user } = useContext(UserInfoContext);
  const [formData, setFormData] = useState({
    image: null,
    firstName: "",
    lastName: "",
    salary: "",
    savingGoal: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [showAiModal, setShowAiModal] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        image: file,
      }));
    }
  };

  const sendFinancialGoal = async (salary, savingGoal) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!user || !user.token) {
      setError("User not authenticated. Please log in.");
      setLoading(false);
      return;
    }

    try {
      const response = await api.post("/FinancialGoal/SetFinanicalGoal", {
        salary: parseFloat(salary),
        savingGoal: parseFloat(savingGoal),
      });
      setSuccess("Financial goals updated successfully!");
      console.log("Financial goals updated successfully:", response.data);
    } catch (err) {
      console.error("Error updating financial goals:", err);
      if (err.response) {
        setError(err.response.data || "Failed to update financial goals.");
      } else {
        setError(
          "Failed to update financial goals. Network error or server is down."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUserInfo = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!user || !user.token) {
      setError("User not authenticated. Please log in.");
      setLoading(false);
      return;
    }

    try {
      const response = await api.put("/User/UpdateInfo", {
        fname: formData.firstName,
        lname: formData.lastName,
      });
      setSuccess("Profile information updated successfully!");
      console.log("Profile information updated successfully:", response.data);
    } catch (err) {
      console.error("Error updating profile information:", err);
      if (err.response) {
        setError(err.response.data || "Failed to update profile information.");
      } else {
        setError(
          "Failed to update profile information. Network error or server is down."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePhoto = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!user || !user.token) {
      setError("User not authenticated. Please log in.");
      setLoading(false);
      return;
    }
    if (!formData.image) {
      setError("Please select an image to upload.");
      setLoading(false);
      return;
    }

    const photoFormData = new FormData();
    photoFormData.append("file", formData.image);

    try {
      const response = await api.put("/User/AddPhoto", photoFormData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setSuccess("Profile photo updated successfully!");
      console.log("Profile photo updated successfully:", response.data);
    } catch (err) {
      console.error("Error updating profile photo:", err);
      if (err.response) {
        setError(err.response.data || "Failed to update profile photo.");
      } else {
        setError(
          "Failed to update profile photo. Network error or server is down."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSetFinancialGoal = async () => {
    await sendFinancialGoal(formData.salary, formData.savingGoal);
  };

  const handleUpdateFinancialGoal = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!user || !user.token) {
      setError("User not authenticated. Please log in.");
      setLoading(false);
      return;
    }

    try {
      const response = await api.put("/FinancialGoal/UpdateFinancialGoal", {
        salary: parseFloat(formData.salary),
        savingGoal: parseFloat(formData.savingGoal),
      });
      setSuccess("Financial goals updated successfully!");
      console.log("Financial goals updated successfully:", response.data);
    } catch (err) {
      console.error("Error updating financial goals:", err);
      if (err.response) {
        setError(err.response.data || "Failed to update financial goals.");
      } else {
        setError(
          "Failed to update financial goals. Network error or server is down."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAiSuggestion = async () => {
    try {
      const salary = formData.salary || 0;
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

  return (
    <div className="flex-1 p-4 md:p-6 space-y-6">
      <h2 className="text-2xl font-semibold mb-6 text-center text-white">
        Edit Your Account
      </h2>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded-md">
          {typeof error === "object" ? (
            error.response?.data?.errors ? (
              Object.entries(error.response.data.errors).map(
                ([field, fieldErrors]) => (
                  <p key={field}>
                    <strong>{field}:</strong> {fieldErrors.join(", ")}
                  </p>
                )
              )
            ) : error.response?.data?.message ? (
              <p>{error.response.data.message}</p>
            ) : error.response?.data?.title ? (
              <p>{error.response.data.title}</p>
            ) : (
              <p>{error.message || "An unknown error occurred."}</p>
            )
          ) : (
            <p>{error}</p>
          )}
        </div>
      )}
      {success && (
        <div className="bg-green-500/10 border border-green-500 text-green-500 px-4 py-2 rounded-md">
          {success}
        </div>
      )}

      {/* Update Names Form */}
      <form
        onSubmit={(e) => e.preventDefault()}
        className="max-w-md mx-auto space-y-6 bg-[#1E1E1E] p-6 rounded-lg shadow-md"
      >
        <h3 className="text-xl font-semibold text-white mb-4">
          Update Personal Information
        </h3>
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
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              placeholder="First Name"
              className="pl-10 block w-full bg-[#2A2A2A] text-white border-gray-700 rounded-md shadow-sm p-2 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Last Name Input */}
        <div>
          <label htmlFor="lastName" className="sr-only">
            Last Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiUser className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              placeholder="Last Name"
              className="pl-10 block w-full bg-[#2A2A2A] text-white border-gray-700 rounded-md shadow-sm p-2 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleUpdateUserInfo}
          className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? "Updating Profile..." : "Update Profile Info"}
        </button>
      </form>

      {/* Financial Goals Form */}
      <form
        onSubmit={(e) => e.preventDefault()}
        className="max-w-md mx-auto space-y-6 bg-[#1E1E1E] p-6 rounded-lg shadow-md"
      >
        <h3 className="text-xl font-semibold text-white mb-4">
          Set/Update Financial Goals
        </h3>
        {/* Salary Input */}
        <div>
          <label htmlFor="salary" className="sr-only">
            Salary
          </label>
          <div className="relative flex items-center">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-lg text-gray-400 font-bold">L.E </span>
            </div>
            <input
              type="number"
              id="salary"
              name="salary"
              value={formData.salary}
              onChange={handleInputChange}
              placeholder="Salary"
              className="pl-10 block w-full bg-[#2A2A2A] text-white border-gray-700 rounded-md shadow-sm p-2 focus:border-blue-500 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={handleAiSuggestion}
              className="ml-2 px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 focus:outline-none"
              title="Get AI Suggestion"
            >
              AI Suggest
            </button>
          </div>
        </div>

        {/* Saving Goal Input */}
        <div>
          <label htmlFor="savingGoal" className="sr-only">
            Saving Goal
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiFlag className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="number"
              id="savingGoal"
              name="savingGoal"
              value={formData.savingGoal}
              onChange={handleInputChange}
              placeholder="saving goal"
              className="pl-10 block w-full bg-[#2A2A2A] text-white border-gray-700 rounded-md shadow-sm p-2 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-between gap-4">
          <button
            type="button"
            onClick={handleSetFinancialGoal}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Setting..." : "Set Financial Goals"}
          </button>
          <button
            type="button"
            onClick={handleUpdateFinancialGoal}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Financial Goals"}
          </button>
        </div>
      </form>

      {/* Update Photo Form */}
      <form
        onSubmit={(e) => e.preventDefault()}
        className="max-w-md mx-auto space-y-6 bg-[#1E1E1E] p-6 rounded-lg shadow-md"
      >
        <h3 className="text-xl font-semibold text-white mb-4">
          Update Profile Photo
        </h3>
        <div>
          <label
            htmlFor="profileImage"
            className="block text-sm font-medium text-gray-400 mb-1"
          >
            <div className="flex items-center space-x-2 bg-[#2A2A2A] text-white border-gray-700 rounded-md shadow-sm p-2 cursor-pointer hover:bg-[#3A3A3A] transition-colors">
              <FiCamera className="w-5 h-5" />
              <span>
                {formData.image ? formData.image.name : "Choose an Image"}
              </span>
            </div>
          </label>
          <input
            type="file"
            id="profileImage"
            name="image"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
        <button
          type="button"
          onClick={handleUpdatePhoto}
          className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? "Uploading Photo..." : "Update Photo"}
        </button>
      </form>

      {/* AI Suggestion Modal */}
      {showAiModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[200]">
          <div className="bg-[#18181b] rounded-lg p-6 max-w-md w-full relative border border-gray-700">
            <button
              onClick={() => setShowAiModal(false)}
              className="absolute top-2 right-2 text-gray-300 text-2xl font-bold p-1 rounded-full hover:bg-gray-800"
            >
              &times;
            </button>
            <h2 className="text-lg font-semibold mb-2 text-white">
              AI Financial Suggestion
            </h2>
            <div className="text-white whitespace-pre-line">{aiSuggestion}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditProfile;
