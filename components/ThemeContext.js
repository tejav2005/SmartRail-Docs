import React, { createContext, useState, useContext } from 'react';
import { useColorScheme } from 'react-native';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';

// Define Custom Dark Theme Colors
const MyDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#4dabf7', // Lighter blue for dark mode
    background: '#121212', // Main App Background (Black/Dark Gray)
    card: '#1e1e1e',       // Card/Box Background (Dark Gray)
    text: '#e0e0e0',       // Main Text (Off-white)
    border: '#333333',     // Border Lines
  },
};

// Define Custom Light Theme Colors
const MyLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#0056b3', // KMRL Blue
    background: '#f8f9fa', // Main App Background (Light Gray)
    card: '#ffffff',       // Card/Box Background (White)
    text: '#000000',       // Main Text (Black)
  },
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const theme = isDarkMode ? MyDarkTheme : MyLightTheme;

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);