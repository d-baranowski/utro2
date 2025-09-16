import { createTheme } from '@mui/material/styles';

/**
 * Theme inspired by Foundation/NGO websites like Fundacja Bez Klamek
 *
 * Color Philosophy:
 * - Primary Green: Trust, growth, stability, nature-friendly
 * - Secondary Orange: Warmth, energy, human connection, optimism
 * - Background: Clean, accessible, professional
 * - Text: High contrast for accessibility, warm yet professional
 */

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2e7d3e', // Forest green - trust, growth, foundation values
      light: '#5cb85c', // Lighter green for hover states
      dark: '#1e5128', // Darker green for active states
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#f39c12', // Warm orange - energy, warmth, human connection
      light: '#f7ca18', // Light orange for accents
      dark: '#d68910', // Dark orange for emphasis
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8f9fa', // Softer, warmer background
      paper: '#ffffff',
    },
    text: {
      primary: '#2c3e50', // Dark blue-grey for better readability
      secondary: '#7f8c8d', // Medium grey for secondary text
    },
    divider: 'rgba(0, 0, 0, 0.08)',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 600,
      fontSize: '2.5rem',
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
      lineHeight: 1.3,
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
      lineHeight: 1.4,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.5,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          padding: '8px 20px',
          fontSize: '0.95rem',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0 4px 12px rgba(46, 125, 62, 0.25)', // Updated to match new primary color
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        fullWidth: true,
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '&:hover fieldset': {
              borderColor: '#2e7d3e', // Updated to match new primary color
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          backgroundColor: '#ffffff',
          color: '#2c3e50', // Updated to match new text primary color
        },
      },
    },
  },
});

export default theme;
