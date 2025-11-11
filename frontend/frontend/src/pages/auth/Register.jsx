import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/forms/Input';
import Button from '../../components/common/Button';
import { registerSchema } from '../../utils/validations';
import { authAPI } from '../../services/api';
import { toast } from 'react-toastify';

const Register = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (data) => {
    try {
      setLoading(true);
      const response = await authAPI.register(data);
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create a new account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                name="firstName"
                label="First Name"
                required
                autoComplete="given-name"
              />
              <Input
                name="lastName"
                label="Last Name"
                required
                autoComplete="family-name"
              />
            </div>
            <Input
              name="email"
              type="email"
              label="Email address"
              required
              autoComplete="email"
            />
            <Input
              name="password"
              type="password"
              label="Password"
              required
              autoComplete="new-password"
            />
            <Input
              name="confirmPassword"
              type="password"
              label="Confirm Password"
              required
              autoComplete="new-password"
            />
          </div>

          <div>
            <Button
              type="submit"
              className="w-full flex justify-center"
              loading={loading}
            >
              Register
            </Button>
          </div>
        </form>
        <div className="text-center text-sm">
          <span className="text-gray-600">Already have an account? </span>
          <Link to="/login" className="font-medium text-ethiopia-green hover:text-ethiopia-green/80">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
