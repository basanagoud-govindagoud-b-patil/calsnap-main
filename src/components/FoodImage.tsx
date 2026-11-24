import React, { useState } from 'react';
import { Utensils } from 'lucide-react';

interface FoodImageProps {
  src?: string;
  alt: string;
  className?: string;
  iconSize?: number;
}

export const FoodImage: React.FC<FoodImageProps> = ({
  src,
  alt,
  className = 'w-16 h-16 rounded-xl',
  iconSize = 20,
}) => {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div
        className={`${className} bg-gradient-to-br from-slate-100 to-slate-200/80 dark:from-slate-800 dark:to-slate-800/60 flex items-center justify-center text-slate-400 dark:text-slate-500 shrink-0`}
        role="img"
        aria-label={alt}
      >
        <Utensils size={iconSize} strokeWidth={1.75} aria-hidden="true" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      loading="lazy"
      onError={() => setHasError(true)}
      className={`${className} object-cover bg-slate-100 dark:bg-slate-800 shrink-0`}
    />
  );
};
