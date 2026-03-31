import { createContext, useState, useEffect } from "react";

/**
 * UserPreferencesContext
 * Manages user preferences including currency and other settings
 * Persists to localStorage for offline access
 */
export const UserPreferencesContext = createContext();

export const UserPreferencesProvider = ({ children }) => {
  // Default preferences
  const DEFAULT_PREFERENCES = {
    currency: "PLN",
    dateFormat: "MM/DD/YYYY",
    language: "en",
  };

  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("userPreferences");
      if (stored) {
        setPreferences(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load preferences:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save preferences to localStorage whenever they change
  const updatePreferences = (newPreferences) => {
    try {
      const updated = { ...preferences, ...newPreferences };
      setPreferences(updated);
      localStorage.setItem("userPreferences", JSON.stringify(updated));
    } catch (error) {
      console.error("Failed to save preferences:", error);
    }
  };

  // Update single preference
  const updatePreference = (key, value) => {
    updatePreferences({ [key]: value });
  };

  // Reset to defaults
  const resetPreferences = () => {
    setPreferences(DEFAULT_PREFERENCES);
    localStorage.removeItem("userPreferences");
  };

  const value = {
    preferences,
    updatePreferences,
    updatePreference,
    resetPreferences,
    loading,
    currency: preferences.currency,
    dateFormat: preferences.dateFormat,
    language: preferences.language,
  };

  return (
    <UserPreferencesContext.Provider value={value}>
      {children}
    </UserPreferencesContext.Provider>
  );
};
