import React from 'react';

const Input = ({
  label,
  name,
  type = 'text',
  register,
  error,
  className = '',
  ...rest
}) => {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        id={name}
        type={type}
        {...register(name)}
        className={`block w-full px-3 py-2 border ${
          error ? 'border-red-500' : 'border-gray-300'
        } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ethiopia-green focus:border-ethiopia-green sm:text-sm`}
        {...rest}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error.message}</p>
      )}
    </div>
  );
};

export default Input;
