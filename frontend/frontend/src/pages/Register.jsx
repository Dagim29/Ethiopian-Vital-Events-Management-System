import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Card from '../components/common/Card';
import { toast } from 'react-toastify';

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Administrator' },
  { value: 'vms_officer', label: 'VMS Officer' },
  { value: 'statistician', label: 'Statistician' },
  { value: 'clerk', label: 'Clerk' },
];

const REGION_OPTIONS = [
  { value: 'AD', label: 'Addis Ababa' },
  { value: 'OR', label: 'Oromia' },
  { value: 'SN', label: 'SNNP' },
  { value: 'AM', label: 'Amhara' },
  { value: 'TG', label: 'Tigray' },
  { value: 'SO', label: 'Somali' },
  { value: 'AF', label: 'Afar' },
  { value: 'HA', label: 'Harari' },
  { value: 'DD', label: 'Dire Dawa' },
  { value: 'GA', label: 'Gambela' },
  { value: 'BE', label: 'Benishangul-Gumuz' },
];

const Register = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      full_name: '',
      role: 'vms_officer',
      department: '',
      region: 'AD',
      zone: '',
      woreda: '',
      kebele: '',
      phone: '',
      badge_number: '',
      office_name: '',
    }
  });

  const password = watch('password');

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      
      // Remove confirmPassword from the data sent to API
      const { confirmPassword, ...userData } = data;
      
      const response = await authAPI.register(userData);
      
      // Store user data and token
      localStorage.setItem('token', response.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      // Update auth context
      login({
        user: response.user,
        access_token: response.access_token
      });
      
      toast.success('Registration successful! Welcome to the system.');
      navigate('/dashboard');
      
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Registration failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-2xl font-bold">VMS</span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link
            to="/login"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            sign in to your existing account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <Card className="py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
                
                <Input
                  label="Full Name *"
                  {...register('full_name', { 
                    required: 'Full name is required',
                    minLength: { value: 2, message: 'Name must be at least 2 characters' }
                  })}
                  error={errors.full_name}
                />
                
                <Input
                  type="email"
                  label="Email Address *"
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  error={errors.email}
                />
                
                <Input
                  type="password"
                  label="Password *"
                  {...register('password', { 
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' }
                  })}
                  error={errors.password}
                />
                
                <Input
                  type="password"
                  label="Confirm Password *"
                  {...register('confirmPassword', { 
                    required: 'Please confirm your password',
                    validate: value => value === password || 'Passwords do not match'
                  })}
                  error={errors.confirmPassword}
                />
              </div>

              {/* Professional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Professional Information</h3>
                
                <Select
                  label="Role *"
                  options={ROLE_OPTIONS}
                  {...register('role', { required: 'Role is required' })}
                  error={errors.role}
                />
                
                <Input
                  label="Department"
                  {...register('department')}
                />
                
                <Input
                  label="Badge Number *"
                  {...register('badge_number', { 
                    required: 'Badge number is required',
                    minLength: { value: 3, message: 'Badge number must be at least 3 characters' }
                  })}
                  error={errors.badge_number}
                />
                
                <Input
                  label="Office Name"
                  {...register('office_name')}
                />
                
                <Input
                  type="tel"
                  label="Phone Number"
                  {...register('phone', {
                    pattern: {
                      value: /^[\+]?[0-9\s\-\(\)]{10,}$/,
                      message: 'Invalid phone number'
                    }
                  })}
                  error={errors.phone}
                />
              </div>
            </div>

            {/* Location Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Location Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Region *"
                  options={REGION_OPTIONS}
                  {...register('region', { required: 'Region is required' })}
                  error={errors.region}
                />
                
                <Input
                  label="Zone"
                  {...register('zone')}
                />
                
                <Input
                  label="Woreda"
                  {...register('woreda')}
                />
                
                <Input
                  label="Kebele"
                  {...register('kebele')}
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                I agree to the{' '}
                <a href="#" className="text-blue-600 hover:text-blue-500">
                  Terms and Conditions
                </a>{' '}
                and{' '}
                <a href="#" className="text-blue-600 hover:text-blue-500">
                  Privacy Policy
                </a>
              </label>
            </div>

            <div>
              <Button
                type="submit"
                className="w-full"
                isLoading={isSubmitting}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Register;
