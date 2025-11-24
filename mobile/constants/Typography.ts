// Typography Constants
// Note: Pragmatica and Gotham fonts would need to be added to assets/fonts
// For now, using system fonts with similar weights as fallback
export const Typography = {
  // Pragmatica for headings (fallback to system sans-serif)
  heading: {
    fontFamily: 'System', // Replace with 'Pragmatica' when font is added
    fontSize: {
      xl: 32,
      lg: 28,
      md: 24,
      sm: 20,
      xs: 18,
    },
    fontWeight: '900' as const,
    letterSpacing: -0.5,
  },
  // Gotham for body text (fallback to system sans-serif)
  body: {
    fontFamily: 'System', // Replace with 'Gotham' when font is added
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
};

