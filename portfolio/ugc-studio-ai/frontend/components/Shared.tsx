import React from 'react';
import { Loader2 } from 'lucide-react';
import { marked } from 'marked';

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { isLoading?: boolean, variant?: 'primary' | 'secondary' }> = ({ 
  children, isLoading, variant = 'primary', className = '', ...props 
}) => {
  const baseStyle = "px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-900/20",
    secondary: "bg-slate-700 hover:bg-slate-600 text-white border border-slate-600"
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} disabled={isLoading || props.disabled} {...props}>
      {isLoading && <Loader2 className="animate-spin" size={16} />}
      {children}
    </button>
  );
};

export const Card: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-slate-800/40 border border-slate-700 rounded-2xl p-6 shadow-xl ${className}`}>
    {children}
  </div>
);

export const Markdown: React.FC<{ content: string }> = ({ content }) => {
  // Configure marked to break on newlines
  marked.setOptions({ breaks: true });
  const html = marked.parse(content) as string;
  
  return (
    <div 
      className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-a:text-brand-400" 
      dangerouslySetInnerHTML={{ __html: html }} 
    />
  );
};
