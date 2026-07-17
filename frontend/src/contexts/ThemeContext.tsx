import React, { createContext, useContext, useState, useEffect } from "react";

type Theme = "light" | "dark" | "blue" | "green" | "purple" | "orange";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  primaryColor: string;
  setPrimaryColor: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const themeColors: Record<Theme, { primary: string; gradient: string }> = {
  light: {
    primary: "217 91% 35%",
    gradient: "linear-gradient(135deg, hsl(217 91% 35%), hsl(217 91% 45%))",
  },
  dark: {
    primary: "217 91% 60%",
    gradient: "linear-gradient(135deg, hsl(217 91% 60%), hsl(217 91% 70%))",
  },
  blue: {
    primary: "217 91% 50%",
    gradient: "linear-gradient(135deg, hsl(217 91% 50%), hsl(217 91% 60%))",
  },
  green: {
    primary: "158 64% 45%",
    gradient: "linear-gradient(135deg, hsl(158 64% 45%), hsl(158 64% 55%))",
  },
  purple: {
    primary: "280 65% 60%",
    gradient: "linear-gradient(135deg, hsl(280 65% 60%), hsl(280 65% 70%))",
  },
  orange: {
    primary: "25 95% 53%",
    gradient: "linear-gradient(135deg, hsl(25 95% 53%), hsl(25 95% 63%))",
  },
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem("appTheme");
    return (saved as Theme) || "light";
  });

  const [primaryColor, setPrimaryColorState] = useState<string>(() => {
    const saved = localStorage.getItem("primaryColor");
    return saved || themeColors[theme].primary;
  });

  useEffect(() => {
    localStorage.setItem("appTheme", theme);
    const colors = themeColors[theme];
    setPrimaryColorState(colors.primary);
    
    // Aplicar tema al documento
    document.documentElement.setAttribute("data-theme", theme);
    
    // Actualizar CSS variables
    const root = document.documentElement;
    root.style.setProperty("--primary", colors.primary);
    
    // Aplicar dark mode si es necesario
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const setPrimaryColor = (color: string) => {
    setPrimaryColorState(color);
    localStorage.setItem("primaryColor", color);
    document.documentElement.style.setProperty("--primary", color);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, primaryColor, setPrimaryColor }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

