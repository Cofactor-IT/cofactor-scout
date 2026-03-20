/**
 * images.d.ts
 * 
 * Type declarations for statically imported image assets used by Next.js.
 * Allows TypeScript to resolve local PNG imports in components and pages.
 */

declare module '*.png' {
  const value: import('next/image').StaticImageData
  export default value
}
