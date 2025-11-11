import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usersAPI } from '../../services/api';
import Button from '../common/Button';
import Modal from '../common/Modal';
import ImageUpload from '../common/ImageUpload';
import { toast } from 'react-toastify';

const UserForm = ({ isOpen, onClose, user = null, onSuccess }) => {
  const queryClient = useQueryClient();
  const [userPhoto, setUserPhoto] = useState(null);
  const [userPhotoPreview, setUserPhotoPreview] = useState(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [createdPassword, setCreatedPassword] = useState('');
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    role: user?.role || 'vms_officer',
    badge_number: user?.badge_number || '',
    department: user?.department || '',
    region: user?.region || '',
    zone: user?.zone || '',
    woreda: user?.woreda || '',
    kebele: user?.kebele || '',
    phone: user?.phone || '',
    office_name: user?.office_name || '',
    is_active: user?.is_active !== undefined ? user.is_active : true,
  });

  // Generate random password
  const generatePassword = () => {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let newPassword = '';
    for (let i = 0; i < length; i++) {
      newPassword += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setPassword(newPassword);
    setShowPassword(true);
  };

  // Load existing user data and photo when editing
  useEffect(() => {
    if (isOpen) {
      if (user) {
        // Editing existing user - load all data
        setFormData({
          full_name: user.full_name || '',
          email: user.email || '',
          role: user.role || 'vms_officer',
          badge_number: user.badge_number || '',
          department: user.department || '',
          region: user.region || '',
          zone: user.zone || '',
          woreda: user.woreda || '',
          kebele: user.kebele || '',
          phone: user.phone || '',
          office_name: user.office_name || '',
          is_active: user.is_active !== undefined ? user.is_active : true,
        });
        
        // Load existing photo
        if (user.profile_photo) {
          setUserPhotoPreview(user.profile_photo);
        } else {
          setUserPhotoPreview(null);
        }
        setPassword('');
        setCreatedPassword('');
      } else {
        // Creating new user - reset to defaults and generate password
        setFormData({
          full_name: '',
          email: '',
          role: 'vms_officer',
          badge_number: '',
          department: '',
          region: '',
          zone: '',
          woreda: '',
          kebele: '',
          phone: '',
          office_name: '',
          is_active: true,
        });
        setUserPhotoPreview(null);
        generatePassword(); // Auto-generate password for new users
        setCreatedPassword('');
      }
    }
  }, [isOpen, user]);

  const createUserMutation = useMutation({
    mutationFn: (userData) => usersAPI.createUser(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      setCreatedPassword(password);
      toast.success(`User created successfully! Password: ${password}`, {
        autoClose: false,
        closeButton: true,
      });
      if (onSuccess) onSuccess();
      // Don't close modal immediately so admin can see the password
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create user');
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, userData }) => usersAPI.updateUser(id, userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User updated successfully');
      if (onSuccess) onSuccess();
      onClose();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update user');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate password for new users
    if (!user && !password) {
      toast.error('Please generate or enter a password');
      return;
    }
    
    const userData = {
      ...formData,
      profile_photo: userPhotoPreview,
    };
    
    if (user) {
      updateUserMutation.mutate({ id: user.user_id, userData });
    } else {
      createUserMutation.mutate({
        ...userData,
        password: password,
      });
    }
  };

  const copyPasswordToClipboard = () => {
    navigator.clipboard.writeText(createdPassword || password);
    toast.success('Password copied to clipboard!');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={user ? 'Edit User' : 'Add New User'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              name="full_name"
              id="full_name"
              required
              value={formData.full_name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-ethiopia-green focus:ring-ethiopia-green sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-ethiopia-green focus:ring-ethiopia-green sm:text-sm"
              disabled={!!user}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="badge_number" className="block text-sm font-medium text-gray-700">
              Badge Number
            </label>
            <input
              type="text"
              name="badge_number"
              id="badge_number"
              required
              value={formData.badge_number}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-ethiopia-green focus:ring-ethiopia-green sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
              Role
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-ethiopia-green focus:outline-none focus:ring-ethiopia-green sm:text-sm"
            >
              <option value="admin">Admin</option>
              <option value="vms_officer">VMS Officer</option>
              <option value="statistician">Statistician</option>
              <option value="clerk">Clerk</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700">
              Department
            </label>
            <input
              type="text"
              name="department"
              id="department"
              value={formData.department}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-ethiopia-green focus:ring-ethiopia-green sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone
            </label>
            <input
              type="tel"
              name="phone"
              id="phone"
              value={formData.phone}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-ethiopia-green focus:ring-ethiopia-green sm:text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="region" className="block text-sm font-medium text-gray-700">
              Region
            </label>
            <select
              id="region"
              name="region"
              value={formData.region}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-ethiopia-green focus:outline-none focus:ring-ethiopia-green sm:text-sm"
            >
              <option value="">Select Region</option>
              <option value="AD">Addis Ababa</option>
              <option value="OR">Oromia</option>
              <option value="AM">Amhara</option>
              <option value="SN">Southern Nations</option>
              <option value="TG">Tigray</option>
              <option value="SO">Somali</option>
              <option value="AF">Afar</option>
              <option value="BG">Benishangul-Gumuz</option>
              <option value="GM">Gambella</option>
              <option value="HR">Harari</option>
              <option value="DD">Dire Dawa</option>
            </select>
          </div>

          <div>
            <label htmlFor="zone" className="block text-sm font-medium text-gray-700">
              Zone
            </label>
            <input
              type="text"
              name="zone"
              id="zone"
              value={formData.zone}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-ethiopia-green focus:ring-ethiopia-green sm:text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="woreda" className="block text-sm font-medium text-gray-700">
              Woreda
            </label>
            <input
              type="text"
              name="woreda"
              id="woreda"
              value={formData.woreda}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-ethiopia-green focus:ring-ethiopia-green sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="kebele" className="block text-sm font-medium text-gray-700">
              Kebele
            </label>
            <input
              type="text"
              name="kebele"
              id="kebele"
              value={formData.kebele}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-ethiopia-green focus:ring-ethiopia-green sm:text-sm"
            />
          </div>
        </div>

        <div>
          <label htmlFor="office_name" className="block text-sm font-medium text-gray-700">
            Office Name
          </label>
          <input
            type="text"
            name="office_name"
            id="office_name"
            value={formData.office_name}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-ethiopia-green focus:ring-ethiopia-green sm:text-sm"
          />
        </div>

        {/* Password Field - Only for new users */}
        {!user && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password *
            </label>
            <div className="flex gap-2">
              <div className="flex-1">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  id="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Enter password or generate one"
                />
              </div>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                {showPassword ? '🙈 Hide' : '👁️ Show'}
              </button>
              <button
                type="button"
                onClick={generatePassword}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                🔄 Generate
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-600">
              💡 Click "Generate" for a secure random password, or enter your own (min 8 characters)
            </p>
          </div>
        )}

        {/* Show created password after successful creation */}
        {createdPassword && (
          <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-green-800">✅ User Created Successfully!</p>
                <p className="text-sm text-green-700 mt-1">
                  <strong>Password:</strong> <code className="bg-green-100 px-2 py-1 rounded">{createdPassword}</code>
                </p>
                <p className="text-xs text-green-600 mt-2">
                  ⚠️ Save this password! Share it securely with the user.
                </p>
              </div>
              <button
                type="button"
                onClick={copyPasswordToClipboard}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
              >
                📋 Copy
              </button>
            </div>
          </div>
        )}

        <div>
          <ImageUpload
            label="Profile Photo"
            value={userPhotoPreview}
            onChange={(file, preview) => {
              setUserPhoto(file);
              setUserPhotoPreview(preview);
            }}
            helperText="Upload user profile photo (PNG, JPG up to 5MB)"
          />
        </div>

        {user && (
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                className="rounded border-gray-300 text-ethiopia-green shadow-sm focus:border-ethiopia-green focus:ring-ethiopia-green"
              />
              <span className="ml-2 text-sm text-gray-700">Active User</span>
            </label>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            {createdPassword ? 'Close' : 'Cancel'}
          </Button>
          {!createdPassword && (
            <Button type="submit" isLoading={createUserMutation.isLoading || updateUserMutation.isLoading}>
              {user ? 'Update User' : 'Create User'}
            </Button>
          )}
        </div>
      </form>
    </Modal>
  );
};

export default UserForm;
