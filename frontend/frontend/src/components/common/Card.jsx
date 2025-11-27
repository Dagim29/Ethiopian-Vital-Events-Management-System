import React from 'react';
import { cn } from '../../utils/cn';

const Card = ({ 
  children, 
  className, 
  hover = false, 
  padding = 'default',
  ...props 
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={cn(
        'bg-white rounded-xl shadow-soft border border-gray-100',
        paddingClasses[padding],
        hover && 'hover:shadow-medium transition-shadow duration-200 cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

const CardHeader = ({ children, className, ...props }) => (
  <div
    className={cn('mb-4', className)}
    {...props}
  >
    {children}
  </div>
);

const CardTitle = ({ children, className, ...props }) => (
  <h3
    className={cn('text-lg font-semibold text-gray-900', className)}
    {...props}
  >
    {children}
  </h3>
);

const CardDescription = ({ children, className, ...props }) => (
  <p
    className={cn('text-sm text-gray-600 mt-1', className)}
    {...props}
  >
    {children}
  </p>
);

const CardContent = ({ children, className, ...props }) => (
  <div
    className={cn('', className)}
    {...props}
  >
    {children}
  </div>
);

const CardFooter = ({ children, className, ...props }) => (
  <div
    className={cn('mt-4 pt-4 border-t border-gray-100', className)}
    {...props}
  >
    {children}
  </div>
);

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;

