import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'danger';
    isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
    children, 
    variant = 'primary', 
    isLoading = false, 
    className = '', 
    disabled,
    ...props 
}) => {
    const baseStyle = "inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
    
    const variants = {
        primary: "bg-vertex-primary hover:bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]",
        secondary: "bg-vertex-accent hover:bg-purple-600 text-white",
        outline: "border border-slate-600 hover:bg-slate-800 text-slate-200",
        danger: "bg-red-500 hover:bg-red-600 text-white"
    };

    return (
        <button 
            className={`${baseStyle} ${variants[variant]} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {children}
        </button>
    );
};
