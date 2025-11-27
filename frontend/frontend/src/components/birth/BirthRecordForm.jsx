import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { birthRecordsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';
import Input from '../common/Input';
import Modal from '../common/Modal';
import ImageUpload from '../common/ImageUpload';
import { toast } from 'react-toastify';

// These will be translated inside the component

const SelectField = ({ label, name, options, register, errors, required = false, t }) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      {...register(name, required ? { required: `${label} ${t ? t('common.required') : 'is required'}` } : {})}
      className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
        errors[name] ? 'border-red-500' : ''
      }`}
    >
      <option value="">{t ? t('common.select') : 'Select'} {label.toLowerCase()}</option>
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
  const { t } = useTranslation();
  
  const GENDER_OPTIONS = [
    { value: 'male', label: t('birth.male') },
    { value: 'female', label: t('birth.female') },
  ];

  const PLACE_OF_BIRTH_OPTIONS = [
    { value: 'hospital', label: t('birth.hospitalBirth') },
    { value: 'home', label: t('birth.homeBirth') },
    { value: 'clinic', label: t('birth.clinicBirth') },
    { value: 'other', label: t('birth.otherBirth') },
  ];

  const ETHIOPIAN_REGIONS = [
    { value: 'AD', label: t('birth.addisAbaba') },
    { value: 'AA', label: t('birth.afar') },
    { value: 'AM', label: t('birth.amhara') },
    { value: 'BG', label: t('birth.benishangul') },
    { value: 'DD', label: t('birth.direDawa') },
    { value: 'GA', label: t('birth.gambella') },
    { value: 'HA', label: t('birth.harari') },
    { value: 'OR', label: t('birth.oromia') },
    { value: 'SI', label: t('birth.sidama') },
    { value: 'SO', label: t('birth.somali') },
    { value: 'SN', label: t('birth.southernNations') },
    { value: 'TI', label: t('birth.tigray') },
  ];

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
    { id: 'child', label: t('birth.childInfo'), icon: '👶' },
    { id: 'birth', label: t('birth.deliveryInfo'), icon: '📋' },
    { id: 'father', label: t('birth.fatherInfo'), icon: '👨' },
    { id: 'mother', label: t('birth.motherInfo'), icon: '👩' },
    { id: 'informant', label: t('birth.witnessInfo'), icon: '👥' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={record ? t('birth.editBirth') : t('birth.addNewBirth')}
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
                <h3 className="text-lg font-semibold mb-4 text-blue-800">{t('birth.childInfo')}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label={t('birth.firstName')}
                    {...register('child_first_name', { required: t('birth.firstName') + ' is required' })}
                    error={errors.child_first_name}
                    required
                  />
                  <Input
                    label={t('birth.middleName')}
                    {...register('child_father_name', { required: t('birth.middleName') + ' is required' })}
                    error={errors.child_father_name}
                    required
                  />
                  <Input
                    label={t('birth.lastName')}
                    {...register('child_grandfather_name')}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <SelectField
                    label={t('birth.gender')}
                    name="child_gender"
                    options={GENDER_OPTIONS}
                    register={register}
                    errors={errors}
                    required
                    t={t}
                  />
                  <Input
                    type="number"
                    step="0.1"
                    label={t('birth.weight')}
                    {...register('weight_kg')}
                    placeholder={t('birth.weightPlaceholder')}
                  />
                </div>

                {/* Photo Upload */}
                <div className="mt-4">
                  <ImageUpload
                    label={t('birth.childPhoto')}
                    value={childPhoto}
                    onChange={(file, preview) => {
                      setChildPhoto(preview);
                    }}
                    helperText={t('birth.uploadChildPhoto')}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Birth Details */}
          {activeTab === 'birth' && (
            <div className="space-y-6">
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold mb-4 text-blue-800">{t('birth.birthInformation')}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    type="date"
                    label={t('birth.dateOfBirth')}
                    {...register('date_of_birth', { required: t('birth.dateOfBirthRequired') })}
                    error={errors.date_of_birth}
                    required
                  />
                  <Input
                    type="time"
                    label={t('birth.timeOfBirth')}
                    {...register('time_of_birth')}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <SelectField
                    label={t('birth.placeOfBirthType')}
                    name="place_of_birth_type"
                    options={PLACE_OF_BIRTH_OPTIONS}
                    register={register}
                    errors={errors}
                    t={t}
                  />
                  <Input
                    label={t('birth.placeOfBirthName')}
                    {...register('place_of_birth_name')}
                    placeholder={t('birth.placeOfBirthPlaceholder')}
                  />
                </div>
              </div>

              {/* Birth Location */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">{t('birth.birthLocation')}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SelectField
                    label={t('birth.birthRegion')}
                    name="birth_region"
                    options={ETHIOPIAN_REGIONS}
                    register={register}
                    errors={errors}
                    t={t}
                  />
                  <Input
                    label={t('birth.birthZone')}
                    {...register('birth_zone')}
                    placeholder={t('birth.zonePlaceholder')}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <Input
                    label={t('birth.birthWoreda')}
                    {...register('birth_woreda')}
                    placeholder={t('birth.woredaPlaceholder')}
                  />
                  <Input
                    label={t('birth.birthKebele')}
                    {...register('birth_kebele')}
                    placeholder={t('birth.kebelePlaceholder')}
                  />
                  <Input
                    label={t('birth.birthCity')}
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
                <h3 className="text-lg font-semibold mb-4 text-green-800">{t('birth.fatherInfo')}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label={t('birth.fatherName')}
                    {...register('father_full_name')}
                    placeholder="Full name"
                  />
                  <Input
                    type="date"
                    label={t('birth.dateOfBirth')}
                    {...register('father_date_of_birth')}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <Input
                    label={t('birth.fatherNationality')}
                    {...register('father_nationality')}
                    placeholder={t('birth.nationalityPlaceholder')}
                  />
                  <Input
                    label={t('birth.ethnicity')}
                    {...register('father_ethnicity')}
                    placeholder={t('birth.ethnicityPlaceholder')}
                  />
                  <Input
                    label={t('birth.religion')}
                    {...register('father_religion')}
                    placeholder={t('birth.religionPlaceholder')}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Input
                    label={t('birth.fatherOccupation')}
                    {...register('father_occupation')}
                    placeholder={t('birth.occupationPlaceholder')}
                  />
                  <Input
                    label={t('birth.education')}
                    {...register('father_education')}
                    placeholder={t('birth.educationPlaceholder')}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Input
                    label={t('birth.idNumber')}
                    {...register('father_id_number')}
                    placeholder={t('birth.idNumberPlaceholder')}
                  />
                  <Input
                    type="tel"
                    label={t('birth.phoneNumber')}
                    {...register('father_phone')}
                    placeholder={t('birth.phoneNumberPlaceholder')}
                  />
                </div>

                {/* Photo Upload */}
                <div className="mt-4">
                  <ImageUpload
                    label={t('birth.fatherPhoto')}
                    value={fatherPhoto}
                    onChange={(file, preview) => {
                      setFatherPhoto(preview);
                    }}
                    helperText={t('birth.uploadFatherPhoto')}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Mother Information */}
          {activeTab === 'mother' && (
            <div className="space-y-6">
              <div className="bg-pink-50 p-6 rounded-lg border border-pink-200">
                <h3 className="text-lg font-semibold mb-4 text-pink-800">{t('birth.motherInfo')}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label={t('birth.motherName')}
                    {...register('mother_full_name')}
                    placeholder={t('birth.fullNamePlaceholder')}
                  />
                  <Input
                    type="date"
                    label={t('birth.dateOfBirth')}
                    {...register('mother_date_of_birth')}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <Input
                    label={t('birth.motherNationality')}
                    {...register('mother_nationality')}
                    placeholder={t('birth.nationalityPlaceholder')}
                  />
                  <Input
                    label={t('birth.ethnicity')}
                    {...register('mother_ethnicity')}
                    placeholder={t('birth.ethnicityPlaceholder')}
                  />
                  <Input
                    label={t('birth.religion')}
                    {...register('mother_religion')}
                    placeholder={t('birth.religionPlaceholder')}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Input
                    label={t('birth.motherOccupation')}
                    {...register('mother_occupation')}
                    placeholder={t('birth.motherOccupationPlaceholder')}
                  />
                  <Input
                    label={t('birth.education')}
                    {...register('mother_education')}
                    placeholder={t('birth.educationPlaceholder')}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Input
                    label={t('birth.idNumber')}
                    {...register('mother_id_number')}
                    placeholder={t('birth.idNumberPlaceholder')}
                  />
                  <Input
                    type="tel"
                    label={t('birth.phoneNumber')}
                    {...register('mother_phone')}
                    placeholder={t('birth.phoneNumberPlaceholder')}
                  />
                </div>

                {/* Photo Upload */}
                <div className="mt-4">
                  <ImageUpload
                    label={t('birth.motherPhoto')}
                    value={motherPhoto}
                    onChange={(file, preview) => {
                      setMotherPhoto(preview);
                    }}
                    helperText={t('birth.uploadMotherPhoto')}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 5: Informant */}
          {activeTab === 'informant' && (
            <div className="space-y-6">
              <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                <h3 className="text-lg font-semibold mb-4 text-purple-800">{t('birth.informantInformation')}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label={t('birth.witnessName')}
                    {...register('informant_name')}
                    placeholder={t('birth.fullNamePlaceholder')}
                  />
                  <Input
                    label={t('birth.witnessRelation')}
                    {...register('informant_relationship')}
                    placeholder={t('birth.relationshipPlaceholder')}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Input
                    label={t('birth.idNumber')}
                    {...register('informant_id_number')}
                    placeholder={t('birth.idNumberPlaceholder')}
                  />
                  <Input
                    type="tel"
                    label={t('birth.phoneNumber')}
                    {...register('informant_phone')}
                    placeholder={t('birth.phoneNumberPlaceholder')}
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('birth.address')}
                  </label>
                  <textarea
                    {...register('informant_address')}
                    rows={2}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                    placeholder={t('birth.addressPlaceholder')}
                  />
                </div>
              </div>

              {/* Additional Notes */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">{t('birth.additionalInformation')}</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('birth.notes')}
                    </label>
                    <textarea
                      {...register('notes')}
                      rows={4}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      placeholder={t('birth.notesPlaceholder')}
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
                ← {t('common.previous')}
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
              {t('common.cancel')}
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
                {t('common.next')} →
              </Button>
            ) : (
              <Button
                type="submit"
                loading={isSubmitting}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                {record ? t('birth.updateRecord') : t('birth.createRecord')}
              </Button>
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default BirthRecordForm;
