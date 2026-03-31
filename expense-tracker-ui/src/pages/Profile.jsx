/**
 * Profile Page - Modern, Responsive Design
 * User profile management and preferences with improved UI/UX
 */
import { useState, useEffect } from "react";
import { useDarkMode } from "../context/DarkModeContext";
import { useAuth } from "../hooks/useAuth";
import { usePreferences } from "../hooks/usePreferences";
import { userService } from "../services/userService";
import { saveAuthData, getToken } from "../services/authService";
import { getCurrencyOptions } from "../utils/currencyUtils";

export default function Profile() {
  const { isDarkMode } = useDarkMode();
  const { user, updateUser } = useAuth();
  const { preferences, updatePreference } = usePreferences();

  // Form states
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [errors, setErrors] = useState({});

  // Profile form state - initialize from context
  const [profileData, setProfileData] = useState({
    email: user?.email || "",
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: user?.phone || "",
    avatar: null,
    avatarPreview: user?.profileImageUrl || null,
  });

  // Password change state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Delete account confirmation state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");

  // Update profile data when user context changes
  useEffect(() => {
    if (user) {
      setProfileData((prev) => ({
        ...prev,
        email: user?.email || prev.email,
        firstName: user?.firstName || prev.firstName,
        lastName: user?.lastName || prev.lastName,
        phone: user?.phone || prev.phone,
        avatarPreview: user?.profileImageUrl || prev.avatarPreview,
      }));
    }
  }, [user]);

  // Load user profile on mount
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const profile = await userService.getProfile();
      setProfileData((prev) => ({
        ...prev,
        email: profile.email || prev.email,
        firstName: profile.firstName || prev.firstName,
        lastName: profile.lastName || prev.lastName,
        phone: profile.phone || prev.phone,
        avatarPreview: profile.profileImageUrl || prev.avatarPreview,
      }));

      // Also update the user context if profileImageUrl is returned
      if (profile.profileImageUrl && user) {
        const updatedUser = {
          ...user,
          profileImageUrl: profile.profileImageUrl,
        };
        updateUser(updatedUser);
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
    }
  };

  // Validate profile form
  const validateProfileForm = () => {
    const newErrors = {};

    if (!profileData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (profileData.phone && !/^[\d\s\-+()]+$/.test(profileData.phone)) {
      newErrors.phone = "Invalid phone format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate password form
  const validatePasswordForm = () => {
    const newErrors = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle avatar upload
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setErrors({ avatar: "Please select an image file" });
        return;
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setErrors({ avatar: "Image size must be less than 2MB" });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData({
          ...profileData,
          avatar: file,
          avatarPreview: reader.result,
        });
        setErrors({});
      };
      reader.readAsDataURL(file);
    }
  };

  // Save profile changes
  const handleSaveProfile = async (e) => {
    e.preventDefault();

    if (!validateProfileForm()) {
      return;
    }

    setIsSaving(true);
    setSaveMessage("");

    try {
      // Prepare data including the avatar
      const dataToSave = {
        email: profileData.email,
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phone: profileData.phone,
        profileImageUrl: profileData.avatarPreview, // Send the base64 avatar as profileImageUrl
      };

      const updatedProfile = await userService.updateProfile(dataToSave);

      const updatedUser = {
        ...user,
        email: updatedProfile.email,
        firstName: updatedProfile.firstName,
        lastName: updatedProfile.lastName,
        phone: updatedProfile.phone,
        profileImageUrl:
          updatedProfile.profileImageUrl || user?.profileImageUrl,
      };

      // Update auth context with new profile data
      updateUser(updatedUser);

      // Save to localStorage
      const token = getToken();
      saveAuthData(token, updatedUser);

      setSaveMessage("✅ Profile updated successfully!");
      setIsEditMode(false);
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (error) {
      setSaveMessage(`❌ Failed to save profile: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle password change
  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!validatePasswordForm()) {
      return;
    }

    setIsSaving(true);

    try {
      await userService.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword,
      );
      setSaveMessage("✅ Password changed successfully!");
      setShowPasswordModal(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (error) {
      setSaveMessage(`❌ Failed to change password: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async (e) => {
    e.preventDefault();

    if (!deletePassword) {
      setErrors({ deletePassword: "Password is required" });
      return;
    }

    setIsSaving(true);

    try {
      await userService.deleteAccount(deletePassword);
      // User should be redirected to login by the service
      window.location.href = "/login";
    } catch (error) {
      setSaveMessage(`❌ Failed to delete account: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle currency change
  const handleCurrencyChange = (e) => {
    updatePreference("currency", e.target.value);
  };

  return (
    <div
      className={`min-h-screen w-full transition-colors ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950"
          : "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Page Header */}
        <div className="mb-10 lg:mb-12">
          <h1
            className={`text-4xl lg:text-5xl font-bold mb-3 ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Account Settings
          </h1>
          <p
            className={`text-lg ${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Manage your profile information and preferences
          </p>
        </div>

        {/* Alert Messages */}
        {saveMessage && (
          <div
            className={`mb-6 p-4 rounded-lg border-l-4 transition-all ${
              saveMessage.includes("✅")
                ? isDarkMode
                  ? "bg-green-900/30 border-green-500 text-green-300"
                  : "bg-green-50 border-green-500 text-green-700"
                : isDarkMode
                  ? "bg-red-900/30 border-red-500 text-red-300"
                  : "bg-red-50 border-red-500 text-red-700"
            }`}
          >
            <p className="font-medium text-base">{saveMessage}</p>
          </div>
        )}

        {/* Two-Column Layout: Profile & Preferences */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
          {/* Profile Card */}
          <div
            className={`rounded-2xl p-8 transition-colors border-t-4 shadow-xl ${
              isDarkMode
                ? "bg-gray-800/80 border-blue-500"
                : "bg-white/95 border-blue-600"
            }`}
          >
            {/* Card Header */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-6">
                <div
                  className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl font-bold shadow-lg overflow-hidden ${
                    isDarkMode
                      ? "bg-gradient-to-br from-blue-500 to-blue-600"
                      : "bg-gradient-to-br from-blue-500 to-indigo-600"
                  } text-white`}
                >
                  {isEditMode && profileData.avatarPreview ? (
                    <img
                      src={profileData.avatarPreview}
                      alt="Avatar"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : profileData.avatarPreview && !isEditMode ? (
                    <img
                      src={profileData.avatarPreview}
                      alt="Avatar"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : profileData.firstName ? (
                    profileData.firstName[0].toUpperCase()
                  ) : (
                    "👤"
                  )}
                </div>
                <div>
                  <h2
                    className={`text-3xl font-bold mb-1 ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {isEditMode ? "Edit Profile" : "Your Profile"}
                  </h2>
                  <p
                    className={`text-sm ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {isEditMode
                      ? "Update your information"
                      : "View and manage your account"}
                  </p>
                </div>
              </div>
            </div>

            {isEditMode ? (
              // Edit Profile Form
              <form onSubmit={handleSaveProfile} className="space-y-6">
                {/* Avatar Upload */}
                <div>
                  <label
                    className={`block text-sm font-semibold mb-3 ${
                      isDarkMode ? "text-gray-200" : "text-gray-800"
                    }`}
                  >
                    Profile Picture
                  </label>
                  <div
                    className={`flex flex-col items-center gap-4 p-6 border-2 border-dashed rounded-xl transition-colors cursor-pointer ${
                      isDarkMode
                        ? "border-gray-600 bg-gray-700/30 hover:bg-gray-700/50"
                        : "border-gray-300 bg-gray-50 hover:bg-gray-100"
                    }`}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                      id="avatarInput"
                    />
                    <label
                      htmlFor="avatarInput"
                      className="cursor-pointer text-center"
                    >
                      <p className="text-3xl mb-2">📸</p>
                      <p
                        className={`font-medium ${
                          isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Click to upload image
                      </p>
                      <p
                        className={`text-xs mt-1 ${
                          isDarkMode ? "text-gray-500" : "text-gray-500"
                        }`}
                      >
                        Max 2MB • JPG, PNG, GIF
                      </p>
                    </label>
                  </div>
                  {errors.avatar && (
                    <p className="text-red-500 text-sm mt-2">{errors.avatar}</p>
                  )}
                </div>

                {/* Form Fields */}
                <div className="space-y-5">
                  {/* Email */}
                  <div>
                    <label
                      className={`block text-sm font-semibold mb-2 ${
                        isDarkMode ? "text-gray-200" : "text-gray-800"
                      }`}
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="your.email@example.com"
                      value={profileData.email}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          email: e.target.value,
                        })
                      }
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors text-base ${
                        errors.email ? "border-red-500" : ""
                      } ${
                        isDarkMode
                          ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-blue-500"
                          : "border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-blue-500"
                      }`}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* First Name & Last Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        className={`block text-sm font-semibold mb-2 ${
                          isDarkMode ? "text-gray-200" : "text-gray-800"
                        }`}
                      >
                        First Name
                      </label>
                      <input
                        type="text"
                        placeholder="John"
                        value={profileData.firstName}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            firstName: e.target.value,
                          })
                        }
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors text-base ${
                          isDarkMode
                            ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-blue-500"
                            : "border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-blue-500"
                        }`}
                      />
                    </div>
                    <div>
                      <label
                        className={`block text-sm font-semibold mb-2 ${
                          isDarkMode ? "text-gray-200" : "text-gray-800"
                        }`}
                      >
                        Last Name
                      </label>
                      <input
                        type="text"
                        placeholder="Doe"
                        value={profileData.lastName}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            lastName: e.target.value,
                          })
                        }
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors text-base ${
                          isDarkMode
                            ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-blue-500"
                            : "border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-blue-500"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label
                      className={`block text-sm font-semibold mb-2 ${
                        isDarkMode ? "text-gray-200" : "text-gray-800"
                      }`}
                    >
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={profileData.phone}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          phone: e.target.value,
                        })
                      }
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors text-base ${
                        errors.phone ? "border-red-500" : ""
                      } ${
                        isDarkMode
                          ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-blue-500"
                          : "border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-blue-500"
                      }`}
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.phone}
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    {isSaving ? "💾 Saving..." : "✅ Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditMode(false);
                      loadProfile();
                      setErrors({});
                    }}
                    className={`flex-1 font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl ${
                      isDarkMode
                        ? "bg-gray-700 hover:bg-gray-600 text-white"
                        : "bg-gray-300 hover:bg-gray-400 text-gray-800"
                    }`}
                  >
                    ❌ Cancel
                  </button>
                </div>
              </form>
            ) : (
              // Profile View Mode
              <div className="space-y-5">
                {/* Display Fields */}
                <div className="space-y-4">
                  {/* Email Display */}
                  <div>
                    <label
                      className={`block text-xs font-semibold uppercase tracking-wide mb-2 ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Email Address
                    </label>
                    <p
                      className={`text-lg font-medium ${
                        isDarkMode ? "text-gray-200" : "text-gray-800"
                      }`}
                    >
                      {profileData.email || "Not set"}
                    </p>
                  </div>

                  {/* First Name Display */}
                  <div>
                    <label
                      className={`block text-xs font-semibold uppercase tracking-wide mb-2 ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      First Name
                    </label>
                    <p
                      className={`text-lg font-medium ${
                        isDarkMode ? "text-gray-200" : "text-gray-800"
                      }`}
                    >
                      {profileData.firstName || "Not set"}
                    </p>
                  </div>

                  {/* Last Name Display */}
                  <div>
                    <label
                      className={`block text-xs font-semibold uppercase tracking-wide mb-2 ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Last Name
                    </label>
                    <p
                      className={`text-lg font-medium ${
                        isDarkMode ? "text-gray-200" : "text-gray-800"
                      }`}
                    >
                      {profileData.lastName || "Not set"}
                    </p>
                  </div>

                  {/* Phone Display */}
                  <div>
                    <label
                      className={`block text-xs font-semibold uppercase tracking-wide mb-2 ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Phone Number
                    </label>
                    <p
                      className={`text-lg font-medium ${
                        isDarkMode ? "text-gray-200" : "text-gray-800"
                      }`}
                    >
                      {profileData.phone || "Not set"}
                    </p>
                  </div>
                </div>

                {/* Edit Button */}
                <button
                  onClick={() => setIsEditMode(true)}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl mt-6"
                >
                  ✍️ Edit Profile
                </button>
              </div>
            )}
          </div>

          {/* Preferences Card */}
          <div
            className={`rounded-2xl p-8 transition-colors border-t-4 shadow-xl ${
              isDarkMode
                ? "bg-gray-800/80 border-purple-500"
                : "bg-white/95 border-purple-600"
            }`}
          >
            {/* Card Header */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-6">
                <div
                  className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl font-bold shadow-lg bg-gradient-to-br from-purple-500 to-pink-600 text-white`}
                >
                  ⚙️
                </div>
                <div>
                  <h2
                    className={`text-3xl font-bold mb-1 ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Preferences
                  </h2>
                  <p
                    className={`text-sm ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Customize your application experience
                  </p>
                </div>
              </div>
            </div>

            {/* Preferences Content */}
            <div className="space-y-6">
              {/* Currency Selection */}
              <div>
                <label
                  htmlFor="currency"
                  className={`block text-sm font-semibold mb-3 ${
                    isDarkMode ? "text-gray-200" : "text-gray-800"
                  }`}
                >
                  💱 Preferred Currency
                </label>
                <select
                  id="currency"
                  value={preferences.currency}
                  onChange={handleCurrencyChange}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors text-base ${
                    isDarkMode
                      ? "border-gray-600 bg-gray-700 text-white focus:border-purple-500"
                      : "border-gray-300 bg-white text-gray-900 focus:border-purple-500"
                  }`}
                >
                  {getCurrencyOptions().map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Format Selection */}
              <div>
                <label
                  htmlFor="dateFormat"
                  className={`block text-sm font-semibold mb-3 ${
                    isDarkMode ? "text-gray-200" : "text-gray-800"
                  }`}
                >
                  📅 Date Format
                </label>
                <select
                  id="dateFormat"
                  value={preferences.dateFormat}
                  onChange={(e) =>
                    updatePreference("dateFormat", e.target.value)
                  }
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors text-base ${
                    isDarkMode
                      ? "border-gray-600 bg-gray-700 text-white focus:border-purple-500"
                      : "border-gray-300 bg-white text-gray-900 focus:border-purple-500"
                  }`}
                >
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>

              {/* Info Box */}
              <div
                className={`p-4 rounded-lg border-l-4 transition-colors ${
                  isDarkMode
                    ? "bg-blue-900/20 border-blue-400"
                    : "bg-blue-50 border-blue-500"
                }`}
              >
                <p
                  className={`text-sm ${
                    isDarkMode ? "text-blue-300" : "text-blue-700"
                  }`}
                >
                  <strong>💡 Tip:</strong> Your preferences are automatically
                  saved to your device
                </p>
              </div>

              {/* Security & Account Actions */}
              <div
                className="flex flex-col sm:flex-row gap-3 pt-6 border-t-2"
                style={{
                  borderColor: isDarkMode ? "#374151" : "#e5e7eb",
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(true)}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  🔐 Change Password
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className="flex-1 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  🗑️ Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div
            className={`rounded-2xl shadow-2xl max-w-md w-full p-8 ${
              isDarkMode
                ? "bg-gradient-to-br from-gray-800 to-gray-900"
                : "bg-white"
            }`}
          >
            <h3
              className={`text-2xl font-bold mb-6 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              🔐 Change Password
            </h3>

            <form onSubmit={handleChangePassword} className="space-y-5">
              {/* Current Password */}
              <div>
                <label
                  className={`block text-sm font-semibold mb-2 ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      currentPassword: e.target.value,
                    })
                  }
                  className={`w-full px-4 py-3 border-2 rounded-lg text-base transition ${
                    errors.currentPassword ? "border-red-500" : ""
                  } ${
                    isDarkMode
                      ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-blue-500"
                      : "border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-blue-500"
                  }`}
                />
                {errors.currentPassword && (
                  <p className="text-red-500 text-sm mt-2">
                    {errors.currentPassword}
                  </p>
                )}
              </div>

              {/* New Password */}
              <div>
                <label
                  className={`block text-sm font-semibold mb-2 ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                  className={`w-full px-4 py-3 border-2 rounded-lg text-base transition ${
                    errors.newPassword ? "border-red-500" : ""
                  } ${
                    isDarkMode
                      ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-blue-500"
                      : "border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-blue-500"
                  }`}
                />
                {errors.newPassword && (
                  <p className="text-red-500 text-sm mt-2">
                    {errors.newPassword}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  className={`block text-sm font-semibold mb-2 ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className={`w-full px-4 py-3 border-2 rounded-lg text-base transition ${
                    errors.confirmPassword ? "border-red-500" : ""
                  } ${
                    isDarkMode
                      ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-blue-500"
                      : "border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-blue-500"
                  }`}
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-2">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Modal Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-all duration-200"
                >
                  {isSaving ? "Updating..." : "Update Password"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordData({
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                    });
                    setErrors({});
                  }}
                  className={`flex-1 font-semibold py-3 rounded-lg transition-all duration-200 ${
                    isDarkMode
                      ? "bg-gray-700 hover:bg-gray-600 text-white"
                      : "bg-gray-300 hover:bg-gray-400 text-gray-800"
                  }`}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div
            className={`rounded-2xl shadow-2xl max-w-md w-full p-8 ${
              isDarkMode
                ? "bg-gradient-to-br from-gray-800 to-gray-900"
                : "bg-white"
            }`}
          >
            <h3
              className={`text-2xl font-bold mb-4 flex items-center gap-2 ${
                isDarkMode ? "text-red-400" : "text-red-600"
              }`}
            >
              ⚠️ Delete Account
            </h3>

            <p
              className={`mb-6 text-base ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
            >
              This action cannot be undone. All your data will be permanently
              deleted. Please enter your password to confirm.
            </p>

            <form onSubmit={handleDeleteAccount} className="space-y-5">
              <div>
                <label
                  className={`block text-sm font-semibold mb-2 ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-lg text-base transition ${
                    errors.deletePassword ? "border-red-500" : ""
                  } ${
                    isDarkMode
                      ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-red-500"
                      : "border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-red-500"
                  }`}
                />
                {errors.deletePassword && (
                  <p className="text-red-500 text-sm mt-2">
                    {errors.deletePassword}
                  </p>
                )}
              </div>

              {/* Modal Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-all duration-200"
                >
                  {isSaving ? "Deleting..." : "Delete Account"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletePassword("");
                    setErrors({});
                  }}
                  className={`flex-1 font-semibold py-3 rounded-lg transition-all duration-200 ${
                    isDarkMode
                      ? "bg-gray-700 hover:bg-gray-600 text-white"
                      : "bg-gray-300 hover:bg-gray-400 text-gray-800"
                  }`}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
