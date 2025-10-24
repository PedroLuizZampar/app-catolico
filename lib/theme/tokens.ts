// Tokens de design - cores, espaçamentos, tipografia

// Tema Claro
export const lightColors = {
  primary: '#4A7BA7',
  secondary: '#5A8FC4',
  accent: '#6BA0D1',
  
  background: '#FFFFFF',
  surface: '#F7F8FA',
  surfaceLight: '#EFF1F5',
  surfaceHover: '#E8EAEF',
  
  text: '#1A1A1A',
  textSecondary: '#5A5A5A',
  textMuted: '#8A8A8A',
  
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
  
  border: '#D5DCE3',
  divider: '#EFF1F5',
  
  overlay: 'rgba(26, 26, 26, 0.5)',
  overlayLight: 'rgba(26, 26, 26, 0.2)',
  
  tabBar: '#FFFFFF',
  tabBarBorder: '#D5DCE3',
};

// Tema Escuro
export const darkColors = {
  primary: '#5B9FD1',
  secondary: '#6BA0D1',
  accent: '#7BB0E0',
  
  background: '#0F1419',
  surface: '#1A1F2E',
  surfaceLight: '#232A3B',
  surfaceHover: '#2D3547',
  
  text: '#E5E9F0',
  textSecondary: '#A0A5B0',
  textMuted: '#707580',
  
  success: '#66BB6A',
  warning: '#FFA726',
  error: '#EF5350',
  info: '#42A5F5',
  
  border: '#2D3547',
  divider: '#232A3B',
  
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayLight: 'rgba(0, 0, 0, 0.4)',
  
  tabBar: '#1A1F2E',
  tabBarBorder: '#2D3547',
};

// Helper para obter cores do tema atual
export const getColors = (isDark: boolean) => isDark ? darkColors : lightColors;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 9999,
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: '300' as const,
    lineHeight: 42,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 26,
    fontWeight: '400' as const,
    lineHeight: 36,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 22,
    fontWeight: '400' as const,
    lineHeight: 32,
    letterSpacing: -0.2,
  },
  h4: {
    fontSize: 18,
    fontWeight: '500' as const,
    lineHeight: 26,
  },
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodyLarge: {
    fontSize: 17,
    fontWeight: '400' as const,
    lineHeight: 28,
  },
  caption: {
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  small: {
    fontSize: 11,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
};

// Configurações de animação
export const animation = {
  duration: {
    fast: 150,
    normal: 250,
    slow: 350,
  },
  easing: {
    ease: [0.25, 0.1, 0.25, 1],
    easeIn: [0.42, 0, 1, 1],
    easeOut: [0, 0, 0.58, 1],
    easeInOut: [0.42, 0, 0.58, 1],
  },
};

// Sombras minimalistas e sutis
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
};
