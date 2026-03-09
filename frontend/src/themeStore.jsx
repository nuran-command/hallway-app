// src/themeStore.jsx
import React, { createContext, useContext, useState } from "react";

// создаём контекст темы
const ThemeContext = createContext();

// провайдер темы
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("light"); // light или dark

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// хук для удобного использования темы в компонентах
export const useTheme = () => useContext(ThemeContext);