import { useContext } from "react";
import { UserPreferencesContext } from "../context/UserPreferencesContext";

/**
 * usePreferences Hook
 * Custom hook to access user preferences
 * Usage: const { currency, updatePreference } = usePreferences();
 */
export const usePreferences = () => {
  const context = useContext(UserPreferencesContext);

  if (!context) {
    throw new Error(
      "usePreferences must be used within UserPreferencesProvider",
    );
  }

  return context;
};
