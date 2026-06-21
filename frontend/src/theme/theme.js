import { alpha, createTheme } from '@mui/material/styles';

const primaryMain = '#6366F1';
const primaryDark = '#4F46E5';
const primaryLight = '#818CF8';

const sharedTypography = {
  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  h1: { fontWeight: 700, letterSpacing: '-0.025em' },
  h2: { fontWeight: 700, letterSpacing: '-0.025em' },
  h3: { fontWeight: 700, letterSpacing: '-0.02em' },
  h4: { fontWeight: 700, letterSpacing: '-0.02em', fontSize: '1.75rem' },
  h5: { fontWeight: 600, letterSpacing: '-0.01em' },
  h6: { fontWeight: 600, letterSpacing: '-0.01em' },
  subtitle1: { fontWeight: 500 },
  body1: { fontSize: '0.9375rem', lineHeight: 1.6 },
  body2: { fontSize: '0.875rem', lineHeight: 1.5 },
  button: { fontWeight: 600, textTransform: 'none', letterSpacing: '0.01em' },
  overline: { fontWeight: 600, letterSpacing: '0.06em', fontSize: '0.6875rem' },
};

const lightPalette = {
  mode: 'light',
  primary: {
    main: '#4F46E5',
    dark: '#4338CA',
    light: '#818CF8',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#7C3AED',
    dark: '#6D28D9',
    light: '#A78BFA',
    contrastText: '#FFFFFF',
  },
  success: { main: '#10B981', dark: '#059669', light: '#34D399' },
  warning: { main: '#F59E0B', dark: '#D97706', light: '#FBBF24' },
  error: { main: '#EF4444', dark: '#DC2626', light: '#F87171' },
  info: { main: '#0EA5E9', dark: '#0284C7', light: '#38BDF8' },
  background: { default: '#F8FAFC', paper: '#FFFFFF' },
  text: { primary: '#0F172A', secondary: '#64748B', disabled: '#94A3B8' },
  divider: '#E2E8F0',
};

const darkPalette = {
  mode: 'dark',
  primary: {
    main: primaryMain,
    dark: primaryDark,
    light: primaryLight,
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#8B5CF6',
    dark: '#7C3AED',
    light: '#A78BFA',
    contrastText: '#FFFFFF',
  },
  success: { main: '#34D399', dark: '#10B981', light: '#6EE7B7' },
  warning: { main: '#FBBF24', dark: '#F59E0B', light: '#FCD34D' },
  error: { main: '#F87171', dark: '#EF4444', light: '#FCA5A5' },
  info: { main: '#38BDF8', dark: '#0EA5E9', light: '#7DD3FC' },
  background: { default: '#0B0F1A', paper: '#131825' },
  text: { primary: '#F1F5F9', secondary: '#94A3B8', disabled: '#64748B' },
  divider: '#1E293B',
};

const createShadows = (isDark) => {
  const base = isDark ? 'rgba(0, 0, 0, 0.4)' : 'rgba(15, 23, 42, 0.08)';
  const soft = isDark ? 'rgba(0, 0, 0, 0.25)' : 'rgba(15, 23, 42, 0.06)';

  return [
    'none',
    `0 1px 2px 0 ${soft}`,
    `0 1px 3px 0 ${base}, 0 1px 2px -1px ${soft}`,
    `0 4px 6px -1px ${base}, 0 2px 4px -2px ${soft}`,
    `0 10px 15px -3px ${base}, 0 4px 6px -4px ${soft}`,
    `0 20px 25px -5px ${base}, 0 8px 10px -6px ${soft}`,
    isDark
      ? '0 25px 50px -12px rgba(0, 0, 0, 0.55)'
      : '0 25px 50px -12px rgba(15, 23, 42, 0.15)',
    ...Array(18).fill(
      isDark
        ? '0 25px 50px -12px rgba(0, 0, 0, 0.55)'
        : '0 25px 50px -12px rgba(15, 23, 42, 0.15)'
    ),
  ];
};

