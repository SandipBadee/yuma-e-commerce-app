import React from 'react';

export const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const base = "inline-flex items-center justify-center cursor-pointer font-semibold rounded-xl transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none";
  const variants = {
    primary: "bg-red-800 text-white hover:bg-red-900 shadow-md hover:shadow-lg",
    secondary: "bg-amber-500 text-stone-900 hover:bg-amber-600 shadow-md hover:shadow-lg",
    outline: "border-2 border-stone-200 text-stone-700 hover:border-red-800 hover:text-red-800",
    ghost: "text-stone-600 hover:bg-stone-100",
  };
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5",
    lg: "px-8 py-3.5 text-lg",
    icon: "p-2"
  };
  
  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[props.size || 'md']} ${className}`}
      suppressHydrationWarning
      {...props}
    >
      {children}
    </button>
  );
};