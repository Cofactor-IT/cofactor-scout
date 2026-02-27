/**
 * button.tsx
 * 
 * Reusable button component with primary and secondary variants.
 * Uses design system colors and typography.
 * 
 * Variants:
 * - primary: Teal background with white text
 * - secondary: White background with navy border
 */

'use client'

/**
 * Props for Button component.
 */
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

/**
 * Button component with design system styling.
 * Includes hover states and shadow for depth.
 * 
 * @param children - Button content
 * @param variant - Visual style (primary or secondary)
 * @param className - Additional CSS classes
 * @param onClick - Click handler
 * @param type - HTML button type
 */
export function Button({ 
  children, 
  variant = 'primary', 
  className = '',
  onClick,
  type = 'button',
  disabled = false
}: ButtonProps) {
  const baseStyles = 'button rounded-full flex items-center justify-center whitespace-nowrap transition-all shadow-[0px_2px_4px_rgba(13,115,119,0.2)]';

  const variantStyles = {
    primary: 'bg-[#0D7377] text-white hover:bg-[#0A5A5D]',
    secondary: 'bg-white text-[#1B2A4A] border-2 border-[#1B2A4A] hover:bg-[#1B2A4A] hover:text-white'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  );
}
