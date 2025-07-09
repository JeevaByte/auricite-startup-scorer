
import React from 'react';
import { LoadingSpinner } from './loading-spinner';

interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = 'Loading...', 
  size = 'md' 
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <LoadingSpinner size={size} />
      <p className="text-muted-foreground text-sm">{message}</p>
    </div>
  );
};
