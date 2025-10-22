// Tokens de design - cores, espaçamentos, tipografia

// Tema Claro
export const lightColors = {
  primary: '#2C3E50',
  secondary: '#34495E',
  accent: '#5D6D7E',
  
  background: '#F8F9FA',
  surface: '#FFFFFF',
  surfaceLight: '#FAFBFC',
  surfaceHover: '#F1F3F5',
  
  text: '#212529',
  textSecondary: '#6C757D',
  textMuted: '#ADB5BD',
  
  success: '#52C41A',
  warning: '#FAAD14',
  error: '#F5222D',
  info: '#1890FF',
  
  border: '#E9ECEF',
  divider: '#F1F3F5',
  
  overlay: 'rgba(33, 37, 41, 0.5)',
  overlayLight: 'rgba(33, 37, 41, 0.2)',
  
  tabBar: '#FFFFFF',
  tabBarBorder: '#E9ECEF',
};

// Tema Escuro
export const darkColors = {
  primary: '#64B5F6',
  secondary: '#90CAF9',
  accent: '#BBDEFB',
  
  background: '#121212',
  surface: '#1E1E1E',
  surfaceLight: '#2A2A2A',
  surfaceHover: '#333333',
  
  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
  textMuted: '#808080',
  
  success: '#66BB6A',
  warning: '#FFA726',
  error: '#EF5350',
  info: '#42A5F5',
  
  border: '#2A2A2A',
  divider: '#2A2A2A',
  
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayLight: 'rgba(0, 0, 0, 0.4)',
  
  tabBar: '#1E1E1E',
  tabBarBorder: '#2A2A2A',
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
