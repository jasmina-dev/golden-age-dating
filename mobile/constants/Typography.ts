// Typography Constants
// Friendly, approachable rounded sans-serif for casual, vibrant feel
import { Platform } from 'react-native';

export const Typography = {
  // Headlines: MADE Outer Sans for modern, clean typography
  heading: {
    fontFamily: 'MADE Outer Sans',
    fontSize: {
      xl: 32,
      lg: 28,
      md: 24,
      sm: 20,
      xs: 18,
    },
    letterSpacing: 0, // Natural spacing for friendly feel
  },
  
  // Body: MADE Outer Sans for consistent typography
  body: {
    fontFamily: 'MADE Outer Sans',
    fontSize: {
      lg: 18,
      md: 16,
      sm: 14,
      xs: 12,
    },
    lineHeight: {
      lg: 28,
      md: 24,
      sm: 20,
      xs: 18,
    },
  },
  
  // Display: For large, modern headings
  display: {
    fontFamily: 'MADE Outer Sans',
    fontSize: {
      xl: 40,
      lg: 36,
      md: 32,
      sm: 28,
    },
    letterSpacing: -0.5,
  },
  
  // Serif: For editorial, premium text (Kindred style)
  serif: {
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      default: 'serif',
    }),
    fontSize: {
      xl: 32,
      lg: 28,
      md: 24,
      sm: 20,
      xs: 18,
    },
    fontWeight: '600' as const,
    letterSpacing: 0.5,
  },
};