const createAppTheme = (mode = 'dark') => {
  const isDark = mode === 'dark';
  const palette = isDark ? darkPalette : lightPalette;
  const primary = palette.primary.main;

  return createTheme({
    palette: {
      ...palette,
      action: {
        hover: alpha(isDark ? '#F1F5F9' : '#0F172A', isDark ? 0.06 : 0.04),
        selected: alpha(primary, isDark ? 0.16 : 0.08),
        focus: alpha(primary, isDark ? 0.2 : 0.12),
      },
    },
    typography: {
      ...sharedTypography,
      subtitle2: {
        fontWeight: 500,
        color: palette.text.secondary,
      },
    },
    shape: { borderRadius: 10 },
    shadows: createShadows(isDark),
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
            colorScheme: isDark ? 'dark' : 'light',
          },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: { borderRadius: 8, padding: '8px 16px' },
          contained: {
            boxShadow: isDark
              ? '0 1px 2px 0 rgba(99, 102, 241, 0.35)'
              : '0 1px 2px 0 rgba(79, 70, 229, 0.2)',
            '&:hover': {
              boxShadow: isDark
                ? '0 4px 16px 0 rgba(99, 102, 241, 0.4)'
                : '0 4px 12px 0 rgba(79, 70, 229, 0.25)',
            },
          },
          containedPrimary: {
            background: `linear-gradient(135deg, ${palette.primary.main} 0%, ${palette.primary.dark} 100%)`,
            '&:hover': {
              background: `linear-gradient(135deg, ${palette.primary.dark} 0%, ${isDark ? '#3730A3' : '#3730A3'} 100%)`,
            },
          },
          outlined: ({ theme }) => ({
            borderColor: theme.palette.divider,
            color: theme.palette.text.primary,
            '&:hover': {
              borderColor: isDark ? '#334155' : '#CBD5E1',
              backgroundColor: alpha(isDark ? '#F1F5F9' : '#0F172A', isDark ? 0.04 : 0.02),
            },
          }),
          sizeLarge: { padding: '10px 22px', fontSize: '0.9375rem' },
        },
      },
      MuiPaper: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: { backgroundImage: 'none' },
          rounded: { borderRadius: 12 },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: ({ theme }) => ({
            borderRadius: 12,
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: isDark
              ? '0 0 0 1px rgba(255, 255, 255, 0.03) inset'
              : '0 1px 3px 0 rgba(15, 23, 42, 0.06)',
            backgroundImage: isDark
              ? 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 100%)'
              : 'none',
          }),
        },
      },
      MuiTextField: {
        defaultProps: { variant: 'outlined' },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: ({ theme }) => ({
            borderRadius: 8,
            backgroundColor: isDark ? alpha('#0B0F1A', 0.5) : '#FFFFFF',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: isDark ? '#334155' : '#CBD5E1',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderWidth: 2,
            },
          }),
          notchedOutline: ({ theme }) => ({
            borderColor: theme.palette.divider,
          }),
        },
      },
      MuiInputLabel: {
        styleOverrides: { root: { fontWeight: 500 } },
      },
      MuiAppBar: {
        defaultProps: { elevation: 0 },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: ({ theme }) => ({
            borderRight: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.background.paper,
            backgroundImage: isDark
              ? 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0) 100%)'
              : 'none',
          }),
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: ({ theme }) => ({
            borderRadius: 8,
            marginBottom: 2,
            paddingTop: 8,
            paddingBottom: 8,
            color: theme.palette.text.secondary,
            '&:hover': {
              backgroundColor: alpha(isDark ? '#F1F5F9' : '#0F172A', isDark ? 0.06 : 0.04),
            },
            '&.Mui-selected': {
              backgroundColor: alpha(primary, isDark ? 0.18 : 0.08),
              color: isDark ? primaryLight : primary,
              fontWeight: 600,
              '&:hover': {
                backgroundColor: alpha(primary, isDark ? 0.24 : 0.12),
              },
              '& .MuiListItemIcon-root': {
                color: isDark ? primaryLight : primary,
              },
            },
          }),
        },
      },
      MuiListItemIcon: {
        styleOverrides: {
          root: ({ theme }) => ({
            minWidth: 40,
            color: theme.palette.text.disabled,
          }),
        },
      },
      MuiTabs: {
        styleOverrides: {
          root: { minHeight: 40 },
          indicator: { height: 3, borderRadius: '3px 3px 0 0' },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: ({ theme }) => ({
            textTransform: 'none',
            fontWeight: 500,
            fontSize: '0.875rem',
            minHeight: 40,
            color: theme.palette.text.secondary,
            '&.Mui-selected': {
              color: primary,
              fontWeight: 600,
            },
          }),
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { fontWeight: 500, borderRadius: 6 },
          filled: {
            backgroundColor: alpha(primary, isDark ? 0.2 : 0.08),
            color: isDark ? primaryLight : primary,
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: { borderRadius: 8 },
          standardError: {
            backgroundColor: alpha('#EF4444', isDark ? 0.15 : 0.08),
            color: isDark ? '#FCA5A5' : '#B91C1C',
          },
          standardSuccess: {
            backgroundColor: alpha('#10B981', isDark ? 0.15 : 0.08),
            color: isDark ? '#6EE7B7' : '#047857',
          },
          standardWarning: {
            backgroundColor: alpha('#F59E0B', isDark ? 0.15 : 0.08),
            color: isDark ? '#FCD34D' : '#B45309',
          },
          standardInfo: {
            backgroundColor: alpha('#0EA5E9', isDark ? 0.15 : 0.08),
            color: isDark ? '#7DD3FC' : '#0369A1',
          },
        },
      },
      MuiAvatar: {
        styleOverrides: {
          root: { fontWeight: 600, fontSize: '0.875rem' },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: ({ theme }) => ({
            '& .MuiTableCell-head': {
              fontWeight: 600,
              color: theme.palette.text.secondary,
              backgroundColor: isDark ? alpha('#F1F5F9', 0.04) : '#F8FAFC',
              borderBottom: `1px solid ${theme.palette.divider}`,
            },
          }),
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: ({ theme }) => ({
            borderColor: theme.palette.divider,
          }),
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: ({ theme }) => ({
            borderColor: theme.palette.divider,
          }),
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: ({ theme }) => ({
            borderRadius: 16,
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: theme.shadows[6],
          }),
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: ({ theme }) => ({
            color: theme.palette.text.secondary,
            '&:hover': {
              backgroundColor: alpha(isDark ? '#F1F5F9' : '#0F172A', isDark ? 0.08 : 0.04),
            },
          }),
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: ({ theme }) => ({
            backgroundColor: isDark ? '#1E293B' : '#0F172A',
            color: theme.palette.common.white,
            fontSize: '0.75rem',
            fontWeight: 500,
            border: isDark ? `1px solid ${theme.palette.divider}` : 'none',
          }),
        },
      },
    },
  });
};

export default createAppTheme;
