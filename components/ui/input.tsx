interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export function Input({ className = '', ...props }: InputProps) {
  return (
    <input
      className={`bg-white border border-[#E5E7EB] px-4 py-3 body focus:outline-none focus:border-[#0D7377] transition-colors ${className}`}
      style={{ borderRadius: '4px' }}
      {...props}
    />
  );
}
