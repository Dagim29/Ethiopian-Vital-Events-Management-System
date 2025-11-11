import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { divorceRecordsAPI } from '../../services/api';
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

const DIVORCE_TYPE_OPTIONS = [
  { value: 'court', label: 'Court Decree' },
  { value: 'mutual', label: 'Mutual Consent' },
  { value: 'contested', label: 'Contested' },
];

const DIVORCE_REASON_OPTIONS = [
  { value: 'irreconcilable_differences', label: 'Irreconcilable Differences' },
  { value: 'adultery', label: 'Adultery' },
  { value: 'abandonment', label: 'Abandonment' },
  { value: 'abuse', label: 'Abuse' },
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
      className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm ${
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

const DivorceRecordForm = ({ isOpen, onClose, record = null, onSuccess }) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('divorce');
  const [husbandPhoto, setHusbandPhoto] = useState(null);
  const [wifePhoto, setWifePhoto] = useState(null);
  
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    defaultValues: record || {}
  });

  useEffect(() => {
    if (record) {
      const formattedRecord = { ...record };
      if (record.divorce_date) {
        formattedRecord.divorce_date = record.divorce_date.split('T')[0];
      }
      if (record.marriage_date) {
        formattedRecord.marriage_date = record.marriage_date.split('T')[0];
      }
      if (record.original_marriage_date) {
        formattedRecord.original_marriage_date = record.original_marriage_date.split('T')[0];
      }
      if (record.spouse1_date_of_birth) {
        formattedRecord.spouse1_date_of_birth = record.spouse1_date_of_birth.split('T')[0];
      }
      if (record.spouse2_date_of_birth) {
        formattedRecord.spouse2_date_of_birth = record.spouse2_date_of_birth.split('T')[0];
      }
      setHusbandPhoto(record.husband_photo || null);
      setWifePhoto(record.wife_photo || null);
      reset(formattedRecord);
    }
  }, [record, reset]);

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      
      const recordData = {
        ...data,
        husband_photo: husbandPhoto,
        wife_photo: wifePhoto,
      };
      
      if (record) {
        const recordId = record.divorce_id || record.id;
        if (!recordId) {
          throw new Error('No record ID found for update');
        }
        await divorceRecordsAPI.updateRecord(recordId, recordData);
        toast.success('Divorce record updated successfully');
      } else {
        await divorceRecordsAPI.createRecord({
          ...recordData,
          status: 'draft',
        });
        toast.success('Divorce record created successfully');
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving divorce record:', error);
      const errorMsg = error.response?.data?.errors?.join(', ') || error.message || 'Failed to save divorce record';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'divorce', label: 'Divorce Details', icon: '⚖️' },
    { id: 'spouse1', label: 'Spouse 1', icon: '👨' },
    { id: 'spouse2', label: 'Spouse 2', icon: '👩' },
    { id: 'marriage', label: 'Marriage Info', icon: '💍' },
    { id: 'settlement', label: 'Settlement', icon: '📄' },
    { id: 'witnesses', label: 'Witnesses', icon: '👥' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={record ? 'Edit Divorce Record' : 'Register New Divorce'}
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
                    ? 'border-orange-500 text-orange-600'
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
          {/* Tab 1: Divorce Details */}
          {activeTab === 'divorce' && (
            <div className="space-y-6">
              <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
                <h3 className="text-lg font-semibold mb-4 text-orange-800">Divorce Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    type="date"
                    label="Divorce Date"
                    {...register('divorce_date', { required: 'Divorce date is required' })}
                    error={errors.divorce_date}
                    required
                  />
                  <SelectField
                    label="Divorce Type"
                    name="divorce_type"
                    options={DIVORCE_TYPE_OPTIONS}
                    register={register}
                    errors={errors}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <SelectField
                    label="Divorce Reason"
                    name="divorce_reason"
                    options={DIVORCE_REASON_OPTIONS}
                    register={register}
                    errors={errors}
                  />
                  <Input
                    label="Case Number"
                    {...register('case_number')}
                    placeholder="e.g., CIV-2024-001"
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Divorce Reasons (Details)
                  </label>
                  <textarea
                    {...register('divorce_reasons')}
                    rows={3}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                    placeholder="Detailed reasons for divorce..."
                  />
                </div>
              </div>

              {/* Court Information */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Court Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Court Name"
                    {...register('court_name')}
                    placeholder="e.g., Federal First Instance Court"
                  />
                  <Input
                    label="Court Case Number"
                    {...register('court_case_number')}
                    placeholder="e.g., CIV-2024-001"
                  />
                </div>

                <div className="mt-4">
                  <Input
                    label="Judge Name"
                    {...register('judge_name')}
                    placeholder="e.g., Judge Alemayehu Tsegaye"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Divorce Location</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SelectField
                    label="Region"
                    name="divorce_region"
                    options={ETHIOPIAN_REGIONS}
                    register={register}
                    errors={errors}
                  />
                  <Input
                    label="Zone"
                    {...register('divorce_zone')}
                    placeholder="e.g., Addis Ababa"
                  />
                </div>

                <div className="mt-4">
                  <Input
                    label="Woreda"
                    {...register('divorce_woreda')}
                    placeholder="e.g., 01"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Spouse 1 */}
          {activeTab === 'spouse1' && (
            <div className="space-y-6">
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold mb-4 text-blue-800">Spouse 1 Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    {...register('spouse1_full_name', { required: 'Full name is required' })}
                    error={errors.spouse1_full_name}
                    required
                    placeholder="Full name"
                  />
                  <Input
                    label="Father's Name"
                    {...register('spouse1_father_name')}
                    placeholder="Father's name"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <Input
                    type="date"
                    label="Date of Birth"
                    {...register('spouse1_date_of_birth')}
                  />
                  <SelectField
                    label="Gender"
                    name="spouse1_gender"
                    options={GENDER_OPTIONS}
                    register={register}
                    errors={errors}
                  />
                  <Input
                    label="Nationality"
                    {...register('spouse1_nationality')}
                    placeholder="e.g., Ethiopian"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Input
                    label="Ethnicity"
                    {...register('spouse1_ethnicity')}
                    placeholder="e.g., Amhara, Oromo"
                  />
                  <Input
                    label="Occupation"
                    {...register('spouse1_occupation')}
                    placeholder="e.g., Teacher, Engineer"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Input
                    label="ID Number"
                    {...register('spouse1_id_number')}
                    placeholder="e.g., 123-456-7890"
                  />
                  <Input
                    type="tel"
                    label="Phone Number"
                    {...register('spouse1_phone')}
                    placeholder="e.g., 0911234567"
                  />
                </div>

                {/* Photo Upload */}
                <div className="mt-4">
                  <ImageUpload
                    label="Spouse 1 Photo"
                    value={husbandPhoto}
                    onChange={(file, preview) => {
                      setHusbandPhoto(preview);
                    }}
                    helperText="Upload spouse 1 photo (optional)"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Spouse 2 */}
          {activeTab === 'spouse2' && (
            <div className="space-y-6">
              <div className="bg-pink-50 p-6 rounded-lg border border-pink-200">
                <h3 className="text-lg font-semibold mb-4 text-pink-800">Spouse 2 Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    {...register('spouse2_full_name', { required: 'Full name is required' })}
                    error={errors.spouse2_full_name}
                    required
                    placeholder="Full name"
                  />
                  <Input
                    label="Father's Name"
                    {...register('spouse2_father_name')}
                    placeholder="Father's name"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <Input
                    type="date"
                    label="Date of Birth"
                    {...register('spouse2_date_of_birth')}
                  />
                  <SelectField
                    label="Gender"
                    name="spouse2_gender"
                    options={GENDER_OPTIONS}
                    register={register}
                    errors={errors}
                  />
                  <Input
                    label="Nationality"
                    {...register('spouse2_nationality')}
                    placeholder="e.g., Ethiopian"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Input
                    label="Ethnicity"
                    {...register('spouse2_ethnicity')}
                    placeholder="e.g., Amhara, Oromo"
                  />
                  <Input
                    label="Occupation"
                    {...register('spouse2_occupation')}
                    placeholder="e.g., Nurse, Teacher"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Input
                    label="ID Number"
                    {...register('spouse2_id_number')}
                    placeholder="e.g., 123-456-7890"
                  />
                  <Input
                    type="tel"
                    label="Phone Number"
                    {...register('spouse2_phone')}
                    placeholder="e.g., 0911234567"
                  />
                </div>

                {/* Photo Upload */}
                <div className="mt-4">
                  <ImageUpload
                    label="Spouse 2 Photo"
                    value={wifePhoto}
                    onChange={(file, preview) => {
                      setWifePhoto(preview);
                    }}
                    helperText="Upload spouse 2 photo (optional)"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Marriage Information */}
          {activeTab === 'marriage' && (
            <div className="space-y-6">
              <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                <h3 className="text-lg font-semibold mb-4 text-purple-800">Original Marriage Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    type="date"
                    label="Marriage Date"
                    {...register('marriage_date')}
                  />
                  <Input
                    type="date"
                    label="Original Marriage Date"
                    {...register('original_marriage_date')}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Input
                    label="Marriage Certificate Number"
                    {...register('original_marriage_certificate_number')}
                    placeholder="e.g., MR/AD/01/2010/00015"
                  />
                  <Input
                    type="number"
                    label="Marriage Duration (Years)"
                    {...register('marriage_duration_years')}
                    placeholder="e.g., 5"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 5: Settlement */}
          {activeTab === 'settlement' && (
            <div className="space-y-6">
              <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                <h3 className="text-lg font-semibold mb-4 text-green-800">Children & Custody</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    type="number"
                    label="Number of Children"
                    {...register('number_of_children')}
                    placeholder="e.g., 2"
                  />
                  <Input
                    label="Child Custody Details"
                    {...register('child_custody_details')}
                    placeholder="e.g., Joint custody"
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Child Support Arrangements
                  </label>
                  <textarea
                    {...register('child_support_arrangements')}
                    rows={3}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                    placeholder="Details of child support arrangements..."
                  />
                </div>
              </div>

              {/* Property Settlement */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Property Settlement</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Property Settlement Details
                    </label>
                    <textarea
                      {...register('property_settlement')}
                      rows={4}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                      placeholder="Details of property division and settlement..."
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 6: Witnesses */}
          {activeTab === 'witnesses' && (
            <div className="space-y-6">
              <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-200">
                <h3 className="text-lg font-semibold mb-4 text-indigo-800">Witness 1</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Name"
                    {...register('witness1_name')}
                    placeholder="Full name"
                  />
                  <Input
                    type="tel"
                    label="Phone Number"
                    {...register('witness1_phone')}
                    placeholder="e.g., 0911234567"
                  />
                </div>
              </div>

              <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-200">
                <h3 className="text-lg font-semibold mb-4 text-indigo-800">Witness 2</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Name"
                    {...register('witness2_name')}
                    placeholder="Full name"
                  />
                  <Input
                    type="tel"
                    label="Phone Number"
                    {...register('witness2_phone')}
                    placeholder="e.g., 0911234567"
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
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
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
            {activeTab !== 'divorce' && (
              <button
                type="button"
                onClick={() => {
                  const currentIndex = tabs.findIndex(t => t.id === activeTab);
                  if (currentIndex > 0) setActiveTab(tabs[currentIndex - 1].id);
                }}
                className="text-orange-600 hover:text-orange-700 font-medium"
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
            
            {activeTab !== 'witnesses' ? (
              <Button
                type="button"
                onClick={() => {
                  const currentIndex = tabs.findIndex(t => t.id === activeTab);
                  if (currentIndex < tabs.length - 1) setActiveTab(tabs[currentIndex + 1].id);
                }}
                className="bg-gradient-to-r from-orange-600 to-orange-700"
              >
                Next →
              </Button>
            ) : (
              <Button
                type="submit"
                loading={isSubmitting}
                className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800"
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

export default DivorceRecordForm;
