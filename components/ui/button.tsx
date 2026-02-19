'use client'

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export function Button({ 
  children, 
  variant = 'primary', 
  className = '',
  onClick,
  type = 'button'
}: ButtonProps) {
  const baseStyles = 'px-[1.67vw] py-[0.83vw] rounded-full button-text whitespace-nowrap transition-all';
  
  const variantStyles = {
    primary: 'bg-[#0D7377] text-white hover:bg-[#0a5a5d]',
    secondary: 'bg-white text-[#1B2A4A] border-2 border-[#1B2A4A] hover:bg-[#1B2A4A] hover:text-white'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
