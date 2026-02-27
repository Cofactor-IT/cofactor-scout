/**
 * Design Tokens
 * 
 * Centralized design system tokens for colors, typography, spacing, and shadows.
 * Used throughout the application for consistent styling.
 */

export const colors = {
    // Primary
    navy: '#1B2A4A',
    white: '#FFFFFF',
    offWhite: '#FAFBFC',

    // Secondary
    teal: '#0D7377',
    tealDark: '#0a5a5d',
    coolGray: '#6B7280',
    lightGray: '#E5E7EB',

    // Accent
    purple: '#6B5CE7',
    gold: '#C9A84C',
    green: '#2D7D46',
    lightGreen: '#D1FAE5',
    red: '#EF4444',
    amber: '#F59E0B',
    amberLight: '#FEF3C7',

    // Status badges
    statusPendingBg: '#FEF3C7',
    statusPendingText: '#92400E',
    statusValidatingBg: '#DBEAFE',
    statusValidatingText: '#1E40AF',
    statusPitchedBg: '#E0E7FF',
    statusPitchedText: '#3730A3',
    statusMatchBg: '#D1FAE5',
    statusMatchText: '#065F46',
} as const;

export const typography = {
    fonts: {
        heading: '"Rethink Sans", sans-serif',
        body: '"Merriweather", serif',
    },

    sizes: {
        // Rethink Sans
        pageTitle: '36px',
        cardHeading: '24px',
        navLink: '16px',
        buttonText: '16px',
        profileName: '14px',
        label: '14px',
        helperText: '12px',
        tableHeader: '12px',
        badgeCount: '11px',

        // Merriweather
        bodyText: '16px',
        inputText: '16px',
        smallBody: '14px',
    },

    weights: {
        regular: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
    },

    lineHeights: {
        tight: 1.2,
        normal: 1.5,
        relaxed: 1.7,
    },
} as const;

export const spacing = {
    xs: '8px',
    sm: '16px',
    md: '24px',
    lg: '32px',
    xl: '40px',
    xxl: '48px',
    xxxl: '64px',

    // Layout
    pageMargin: '120px',
    cardPadding: '48px',
    navbarHeight: '80px',
    pageHeaderHeight: '120px',
    footerHeight: '80px',
    inputHeight: '48px',
    buttonHeight: '48px',
} as const;

export const borderRadius = {
    sharp: '4px',     // All containers, cards, inputs
    pill: '9999px',   // All buttons, badges, avatars
    none: '0px',
} as const;

export const shadows = {
    card: '0px 1px 3px rgba(0, 0, 0, 0.08)',
    popup: '0px 4px 16px rgba(0, 0, 0, 0.10)',
    hover: '0px 2px 8px rgba(0, 0, 0, 0.10)',
    button: '0px 2px 4px rgba(13, 115, 119, 0.2)',
    footerUp: '0px -2px 8px rgba(0, 0, 0, 0.06)',
} as const;
