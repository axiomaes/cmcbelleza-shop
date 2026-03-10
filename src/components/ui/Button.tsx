import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'dark' | 'outline';
  fullWidth?: boolean;
}

const Button = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  ...props 
}: ButtonProps) => {
  const baseStyles = 'inline-flex justify-center items-center font-bold px-8 py-4 rounded-full transition-all duration-300 transform';
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-hover hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/30',
    secondary: 'bg-secondary text-white hover:opacity-90 hover:-translate-y-1 hover:shadow-xl hover:shadow-secondary/30',
    dark: 'bg-dark text-white hover:bg-primary hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/30',
    outline: 'bg-white text-dark border-2 border-gray-100 hover:border-primary hover:text-primary'
  };

  const widthStyle = fullWidth ? 'w-full' : 'w-auto';

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${widthStyle} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
