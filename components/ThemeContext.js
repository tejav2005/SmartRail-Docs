import React, { createContext, useState, useContext } from 'react';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';

// ─── LIGHT THEME ────────────────────────────────────────────────────────────
const MyLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary:    '#0056b3',
    primaryDark:'#003d80',
    accent:     '#1a7ee0',
    background: '#F0F4F8',
    surface:    '#FFFFFF',
    card:       '#FFFFFF',
    text:       '#1A1A2E',
    subText:    '#6B7280',
    border:     '#E5E7EB',
    muted:      '#9CA3AF',
    danger:     '#EF4444',
    success:    '#22C55E',
    warning:    '#F59E0B',
    urgent:     '#EF4444',
    shadow:     '#000000',
    tabBar:     '#FFFFFF',
    inputBg:    '#F9FAFB',
  },
};

// ─── DARK THEME ─────────────────────────────────────────────────────────────
const MyDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary:    '#4dabf7',
    primaryDark:'#1a7ee0',
    accent:     '#60b8ff',
    background: '#0F172A',
    surface:    '#1E293B',
    card:       '#1E293B',
    text:       '#F1F5F9',
    subText:    '#94A3B8',
    border:     '#334155',
    muted:      '#64748B',
    danger:     '#F87171',
    success:    '#4ADE80',
    warning:    '#FCD34D',
    urgent:     '#F87171',
    shadow:     '#000000',
    tabBar:     '#1E293B',
    inputBg:    '#0F172A',
  },
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const toggleTheme = () => setIsDarkMode(prev => !prev);
  const theme = isDarkMode ? MyDarkTheme : MyLightTheme;

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);