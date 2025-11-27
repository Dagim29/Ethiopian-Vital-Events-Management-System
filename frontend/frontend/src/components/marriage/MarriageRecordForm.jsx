import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { marriageRecordsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';
import Input from '../common/Input';
import Modal from '../common/Modal';
import ImageUpload from '../common/ImageUpload';
import { toast } from 'react-toastify';

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
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('marriage');
  const [groomPhoto, setGroomPhoto] = useState(null);
  const [bridePhoto, setBridePhoto] = useState(null);
  
  const GENDER_OPTIONS = [
    { value: 'male', label: t('birth.male') },
    { value: 'female', label: t('birth.female') },
  ];

  const MARRIAGE_TYPE_OPTIONS = [
    { value: 'civil', label: t('marriage.civil') },
    { value: 'religious', label: t('marriage.religious') },
    { value: 'traditional', label: t('marriage.traditional') },
    { value: 'customary', label: t('marriage.customary') },
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
  
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    defaultValues: record || {
      spouse1_gender: 'male',
      spouse2_gender: 'female'
    }
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
    } else {
      // Set default genders for new records
      reset({
        spouse1_gender: 'male',
        spouse2_gender: 'female'
      });
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
    { id: 'marriage', label: t('marriage.marriageDetails'), icon: '💒' },
    { id: 'spouse1', label: t('marriage.groomInfo'), icon: '🤵' },
    { id: 'spouse2', label: t('marriage.brideInfo'), icon: '👰' },
    { id: 'witnesses', label: t('marriage.witnesses'), icon: '👥' },
    { id: 'ceremony', label: t('marriage.ceremony'), icon: '🎉' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={record ? t('marriage.editMarriage') : t('marriage.registerNewMarriage')}
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
                <h3 className="text-lg font-semibold mb-4 text-pink-800">{t('marriage.marriageInformation')}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    type="date"
                    label={t('marriage.marriageDate')}
                    {...register('marriage_date', { required: t('marriage.marriageDateRequired') })}
                    error={errors.marriage_date}
                    required
                  />
                  <SelectField
                    label={t('marriage.marriageType')}
                    name="marriage_type"
                    options={MARRIAGE_TYPE_OPTIONS}
                    register={register}
                    errors={errors}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Input
                    label={t('marriage.marriagePlaceLabel')}
                    {...register('marriage_place')}
                    placeholder={t('marriage.marriagePlacePlaceholder')}
                  />
                  <Input
                    label={t('marriage.officiantName')}
                    {...register('officiant_name')}
                    placeholder={t('marriage.officiantPlaceholder')}
                  />
                </div>
              </div>

              {/* Marriage Location */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">{t('marriage.marriageLocation')}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SelectField
                    label={t('marriage.marriageRegion')}
                    name="marriage_region"
                    options={ETHIOPIAN_REGIONS}
                    register={register}
                    errors={errors}
                  />
                  <Input
                    label={t('marriage.marriageZone')}
                    {...register('marriage_zone')}
                    placeholder={t('birth.zonePlaceholder')}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Input
                    label={t('marriage.marriageWoreda')}
                    {...register('marriage_woreda')}
                    placeholder={t('birth.woredaPlaceholder')}
                  />
                  <Input
                    label={t('marriage.marriageKebele')}
                    {...register('marriage_kebele')}
                    placeholder={t('birth.kebelePlaceholder')}
                  />
                </div>

                <div className="mt-4">
                  <Input
                    label={t('marriage.marriageCity')}
                    {...register('marriage_city')}
                    placeholder={t('birth.zonePlaceholder')}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Spouse 1 (Groom) */}
          {activeTab === 'spouse1' && (
            <div className="space-y-6">
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold mb-4 text-blue-800">{t('marriage.groomInfo')}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label={t('marriage.fullName')}
                    {...register('spouse1_full_name', { required: t('marriage.fullNameRequired') })}
                    error={errors.spouse1_full_name}
                    required
                    placeholder={t('marriage.fullNamePlaceholder')}
                  />
                  <Input
                    label={t('marriage.fatherName')}
                    {...register('spouse1_father_name')}
                    placeholder={t('marriage.fatherNamePlaceholder')}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <Input
                    type="date"
                    label={t('marriage.dateOfBirth')}
                    {...register('spouse1_date_of_birth')}
                  />
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      {t('marriage.genderAutoSet')}
                    </label>
                    <select
                      {...register('spouse1_gender')}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-gray-100"
                      disabled
                    >
                      {GENDER_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500">{t('marriage.genderAutoMale')}</p>
                  </div>
                  <Input
                    label={t('marriage.nationality')}
                    {...register('spouse1_nationality')}
                    placeholder={t('marriage.nationalityPlaceholder')}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Input
                    label={t('marriage.ethnicity')}
                    {...register('spouse1_ethnicity')}
                    placeholder={t('marriage.ethnicityPlaceholder')}
                  />
                  <Input
                    label={t('marriage.religion')}
                    {...register('spouse1_religion')}
                    placeholder={t('marriage.religionPlaceholder')}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Input
                    label={t('marriage.occupation')}
                    {...register('spouse1_occupation')}
                    placeholder={t('marriage.occupationPlaceholder')}
                  />
                  <Input
                    label={t('marriage.education')}
                    {...register('spouse1_education')}
                    placeholder={t('marriage.educationPlaceholder')}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Input
                    label={t('marriage.idNumber')}
                    {...register('spouse1_id_number')}
                    placeholder={t('marriage.idNumberPlaceholder')}
                  />
                  <Input
                    type="tel"
                    label={t('marriage.phoneNumber')}
                    {...register('spouse1_phone')}
                    placeholder={t('marriage.phoneNumberPlaceholder')}
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('marriage.address')}
                  </label>
                  <textarea
                    {...register('spouse1_address')}
                    rows={2}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder={t('marriage.addressPlaceholder')}
                  />
                </div>

                {/* Photo Upload */}
                <div className="mt-4">
                  <ImageUpload
                    label={t('marriage.groomPhoto')}
                    value={groomPhoto}
                    onChange={(file, preview) => {
                      setGroomPhoto(preview);
                    }}
                    helperText={t('marriage.uploadGroomPhoto')}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Spouse 2 (Bride) */}
          {activeTab === 'spouse2' && (
            <div className="space-y-6">
              <div className="bg-pink-50 p-6 rounded-lg border border-pink-200">
                <h3 className="text-lg font-semibold mb-4 text-pink-800">{t('marriage.brideInfo')}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label={t('marriage.fullName')}
                    {...register('spouse2_full_name', { required: t('marriage.fullNameRequired') })}
                    error={errors.spouse2_full_name}
                    required
                    placeholder={t('marriage.fullNamePlaceholder')}
                  />
                  <Input
                    label={t('marriage.fatherName')}
                    {...register('spouse2_father_name')}
                    placeholder={t('marriage.fatherNamePlaceholder')}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <Input
                    type="date"
                    label={t('marriage.dateOfBirth')}
                    {...register('spouse2_date_of_birth')}
                  />
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      {t('marriage.genderAutoSet')}
                    </label>
                    <select
                      {...register('spouse2_gender')}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm bg-gray-100"
                      disabled
                    >
                      {GENDER_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500">{t('marriage.genderAutoFemale')}</p>
                  </div>
                  <Input
                    label={t('marriage.nationality')}
                    {...register('spouse2_nationality')}
                    placeholder={t('marriage.nationalityPlaceholder')}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Input
                    label={t('marriage.ethnicity')}
                    {...register('spouse2_ethnicity')}
                    placeholder={t('marriage.ethnicityPlaceholder')}
                  />
                  <Input
                    label={t('marriage.religion')}
                    {...register('spouse2_religion')}
                    placeholder={t('marriage.religionPlaceholder')}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Input
                    label={t('marriage.occupation')}
                    {...register('spouse2_occupation')}
                    placeholder={t('marriage.brideOccupationPlaceholder')}
                  />
                  <Input
                    label={t('marriage.education')}
                    {...register('spouse2_education')}
                    placeholder={t('marriage.educationPlaceholder')}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Input
                    label={t('marriage.idNumber')}
                    {...register('spouse2_id_number')}
                    placeholder={t('marriage.idNumberPlaceholder')}
                  />
                  <Input
                    type="tel"
                    label={t('marriage.phoneNumber')}
                    {...register('spouse2_phone')}
                    placeholder={t('marriage.phoneNumberPlaceholder')}
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('marriage.address')}
                  </label>
                  <textarea
                    {...register('spouse2_address')}
                    rows={2}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm"
                    placeholder={t('marriage.addressPlaceholder')}
                  />
                </div>

                {/* Photo Upload */}
                <div className="mt-4">
                  <ImageUpload
                    label={t('marriage.bridePhoto')}
                    value={bridePhoto}
                    onChange={(file, preview) => {
                      setBridePhoto(preview);
                    }}
                    helperText={t('marriage.uploadBridePhoto')}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Witnesses */}
          {activeTab === 'witnesses' && (
            <div className="space-y-6">
              <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-200">
                <h3 className="text-lg font-semibold mb-4 text-indigo-800">{t('marriage.witness1')}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label={t('marriage.witnessName')}
                    {...register('witness1_name')}
                    placeholder={t('marriage.fullNamePlaceholder')}
                  />
                  <Input
                    label={t('marriage.witnessRelationship')}
                    {...register('witness1_relationship')}
                    placeholder={t('marriage.relationshipPlaceholder')}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Input
                    label={t('marriage.witnessIdNumber')}
                    {...register('witness1_id_number')}
                    placeholder={t('marriage.idNumberPlaceholder')}
                  />
                  <Input
                    type="tel"
                    label={t('marriage.witnessPhone')}
                    {...register('witness1_phone')}
                    placeholder={t('marriage.phoneNumberPlaceholder')}
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('marriage.witnessAddress')}
                  </label>
                  <textarea
                    {...register('witness1_address')}
                    rows={2}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder={t('marriage.addressPlaceholder')}
                  />
                </div>
              </div>

              <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-200">
                <h3 className="text-lg font-semibold mb-4 text-indigo-800">{t('marriage.witness2')}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label={t('marriage.witnessName')}
                    {...register('witness2_name')}
                    placeholder={t('marriage.fullNamePlaceholder')}
                  />
                  <Input
                    label={t('marriage.witnessRelationship')}
                    {...register('witness2_relationship')}
                    placeholder={t('marriage.relationshipPlaceholder')}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Input
                    label={t('marriage.witnessIdNumber')}
                    {...register('witness2_id_number')}
                    placeholder={t('marriage.idNumberPlaceholder')}
                  />
                  <Input
                    type="tel"
                    label={t('marriage.witnessPhone')}
                    {...register('witness2_phone')}
                    placeholder={t('marriage.phoneNumberPlaceholder')}
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('marriage.witnessAddress')}
                  </label>
                  <textarea
                    {...register('witness2_address')}
                    rows={2}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder={t('marriage.addressPlaceholder')}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 5: Ceremony */}
          {activeTab === 'ceremony' && (
            <div className="space-y-6">
              <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                <h3 className="text-lg font-semibold mb-4 text-purple-800">{t('marriage.ceremonyDetails')}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label={t('marriage.ceremonyVenue')}
                    {...register('ceremony_venue')}
                    placeholder={t('marriage.ceremonyVenuePlaceholder')}
                  />
                  <Input
                    label={t('marriage.receptionVenue')}
                    {...register('reception_venue')}
                    placeholder={t('marriage.receptionVenuePlaceholder')}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Input
                    type="number"
                    label={t('marriage.numberOfGuests')}
                    {...register('number_of_guests')}
                    placeholder={t('marriage.guestsPlaceholder')}
                  />
                  <Input
                    label={t('marriage.marriageLicenseNumber')}
                    {...register('marriage_license_number')}
                    placeholder={t('marriage.licensePlaceholder')}
                  />
                </div>
              </div>

              {/* Additional Notes */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">{t('marriage.additionalInformation')}</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('marriage.notes')}
                    </label>
                    <textarea
                      {...register('notes')}
                      rows={4}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm"
                      placeholder={t('marriage.notesPlaceholder')}
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
            
            {activeTab !== 'ceremony' ? (
              <Button
                type="button"
                onClick={() => {
                  const currentIndex = tabs.findIndex(t => t.id === activeTab);
                  if (currentIndex < tabs.length - 1) setActiveTab(tabs[currentIndex + 1].id);
                }}
                className="bg-gradient-to-r from-pink-600 to-pink-700"
              >
                {t('common.next')} →
              </Button>
            ) : (
              <Button
                type="submit"
                loading={isSubmitting}
                className="bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800"
              >
                {record ? t('marriage.updateRecord') : t('marriage.createRecord')}
              </Button>
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default MarriageRecordForm;
