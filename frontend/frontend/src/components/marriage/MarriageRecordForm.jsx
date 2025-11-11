import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { marriageRecordsAPI } from '../../services/api';
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

const MARRIAGE_TYPE_OPTIONS = [
  { value: 'civil', label: 'Civil' },
  { value: 'religious', label: 'Religious' },
  { value: 'traditional', label: 'Traditional' },
  { value: 'customary', label: 'Customary' },
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
      className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm ${
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

const MarriageRecordForm = ({ isOpen, onClose, record = null, onSuccess }) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('marriage');
  const [groomPhoto, setGroomPhoto] = useState(null);
  const [bridePhoto, setBridePhoto] = useState(null);
  
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    defaultValues: record || {}
  });

  useEffect(() => {
    if (record) {
      const formattedRecord = { ...record };
      if (record.marriage_date) {
        formattedRecord.marriage_date = record.marriage_date.split('T')[0];
      }
      if (record.spouse1_date_of_birth) {
        formattedRecord.spouse1_date_of_birth = record.spouse1_date_of_birth.split('T')[0];
      }
      if (record.spouse2_date_of_birth) {
        formattedRecord.spouse2_date_of_birth = record.spouse2_date_of_birth.split('T')[0];
      }
      setGroomPhoto(record.groom_photo || null);
      setBridePhoto(record.bride_photo || null);
      reset(formattedRecord);
    }
  }, [record, reset]);

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      
      const recordData = {
        ...data,
        groom_photo: groomPhoto,
        bride_photo: bridePhoto,
      };
      
      if (record) {
        const recordId = record.marriage_id || record.id;
        if (!recordId) {
          throw new Error('No record ID found for update');
        }
        await marriageRecordsAPI.updateRecord(recordId, recordData);
        toast.success('Marriage record updated successfully');
      } else {
        await marriageRecordsAPI.createRecord({
          ...recordData,
          status: 'draft',
        });
        toast.success('Marriage record created successfully');
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving marriage record:', error);
      const errorMsg = error.response?.data?.errors?.join(', ') || error.message || 'Failed to save marriage record';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'marriage', label: 'Marriage Details', icon: '💒' },
    { id: 'spouse1', label: 'Spouse 1 (Groom)', icon: '🤵' },
    { id: 'spouse2', label: 'Spouse 2 (Bride)', icon: '👰' },
    { id: 'witnesses', label: 'Witnesses', icon: '👥' },
    { id: 'ceremony', label: 'Ceremony', icon: '🎉' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={record ? 'Edit Marriage Record' : 'Register New Marriage'}
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
                    ? 'border-pink-500 text-pink-600'
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
          {/* Tab 1: Marriage Details */}
          {activeTab === 'marriage' && (
            <div className="space-y-6">
              <div className="bg-pink-50 p-6 rounded-lg border border-pink-200">
                <h3 className="text-lg font-semibold mb-4 text-pink-800">Marriage Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    type="date"
                    label="Marriage Date"
                    {...register('marriage_date', { required: 'Marriage date is required' })}
                    error={errors.marriage_date}
                    required
                  />
                  <SelectField
                    label="Marriage Type"
                    name="marriage_type"
                    options={MARRIAGE_TYPE_OPTIONS}
                    register={register}
                    errors={errors}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Input
                    label="Marriage Place"
                    {...register('marriage_place')}
                    placeholder="e.g., St. George Church"
                  />
                  <Input
                    label="Officiant Name"
                    {...register('officiant_name')}
                    placeholder="e.g., Father Abebe Tadesse"
                  />
                </div>
              </div>

              {/* Marriage Location */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Marriage Location</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SelectField
                    label="Region"
                    name="marriage_region"
                    options={ETHIOPIAN_REGIONS}
                    register={register}
                    errors={errors}
                  />
                  <Input
                    label="Zone"
                    {...register('marriage_zone')}
                    placeholder="e.g., Addis Ababa"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Input
                    label="Woreda"
                    {...register('marriage_woreda')}
                    placeholder="e.g., 01"
                  />
                  <Input
                    label="Kebele"
                    {...register('marriage_kebele')}
                    placeholder="e.g., 01"
                  />
                </div>

                <div className="mt-4">
                  <Input
                    label="City/Town"
                    {...register('marriage_city')}
                    placeholder="e.g., Addis Ababa"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Spouse 1 (Groom) */}
          {activeTab === 'spouse1' && (
            <div className="space-y-6">
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold mb-4 text-blue-800">Spouse 1 (Groom) Information</h3>
                
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
                    label="Religion"
                    {...register('spouse1_religion')}
                    placeholder="e.g., Orthodox, Muslim"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Input
                    label="Occupation"
                    {...register('spouse1_occupation')}
                    placeholder="e.g., Teacher, Engineer"
                  />
                  <Input
                    label="Education"
                    {...register('spouse1_education')}
                    placeholder="e.g., University, Secondary"
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

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <textarea
                    {...register('spouse1_address')}
                    rows={2}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="Full address..."
                  />
                </div>

                {/* Photo Upload */}
                <div className="mt-4">
                  <ImageUpload
                    label="Groom Photo"
                    value={groomPhoto}
                    onChange={(file, preview) => {
                      setGroomPhoto(preview);
                    }}
                    helperText="Upload groom photo (optional)"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Spouse 2 (Bride) */}
          {activeTab === 'spouse2' && (
            <div className="space-y-6">
              <div className="bg-pink-50 p-6 rounded-lg border border-pink-200">
                <h3 className="text-lg font-semibold mb-4 text-pink-800">Spouse 2 (Bride) Information</h3>
                
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
                    label="Religion"
                    {...register('spouse2_religion')}
                    placeholder="e.g., Orthodox, Muslim"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Input
                    label="Occupation"
                    {...register('spouse2_occupation')}
                    placeholder="e.g., Nurse, Teacher"
                  />
                  <Input
                    label="Education"
                    {...register('spouse2_education')}
                    placeholder="e.g., University, Secondary"
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

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <textarea
                    {...register('spouse2_address')}
                    rows={2}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm"
                    placeholder="Full address..."
                  />
                </div>

                {/* Photo Upload */}
                <div className="mt-4">
                  <ImageUpload
                    label="Bride Photo"
                    value={bridePhoto}
                    onChange={(file, preview) => {
                      setBridePhoto(preview);
                    }}
                    helperText="Upload bride photo (optional)"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Witnesses */}
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
                    label="Relationship"
                    {...register('witness1_relationship')}
                    placeholder="e.g., Friend, Family"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Input
                    label="ID Number"
                    {...register('witness1_id_number')}
                    placeholder="e.g., 123-456-7890"
                  />
                  <Input
                    type="tel"
                    label="Phone Number"
                    {...register('witness1_phone')}
                    placeholder="e.g., 0911234567"
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <textarea
                    {...register('witness1_address')}
                    rows={2}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Full address..."
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
                    label="Relationship"
                    {...register('witness2_relationship')}
                    placeholder="e.g., Friend, Family"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Input
                    label="ID Number"
                    {...register('witness2_id_number')}
                    placeholder="e.g., 123-456-7890"
                  />
                  <Input
                    type="tel"
                    label="Phone Number"
                    {...register('witness2_phone')}
                    placeholder="e.g., 0911234567"
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <textarea
                    {...register('witness2_address')}
                    rows={2}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Full address..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 5: Ceremony */}
          {activeTab === 'ceremony' && (
            <div className="space-y-6">
              <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                <h3 className="text-lg font-semibold mb-4 text-purple-800">Ceremony Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Ceremony Venue"
                    {...register('ceremony_venue')}
                    placeholder="e.g., Sheraton Hotel"
                  />
                  <Input
                    label="Reception Venue"
                    {...register('reception_venue')}
                    placeholder="e.g., Hilton Hotel"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Input
                    type="number"
                    label="Number of Guests"
                    {...register('number_of_guests')}
                    placeholder="e.g., 200"
                  />
                  <Input
                    label="Marriage License Number"
                    {...register('marriage_license_number')}
                    placeholder="License number"
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
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm"
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
            {activeTab !== 'marriage' && (
              <button
                type="button"
                onClick={() => {
                  const currentIndex = tabs.findIndex(t => t.id === activeTab);
                  if (currentIndex > 0) setActiveTab(tabs[currentIndex - 1].id);
                }}
                className="text-pink-600 hover:text-pink-700 font-medium"
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
            
            {activeTab !== 'ceremony' ? (
              <Button
                type="button"
                onClick={() => {
                  const currentIndex = tabs.findIndex(t => t.id === activeTab);
                  if (currentIndex < tabs.length - 1) setActiveTab(tabs[currentIndex + 1].id);
                }}
                className="bg-gradient-to-r from-pink-600 to-pink-700"
              >
                Next →
              </Button>
            ) : (
              <Button
                type="submit"
                loading={isSubmitting}
                className="bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800"
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

export default MarriageRecordForm;
