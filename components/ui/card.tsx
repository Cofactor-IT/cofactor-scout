interface CardProps {
  children: React.ReactNode;
  className?: string;
}

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
