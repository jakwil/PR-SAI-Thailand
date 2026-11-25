import React, { createContext, useContext, useEffect, useState } from 'react';

export type SiteTheme = 'royal' | 'clean';
export type FontScale = 'comfort' | 'large';

interface ThemeContextValue {
  siteTheme: SiteTheme;
  isClean: boolean;
  setSiteTheme: (theme: SiteTheme) => void;
  toggleSiteTheme: () => void;
  fontScale: FontScale;
  isLargeFont: boolean;
  setFontScale: (scale: FontScale) => void;
  toggleFontScale: () => void;
}

const SITE_THEME_KEY = 'sai_site_theme';
const FONT_SCALE_KEY = 'sai_font_scale';

const ThemeContext = createContext<ThemeContextValue>({
  siteTheme: 'royal',
  isClean: false,
  setSiteTheme: () => {},
  toggleSiteTheme: () => {},
  fontScale: 'comfort',
  isLargeFont: false,
  setFontScale: () => {},
  toggleFontScale: () => {},
});

function readStoredTheme(): SiteTheme {
  if (typeof window === 'undefined') return 'royal';
  const stored = window.localStorage.getItem(SITE_THEME_KEY);
  return stored === 'clean' ? 'clean' : 'royal';
}

function readStoredFontScale(): FontScale {
  if (typeof window === 'undefined') return 'comfort';
  const stored = window.localStorage.getItem(FONT_SCALE_KEY);
  return stored === 'large' ? 'large' : 'comfort';
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [siteTheme, setSiteThemeState] = useState<SiteTheme>(readStoredTheme);
  const [fontScale, setFontScaleState] = useState<FontScale>(readStoredFontScale);

  useEffect(() => {
    const root = document.documentElement;
    if (siteTheme === 'clean') {
      root.classList.add('theme-clean');
      root.classList.remove('theme-royal');
      root.style.colorScheme = 'light';
    } else {
      root.classList.add('theme-royal');
      root.classList.remove('theme-clean');
      root.style.colorScheme = 'dark';
    }
    try {
      window.localStorage.setItem(SITE_THEME_KEY, siteTheme);
    } catch {
      // Ignore storage errors
    }
  }, [siteTheme]);

  useEffect(() => {
    const root = document.documentElement;
    if (fontScale === 'large') {
      root.classList.add('font-large');
    } else {
      root.classList.remove('font-large');
    }
    try {
      window.localStorage.setItem(FONT_SCALE_KEY, fontScale);
    } catch {
      // Ignore storage errors
    }
  }, [fontScale]);

  const setSiteTheme = (theme: SiteTheme) => setSiteThemeState(theme);
  const toggleSiteTheme = () =>
    setSiteThemeState((prev) => (prev === 'clean' ? 'royal' : 'clean'));

  const setFontScale = (scale: FontScale) => setFontScaleState(scale);
  const toggleFontScale = () =>
    setFontScaleState((prev) => (prev === 'large' ? 'comfort' : 'large'));

  return (
    <ThemeContext.Provider
      value={{
        siteTheme,
        isClean: siteTheme === 'clean',
        setSiteTheme,
        toggleSiteTheme,
        fontScale,
        isLargeFont: fontScale === 'large',
        setFontScale,
        toggleFontScale,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export function useSiteTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
