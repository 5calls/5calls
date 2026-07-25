import React, { useState, useEffect } from 'react';

interface ThemeToggleProps {
  className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = 'theme-toggle' }) => {
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light');
  const THEME_KEY = '5calls-theme';

  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_KEY) as 'light' | 'dark' | null;

    let initialTheme: 'light' | 'dark';
    if (savedTheme) {
      initialTheme = savedTheme;
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      initialTheme = 'dark';
    } else {
      initialTheme = 'light';
    }

    setCurrentTheme(initialTheme);
    document.documentElement.setAttribute('data-theme', initialTheme);

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      // Only update if user hasn't manually set a preference
      if (!localStorage.getItem(THEME_KEY)) {
        const newTheme = e.matches ? 'dark' : 'light';
        setCurrentTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, []);

  const toggleTheme = () => {
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setCurrentTheme(newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <button
      className={className}
      onClick={toggleTheme}
      aria-label="Toggle theme"
      title="Toggle between light and dark mode"
    >
      <i className={`fa fa-${currentTheme === 'dark' ? 'sun' : 'moon'}`}></i>
      <span>Theme</span>
    </button>
  );
};

export default ThemeToggle;
