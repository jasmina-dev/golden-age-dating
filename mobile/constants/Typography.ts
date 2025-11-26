// Typography Constants
// Friendly, approachable rounded sans-serif for casual, vibrant feel
import { Platform } from 'react-native';

export const Typography = {
  // Headlines: Rounded sans-serif for friendly, approachable feel
  // Uses rounded system fonts (Nunito-like rounded style)
  heading: {
    fontFamily: Platform.select({
      ios: 'System', // Rounded SF Pro on iOS (friendly, casual)
      android: 'sans-serif', // Rounded Roboto on Android
      default: 'System',
    }),
    fontSize: {
      xl: 32,
      lg: 28,
      md: 24,
      sm: 20,
      xs: 18,
    },
    fontWeight: '700' as const, // Bold but not too heavy
    letterSpacing: 0, // Natural spacing for friendly feel
  },
  
  // Body: Rounded sans-serif for casual readability
  body: {
    fontFamily: Platform.select({
      ios: 'System', // Rounded SF Pro on iOS
      android: 'sans-serif', // Rounded Roboto on Android
      default: 'System',
    }),
    fontSize: {
      lg: 18,
      md: 16,
      sm: 14,
      xs: 12,
    },
    fontWeight: '400' as const,
    lineHeight: {
      lg: 28,
      md: 24,
      sm: 20,
      xs: 18,
    },
  },
  
  // Display: For large, friendly headings
  display: {
    fontFamily: Platform.select({
      ios: 'System',
      android: 'sans-serif',
      default: 'System',
    }),
    fontSize: {
      xl: 40,
      lg: 36,
      md: 32,
      sm: 28,
    },
    fontWeight: '700' as const,
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

