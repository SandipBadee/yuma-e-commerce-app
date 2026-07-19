import React from 'react';

export const Badge = ({ children, className }) => (
  <span className={`px-2 py-1 text-xs font-bold rounded-md ${className}`}>{children}</span>
);