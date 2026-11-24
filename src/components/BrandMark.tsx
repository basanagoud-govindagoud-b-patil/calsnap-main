import React from 'react';

interface BrandMarkProps {
  showWordmark?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const BrandMark: React.FC<BrandMarkProps> = ({
  showWordmark = true,
  size = 'md',
}) => {
  const iconDim = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-11 h-11' : 'w-9 h-9';
  const textSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl';

  return (
    <span className="inline-flex items-center gap-2.5 whitespace-nowrap shrink-0 select-none">
      <span
        className={`${iconDim} rounded-xl bg-green-600 text-white flex items-center justify-center shadow-sm shrink-0`}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 28 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5"
        >
          {/* Camera viewfinder corners */}
          <path
            d="M4.5 9.5V6.5C4.5 5.4 5.4 4.5 6.5 4.5H9.5M18.5 4.5H21.5C22.6 4.5 23.5 5.4 23.5 6.5V9.5M23.5 18.5V21.5C23.5 22.6 22.6 23.5 21.5 23.5H18.5M9.5 23.5H6.5C5.4 23.5 4.5 22.6 4.5 21.5V18.5"
            stroke="currentColor"
            strokeWidth="2.1"
            strokeLinecap="round"
          />
          {/* Organic leaf/bowl center */}
          <path
            d="M10 15.5C10 11.8 13.4 9.5 18.2 9.5C18.2 14.3 15.9 18 12.2 18C10.9 18 10 17 10 15.5Z"
            fill="currentColor"
          />
          <path
            d="M9.5 18.5L14.5 13.5"
            stroke="#16A34A"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </span>
      {showWordmark && (
        <span
          className={`font-display ${textSize} font-bold tracking-tight text-slate-900 dark:text-slate-50`}
        >
          SnapCal
        </span>
      )}
    </span>
  );
};
