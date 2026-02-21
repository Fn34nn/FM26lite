import React, { useState } from 'react';

interface TeamBadgeProps {
  logoUrl?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  colors?: [string, string]; // Fallback if logo fails (optional logic)
}

export const TeamBadge: React.FC<TeamBadgeProps> = ({ logoUrl, name, size = 'md', colors }) => {
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8 p-1',
    md: 'w-16 h-16 p-2',
    lg: 'w-24 h-24 p-3'
  };

  // If logo URL is present and no error, render white background for logo visibility
  // Otherwise render fallback color background
  const bgClass = (logoUrl && !imgError) ? 'bg-white' : 'bg-slate-800';
  const borderClass = (logoUrl && !imgError) ? 'border-slate-200' : 'border-slate-700';

  return (
    <div className={`${sizeClasses[size]} relative flex items-center justify-center shrink-0 ${bgClass} rounded-full shadow-lg border-2 ${borderClass} overflow-hidden transition-colors`}>
      {logoUrl && !imgError ? (
        <img 
          src={logoUrl} 
          alt={`${name} logo`} 
          className="w-full h-full object-contain"
          loading="lazy"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="w-full h-full rounded-full flex items-center justify-center" style={{ backgroundColor: colors?.[0] || '#333' }}>
           <span className="text-white font-bold text-xs">{name.substring(0,3)}</span>
        </div>
      )}
    </div>
  );
};