import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { birthRecordsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';
import Input from '../common/Input';
import Modal from '../common/Modal';
import ImageUpload from '../common/ImageUpload';
import { toast } from 'react-toastify';

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];

const PLACE_OF_BIRTH_OPTIONS = [
  { value: 'hospital', label: 'Hospital' },
  { value: 'home', label: 'Home' },
  { value: 'clinic', label: 'Health Clinic' },
  { value: 'other', label: 'Other' },
];

const ETHIOPIAN_REGIONS = [
  { value: 'AD', label: 'Addis Ababa' },
  { value: 'AA', label: 'Afar' },
  { value: 'AM', label: 'Amhara' },
  { value: 'BG', label: 'Benishangul-Gumuz' },
  { value: 'DD', label: 'Dire Dawa' },
  { value: 'GA', label: 'Gambela' },
  { value: 'HA', label: 'Harari' },
  { value: 'OR', label: 'Oromia' },
  { value: 'SI', label: 'Sidama' },
  { value: 'SO', label: 'Somali' },
  { value: 'SN', label: 'Southern Nations' },
  { value: 'TI', label: 'Tigray' },
];

const SelectField = ({ label, name, options, register, errors, required = false }) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      {...register(name, required ? { required: `${label} is required` } : {})}
      className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
        errors[name] ? 'border-red-500' : ''
      }`}
    >
      <option value="">Select {label.toLowerCase()}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    {errors[name] && (
      <p className="text-sm text-red-600">{errors[name].message}</p>
    )}
  </div>
);

const BirthRecordForm = ({ isOpen, onClose, record = null, onSuccess }) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('child');
  const [childPhoto, setChildPhoto] = useState(null);
  const [fatherPhoto, setFatherPhoto] = useState(null);
  const [motherPhoto, setMotherPhoto] = useState(null);
  
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    defaultValues: record || {}
  });

  useEffect(() => {
    if (record) {
      const formattedRecord = { ...record };
      if (record.date_of_birth) {
        formattedRecord.date_of_birth = record.date_of_birth.split('T')[0];
      }
      if (record.father_date_of_birth) {
        formattedRecord.father_date_of_birth = record.father_date_of_birth.split('T')[0];
      }
      if (record.mother_date_of_birth) {
        formattedRecord.mother_date_of_birth = record.mother_date_of_birth.split('T')[0];
      }
      setChildPhoto(record.child_photo || null);
      setFatherPhoto(record.father_photo || null);
      setMotherPhoto(record.mother_photo || null);
      reset(formattedRecord);
    }
  }, [record, reset]);

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      
      const recordData = {
        ...data,
        child_photo: childPhoto,
        father_photo: fatherPhoto,
        mother_photo: motherPhoto,
      };
      
      if (record) {
        const recordId = record.birth_id || record.id;
        if (!recordId) {
          throw new Error('No record ID found for update');
        }
        await birthRecordsAPI.updateRecord(recordId, recordData);
        toast.success('Birth record updated successfully');
      } else {
        await birthRecordsAPI.createRecord({
          ...recordData,
          status: 'draft',
        });
        toast.success('Birth record created successfully');
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving birth record:', error);
      const errorMsg = error.response?.data?.errors?.join(', ') || error.message || 'Failed to save birth record';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'child', label: 'Child Info', icon: '👶' },
    { id: 'birth', label: 'Birth Details', icon: '📋' },
    { id: 'father', label: 'Father Info', icon: '👨' },
    { id: 'mother', label: 'Mother Info', icon: '👩' },
    { id: 'informant', label: 'Informant', icon: '👥' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={record ? 'Edit Birth Record' : 'Register New Birth'}
      maxWidth="max-w-6xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-4 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="max-h-[60vh] overflow-y-auto px-1">
          {/* Tab 1: Child Information */}
          {activeTab === 'child' && (
            <div className="space-y-6">
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold mb-4 text-blue-800">Child Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="First Name"
                    {...register('child_first_name', { required: 'First name is required' })}
                    error={errors.child_first_name}
                    required
                  />
                  <Input
                    label="Father's Name"
                    {...register('child_father_name', { required: "Father's name is required" })}
                    error={errors.child_father_name}
                    required
                  />
                  <Input
                    label="Grandfather's Name"
                    {...register('child_grandfather_name')}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <SelectField
                    label="Gender"
                    name="child_gender"
                    options={GENDER_OPTIONS}
                    register={register}
                    errors={errors}
                    required
                  />
                  <Input
                    type="number"
                    step="0.1"
                    label="Weight (kg)"
                    {...register('weight_kg')}
                    placeholder="e.g., 3.2"
                  />
                </div>

                {/* Photo Upload */}
                <div className="mt-4">
                  <ImageUpload
                    label="Child Photo"
                    value={childPhoto}
                    onChange={(file, preview) => {
                      setChildPhoto(preview);
                    }}
                    helperText="Upload child's photo (PNG, JPG up to 5MB)"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Birth Details */}
          {activeTab === 'birth' && (
            <div className="space-y-6">
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold mb-4 text-blue-800">Birth Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    type="date"
                    label="Date of Birth"
                    {...register('date_of_birth', { required: 'Date of birth is required' })}
                    error={errors.date_of_birth}
                    required
                  />
                  <Input
                    type="time"
                    label="Time of Birth"
                    {...register('time_of_birth')}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <SelectField
                    label="Place of Birth Type"
                    name="place_of_birth_type"
                    options={PLACE_OF_BIRTH_OPTIONS}
                    register={register}
                    errors={errors}
                  />
                  <Input
                    label="Place of Birth Name"
                    {...register('place_of_birth_name')}
                    placeholder="e.g., Tikur Anbessa Hospital"
                  />
                </div>
              </div>

              {/* Birth Location */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Birth Location</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SelectField
                    label="Region"
                    name="birth_region"
                    options={ETHIOPIAN_REGIONS}
                    register={register}
                    errors={errors}
                  />
                  <Input
                    label="Zone"
                    {...register('birth_zone')}
                    placeholder="e.g., Addis Ababa"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <Input
                    label="Woreda"
                    {...register('birth_woreda')}
                    placeholder="e.g., 01"
                  />
                  <Input
                    label="Kebele"
                    {...register('birth_kebele')}
                    placeholder="e.g., 01"
                  />
                  <Input
                    label="City/Town"
                    {...register('birth_city')}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Father Information */}
          {activeTab === 'father' && (
            <div className="space-y-6">
              <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                <h3 className="text-lg font-semibold mb-4 text-green-800">Father Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    {...register('father_full_name')}
                    placeholder="Full name"
                  />
                  <Input
                    type="date"
                    label="Date of Birth"
                    {...register('father_date_of_birth')}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <Input
                    label="Nationality"
                    {...register('father_nationality')}
                    placeholder="e.g., Ethiopian"
                  />
                  <Input
                    label="Ethnicity"
                    {...register('father_ethnicity')}
                    placeholder="e.g., Amhara, Oromo"
                  />
                  <Input
                    label="Religion"
                    {...register('father_religion')}
                    placeholder="e.g., Orthodox, Muslim"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Input
                    label="Occupation"
                    {...register('father_occupation')}
                    placeholder="e.g., Teacher, Engineer"
                  />
                  <Input
                    label="Education"
                    {...register('father_education')}
                    placeholder="e.g., University, Secondary"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Input
                    label="ID Number"
                    {...register('father_id_number')}
                    placeholder="e.g., 123-456-7890"
                  />
                  <Input
                    type="tel"
                    label="Phone Number"
                    {...register('father_phone')}
                    placeholder="e.g., 0911234567"
                  />
                </div>

                {/* Photo Upload */}
                <div className="mt-4">
                  <ImageUpload
                    label="Father Photo"
                    value={fatherPhoto}
                    onChange={(file, preview) => {
                      setFatherPhoto(preview);
                    }}
                    helperText="Upload father's photo (optional)"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Mother Information */}
          {activeTab === 'mother' && (
            <div className="space-y-6">
              <div className="bg-pink-50 p-6 rounded-lg border border-pink-200">
                <h3 className="text-lg font-semibold mb-4 text-pink-800">Mother Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    {...register('mother_full_name')}
                    placeholder="Full name"
                  />
                  <Input
                    type="date"
                    label="Date of Birth"
                    {...register('mother_date_of_birth')}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <Input
                    label="Nationality"
                    {...register('mother_nationality')}
                    placeholder="e.g., Ethiopian"
                  />
                  <Input
                    label="Ethnicity"
                    {...register('mother_ethnicity')}
                    placeholder="e.g., Amhara, Oromo"
                  />
                  <Input
                    label="Religion"
                    {...register('mother_religion')}
                    placeholder="e.g., Orthodox, Muslim"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Input
                    label="Occupation"
                    {...register('mother_occupation')}
                    placeholder="e.g., Nurse, Teacher"
                  />
                  <Input
                    label="Education"
                    {...register('mother_education')}
                    placeholder="e.g., University, Secondary"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Input
                    label="ID Number"
                    {...register('mother_id_number')}
                    placeholder="e.g., 123-456-7890"
                  />
                  <Input
                    type="tel"
                    label="Phone Number"
                    {...register('mother_phone')}
                    placeholder="e.g., 0911234567"
                  />
                </div>

                {/* Photo Upload */}
                <div className="mt-4">
                  <ImageUpload
                    label="Mother Photo"
                    value={motherPhoto}
                    onChange={(file, preview) => {
                      setMotherPhoto(preview);
                    }}
                    helperText="Upload mother's photo (optional)"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 5: Informant */}
          {activeTab === 'informant' && (
            <div className="space-y-6">
              <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                <h3 className="text-lg font-semibold mb-4 text-purple-800">Informant Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Informant Name"
                    {...register('informant_name')}
                    placeholder="Full name"
                  />
                  <Input
                    label="Relationship to Child"
                    {...register('informant_relationship')}
                    placeholder="e.g., Father, Mother, Guardian"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Input
                    label="ID Number"
                    {...register('informant_id_number')}
                    placeholder="e.g., 123-456-7890"
                  />
                  <Input
                    type="tel"
                    label="Phone Number"
                    {...register('informant_phone')}
                    placeholder="e.g., 0911234567"
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <textarea
                    {...register('informant_address')}
                    rows={2}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                    placeholder="Informant's full address..."
                  />
                </div>
              </div>

              {/* Additional Notes */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Additional Information</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      {...register('notes')}
                      rows={4}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      placeholder="Any additional notes or remarks..."
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-gray-500">
            {activeTab !== 'child' && (
              <button
                type="button"
                onClick={() => {
                  const currentIndex = tabs.findIndex(t => t.id === activeTab);
                  if (currentIndex > 0) setActiveTab(tabs[currentIndex - 1].id);
                }}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                ← Previous
              </button>
            )}
          </div>
          
          <div className="flex space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            
            {activeTab !== 'informant' ? (
              <Button
                type="button"
                onClick={() => {
                  const currentIndex = tabs.findIndex(t => t.id === activeTab);
                  if (currentIndex < tabs.length - 1) setActiveTab(tabs[currentIndex + 1].id);
                }}
                className="bg-gradient-to-r from-blue-600 to-blue-700"
              >
                Next →
              </Button>
            ) : (
              <Button
                type="submit"
                loading={isSubmitting}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                {record ? 'Update Record' : 'Create Record'}
              </Button>
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default BirthRecordForm;
