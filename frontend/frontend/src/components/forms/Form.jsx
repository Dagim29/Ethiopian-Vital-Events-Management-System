import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../common/Button';

const Form = ({
  children,
  onSubmit,
  submitText = 'Submit',
  loading = false,
  schema,
  defaultValues = {},
  className = '',
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm({
    defaultValues,
    resolver: schema ? yupResolver(schema) : undefined,
  });

  const handleFormSubmit = async (data) => {
    try {
      await onSubmit(data);
      reset();
    } catch (error) {
      // Error is handled by the API interceptor
      console.error('Form submission error:', error);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit(handleFormSubmit)} 
      className={`space-y-6 ${className}`}
    >
      {typeof children === 'function'
        ? children({ register, errors, control })
        : React.Children.map(children, (child) => {
            return child.props.name
              ? React.createElement(child.type, {
                  ...{
                    ...child.props,
                    register,
                    key: child.props.name,
                    error: errors[child.props.name],
                    control,
                  },
                })
              : child;
          })}
      
      <div className="flex justify-end space-x-4 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => reset()}
          disabled={loading}
        >
          Reset
        </Button>
        <Button type="submit" loading={loading}>
          {submitText}
        </Button>
      </div>
    </form>
  );
};

export default Form;
