import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
    return (
        <div className={`bg-vertex-card border border-slate-700 rounded-xl shadow-lg overflow-hidden ${className}`}>
            {children}
        </div>
    );
};
