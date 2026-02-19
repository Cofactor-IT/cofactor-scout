/**
 * Icon Utilities
 * Helper functions for working with custom SVG icons
 */

export const ICON_PATHS = {
  // Features
  approvedSubmission: '/icons/features/approved-submission-icon.svg',
  contributor: '/icons/features/contributor-icon.svg',
  earnCommission: '/icons/features/earn-commission-icon.svg',
  eye: '/icons/features/eye-icon.svg',
  locked: '/icons/features/locked-icon.svg',
  pending: '/icons/features/pending-icon.svg',
  reviewSubmission: '/icons/features/review-submission-icon.svg',
  scout: '/icons/features/scout-icon.svg',
  search: '/icons/features/search-icon.svg',
  submitResearch: '/icons/features/submit-research-icon.svg',
  totalSubmission: '/icons/features/total-submission-icon.svg',
  
  // Navigation
  heroLogo: '/icons/nav/cofactor-scout-hero-logo.svg',
  navbarLogo: '/cofactor-scout-navbar-logo.png',
  
  // Misc
  logoMiniWhite: '/icons/misc/logo-mini-white.png',
} as const

export type IconKey = keyof typeof ICON_PATHS
