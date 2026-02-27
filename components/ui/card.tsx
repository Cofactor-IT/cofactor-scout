/**
 * card.tsx
 * 
 * Reusable card container component.
 * Provides consistent border, background, and border-radius across the app.
 */

/**
 * Props for Card component.
 */
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Card container component with design system styling.
 * White background with light gray border and 4px border radius.
 * 
 * @param children - Card content
 * @param className - Additional CSS classes
 */
export function Card({ children, className = '' }: CardProps) {
  return (
    <div 
      className={`bg-white border border-[#E5E7EB] ${className}`}
      style={{ borderRadius: '4px' }}
    >
      {children}
    </div>
  );
}
