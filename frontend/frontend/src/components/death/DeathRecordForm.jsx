import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { deathRecordsAPI } from '../../services/api';
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

const AGE_TYPE_OPTIONS = [
  { value: 'years', label: 'Years' },
  { value: 'months', label: 'Months' },
  { value: 'days', label: 'Days' },
  { value: 'hours', label: 'Hours' },
];

const PLACE_OF_DEATH_OPTIONS = [
  { value: 'hospital', label: 'Hospital' },
  { value: 'home', label: 'Home' },
  { value: 'road', label: 'Road/Street' },
  { value: 'workplace', label: 'Workplace' },
  { value: 'other', label: 'Other' },
];

const CAUSE_TYPE_OPTIONS = [
  { value: 'natural', label: 'Natural' },
  { value: 'accident', label: 'Accident' },
  { value: 'homicide', label: 'Homicide' },
  { value: 'suicide', label: 'Suicide' },
  { value: 'pending', label: 'Pending Investigation' },
  { value: 'unknown', label: 'Unknown' },
];

const MARITAL_STATUS_OPTIONS = [
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'widowed', label: 'Widowed' },
];

const EDUCATION_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'primary', label: 'Primary' },
  { value: 'secondary', label: 'Secondary' },
  { value: 'tertiary', label: 'Tertiary' },
  { value: 'university', label: 'University' },
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
      className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm ${
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

const DeathRecordForm = ({ isOpen, onClose, record = null, onSuccess }) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('deceased');
  
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    defaultValues: record || {}
  });

  useEffect(() => {
    if (record) {
      const formattedRecord = { ...record };
      if (record.date_of_death) {
        formattedRecord.date_of_death = record.date_of_death.split('T')[0];
      }
      if (record.date_of_birth) {
        formattedRecord.date_of_birth = record.date_of_birth.split('T')[0];
      }
      if (record.burial_date) {
        formattedRecord.burial_date = record.burial_date.split('T')[0];
      }
      reset(formattedRecord);
    }
  }, [record, reset]);

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      
      if (record) {
        const recordId = record.death_id || record.id;
        if (!recordId) {
          throw new Error('No record ID found for update');
        }
        await deathRecordsAPI.updateRecord(recordId, data);
        toast.success('Death record updated successfully');
      } else {
        await deathRecordsAPI.createRecord({
          ...data,
          status: 'draft',
        });
        toast.success('Death record created successfully');
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving death record:', error);
      const errorMsg = error.response?.data?.errors?.join(', ') || error.message || 'Failed to save death record';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'deceased', label: 'Deceased Info', icon: '👤' },
    { id: 'death', label: 'Death Details', icon: '📋' },
    { id: 'location', label: 'Location', icon: '📍' },
    { id: 'informant', label: 'Informant', icon: '👥' },
    { id: 'medical', label: 'Medical', icon: '⚕️' },
    { id: 'burial', label: 'Burial', icon: '⚰️' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={record ? 'Edit Death Record' : 'Register New Death Record'}
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
                    ? 'border-red-500 text-red-600'
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
          {/* Tab 1: Deceased Information */}
          {activeTab === 'deceased' && (
            <div className="space-y-6">
              <div className="bg-red-50 p-6 rounded-lg border border-red-200">
                <h3 className="text-lg font-semibold mb-4 text-red-800">Personal Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="First Name"
                    {...register('deceased_first_name', { required: 'First name is required' })}
                    error={errors.deceased_first_name}
                    required
                  />
                  <Input
                    label="Father's Name"
                    {...register('deceased_father_name', { required: "Father's name is required" })}
                    error={errors.deceased_father_name}
                    required
                  />
                  <Input
                    label="Grandfather's Name"
                    {...register('deceased_grandfather_name')}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <SelectField
                    label="Gender"
                    name="deceased_gender"
                    options={GENDER_OPTIONS}
                    register={register}
                    errors={errors}
                    required
                  />
                  <Input
                    type="date"
                    label="Date of Birth"
                    {...register('date_of_birth')}
                  />
                  <Input
                    label="Nationality"
                    {...register('nationality')}
                    placeholder="e.g., Ethiopian"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <Input
                    label="Ethnicity"
                    {...register('ethnicity')}
                    placeholder="e.g., Amhara, Oromo"
                  />
                  <Input
                    label="Religion"
                    {...register('religion')}
                    placeholder="e.g., Orthodox, Muslim"
                  />
                  <SelectField
                    label="Marital Status"
                    name="marital_status"
                    options={MARITAL_STATUS_OPTIONS}
                    register={register}
                    errors={errors}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Input
                    label="Occupation"
                    {...register('occupation')}
                    placeholder="e.g., Teacher, Farmer"
                  />
                  <SelectField
                    label="Education Level"
                    name="education"
                    options={EDUCATION_OPTIONS}
                    register={register}
                    errors={errors}
                  />
                </div>
              </div>

              {/* Usual Residence */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Usual Residence</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SelectField
                    label="Region"
                    name="usual_region"
                    options={ETHIOPIAN_REGIONS}
                    register={register}
                    errors={errors}
                  />
                  <Input
                    label="Zone"
                    {...register('usual_zone')}
                    placeholder="e.g., West Shewa"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <Input
                    label="Woreda"
                    {...register('usual_woreda')}
                    placeholder="e.g., Ambo"
                  />
                  <Input
                    label="Kebele"
                    {...register('usual_kebele')}
                    placeholder="e.g., 01"
                  />
                  <Input
                    label="City/Town"
                    {...register('usual_city')}
                  />
                </div>

                <div className="mt-4">
                  <Input
                    label="House Number"
                    {...register('usual_house_number')}
                    placeholder="e.g., H.No. 123"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Death Details */}
          {activeTab === 'death' && (
            <div className="space-y-6">
              <div className="bg-red-50 p-6 rounded-lg border border-red-200">
                <h3 className="text-lg font-semibold mb-4 text-red-800">Death Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    type="date"
                    label="Date of Death"
                    {...register('date_of_death', { required: 'Date of death is required' })}
                    error={errors.date_of_death}
                    required
                  />
                  <Input
                    type="time"
                    label="Time of Death"
                    {...register('time_of_death')}
                  />
                  <Input
                    type="number"
                    label="Age at Death"
                    {...register('age_at_death')}
                    placeholder="e.g., 60"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <SelectField
                    label="Age Type"
                    name="age_type"
                    options={AGE_TYPE_OPTIONS}
                    register={register}
                    errors={errors}
                  />
                  <SelectField
                    label="Place of Death Type"
                    name="place_of_death_type"
                    options={PLACE_OF_DEATH_OPTIONS}
                    register={register}
                    errors={errors}
                  />
                </div>

                <div className="mt-4">
                  <Input
                    label="Place of Death Name"
                    {...register('place_of_death_name')}
                    placeholder="e.g., Black Lion Hospital, Home Address"
                  />
                </div>
              </div>

              {/* Cause of Death */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Cause of Death</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Immediate Cause"
                    {...register('cause_of_death')}
                    placeholder="e.g., Heart failure, Accident"
                  />
                  <SelectField
                    label="Cause Type"
                    name="cause_of_death_type"
                    options={CAUSE_TYPE_OPTIONS}
                    register={register}
                    errors={errors}
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Underlying Causes
                  </label>
                  <textarea
                    {...register('underlying_causes')}
                    rows={3}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                    placeholder="Describe any underlying conditions or contributing factors..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Location */}
          {activeTab === 'location' && (
            <div className="space-y-6">
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold mb-4 text-blue-800">Death Location Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SelectField
                    label="Region"
                    name="death_region"
                    options={ETHIOPIAN_REGIONS}
                    register={register}
                    errors={errors}
                  />
                  <Input
                    label="Zone"
                    {...register('death_zone')}
                    placeholder="e.g., Addis Ababa"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <Input
                    label="Woreda"
                    {...register('death_woreda')}
                    placeholder="e.g., 01"
                  />
                  <Input
                    label="Kebele"
                    {...register('death_kebele')}
                    placeholder="e.g., 01"
                  />
                  <Input
                    label="City/Town"
                    {...register('death_city')}
                  />
                </div>

                <div className="mt-4">
                  <Input
                    label="Specific Location"
                    {...register('death_specific_location')}
                    placeholder="e.g., Near Meskel Square, Building name"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Informant */}
          {activeTab === 'informant' && (
            <div className="space-y-6">
              <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                <h3 className="text-lg font-semibold mb-4 text-green-800">Informant Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Informant Name"
                    {...register('informant_name')}
                    placeholder="Full name"
                  />
                  <Input
                    label="Relationship to Deceased"
                    {...register('informant_relationship')}
                    placeholder="e.g., Son, Wife, Friend"
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
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                    placeholder="Informant's full address..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 5: Medical */}
          {activeTab === 'medical' && (
            <div className="space-y-6">
              <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                <h3 className="text-lg font-semibold mb-4 text-purple-800">Medical Certification</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Certifying Doctor"
                    {...register('certifying_doctor')}
                    placeholder="Dr. Full Name"
                  />
                  <Input
                    label="Doctor's Qualification"
                    {...register('doctor_qualification')}
                    placeholder="e.g., MD, GP"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Input
                    label="Medical Certificate Number"
                    {...register('medical_certificate_number')}
                    placeholder="e.g., MC-2024-001"
                  />
                  <Input
                    label="Health Facility Name"
                    {...register('health_facility_name')}
                    placeholder="e.g., Black Lion Hospital"
                  />
                </div>

                <div className="mt-4 flex items-center">
                  <input
                    type="checkbox"
                    {...register('death_cause_verified')}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    Death cause verified by medical professional
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Tab 6: Burial */}
          {activeTab === 'burial' && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Burial Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    type="date"
                    label="Burial Date"
                    {...register('burial_date')}
                  />
                  <Input
                    label="Burial Place"
                    {...register('burial_place')}
                    placeholder="e.g., St. Michael Cemetery"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <SelectField
                    label="Burial Region"
                    name="burial_region"
                    options={ETHIOPIAN_REGIONS}
                    register={register}
                    errors={errors}
                  />
                  <Input
                    label="Burial Zone"
                    {...register('burial_zone')}
                  />
                  <Input
                    label="Burial Woreda"
                    {...register('burial_woreda')}
                  />
                </div>

                <div className="mt-4">
                  <Input
                    label="Undertaker Name"
                    {...register('undertaker_name')}
                    placeholder="Name of funeral service provider"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-gray-500">
            {activeTab !== 'deceased' && (
              <button
                type="button"
                onClick={() => {
                  const currentIndex = tabs.findIndex(t => t.id === activeTab);
                  if (currentIndex > 0) setActiveTab(tabs[currentIndex - 1].id);
                }}
                className="text-red-600 hover:text-red-700 font-medium"
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
            
            {activeTab !== 'burial' ? (
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
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
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

export default DeathRecordForm;
