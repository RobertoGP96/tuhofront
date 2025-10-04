// Re-export all styled components from main styles
export * from './styles';

// Create consolidated theme object
export const theme = {
  colors: {
    primary: '#23305b',
    secondary: '#96bd22', 
    accent: '#2d3e75',
    background: '#f3f4f6',
    btn: 'rgb(191, 187, 187)'
  },
  fonts: {
    museo500: 'Museo Sans 500',
    museo300: 'Museo Sans 300',
    sinkinRegular: 'SinkinSans-400Regular',
    sinkinBold: 'SinkinSans-700Bold'
  }
} as const;

export type Theme = typeof theme;