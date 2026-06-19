import React, { useEffect } from 'react';

export default function ThemeSwitcher() {
  const toggleTheme = () => {
    const html = document.documentElement;
    const isDarkMode = html.classList.contains('dark-mode');
    if (isDarkMode) {
      html.classList.remove('dark-mode');
      html.classList.add('light-mode');
      localStorage.setItem('theme', 'light');
    } else {
      html.classList.remove('light-mode');
      html.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    }
  };

  // Set the initial theme when the component loads
  useEffect(() => {
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme) {
      document.documentElement.classList.add(currentTheme + '-mode');
    } else {
      // Default to dark mode if no theme is set
      document.documentElement.classList.add('dark-mode');
    }
  }, []);

  return (
    <div className="theme-switch-wrapper">
      <label className="theme-switch" htmlFor="theme-checkbox">
        <input 
          type="checkbox" 
          id="theme-checkbox" 
          onChange={toggleTheme} 
          // Set the toggle's initial state based on the theme
          defaultChecked={localStorage.getItem('theme') !== 'light'} 
        />
        <div className="slider"></div>
      </label>
    </div>
  );
};
