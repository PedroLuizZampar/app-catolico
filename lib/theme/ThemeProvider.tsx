import React, { createContext, useContext, ReactNode } from 'react';
import { getColors, spacing, borderRadius, typography, shadows } from './tokens';

interface ThemeContextType {
  colors: ReturnType<typeof getColors>;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  typography: typeof typography;
  shadows: typeof shadows;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Por enquanto usamos o tema claro por padrão (isDark = false).
  // Poderíamos expor uma prop para alternar entre claro/escuro mais tarde.
  const colors = getColors(false);

  const theme: ThemeContextType = {
    colors,
    spacing,
    borderRadius,
    typography,
    shadows,
  };

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
