import { useState, useEffect } from 'react';

export function useTheme() {
  const [theme, setTheme] = useState(() => localStorage.getItem('kronos_theme') || 'cyber-cyan');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('kronos_theme', theme);
  }, [theme]);

  return [theme, setTheme];
}
