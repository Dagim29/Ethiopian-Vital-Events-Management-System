import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { deathRecordsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('deceased');
  const [calculatedAge, setCalculatedAge] = useState({ value: '', type: 'years' });
  
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    defaultValues: record || {}
  });

  // Watch date fields for automatic age calculation
  const dateOfBirth = watch('date_of_birth');
  const dateOfDeath = watch('date_of_death');

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

  // Calculate age automatically when dates change
  useEffect(() => {
    if (dateOfBirth && dateOfDeath) {
      const birth = new Date(dateOfBirth);
      const death = new Date(dateOfDeath);
      
      if (death >= birth) {
        const diffTime = Math.abs(death - birth);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        let ageValue, ageType;
        
        if (diffDays < 1) {
          // Less than 1 day - calculate hours
          const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
          ageValue = diffHours;
          ageType = 'hours';
        } else if (diffDays < 30) {
          // Less than 30 days
          ageValue = diffDays;
          ageType = 'days';
        } else if (diffDays < 365) {
          // Less than 1 year - calculate months
          const months = Math.floor(diffDays / 30);
          ageValue = months;
          ageType = 'months';
        } else {
          // Calculate years
          let years = death.getFullYear() - birth.getFullYear();
          const monthDiff = death.getMonth() - birth.getMonth();
          
          if (monthDiff < 0 || (monthDiff === 0 && death.getDate() < birth.getDate())) {
            years--;
          }
          
          ageValue = years;
          ageType = 'years';
        }
        
        setCalculatedAge({ value: ageValue, type: ageType });
        setValue('age_at_death', ageValue);
        setValue('age_type', ageType);
      }
    }
  }, [dateOfBirth, dateOfDeath, setValue]);

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

  const GENDER_OPTIONS_TRANSLATED = [
    { value: 'male', label: t('death.male') },
    { value: 'female', label: t('death.female') },
  ];

  const AGE_TYPE_OPTIONS_TRANSLATED = [
    { value: 'years', label: t('death.ageYears') },
    { value: 'months', label: t('death.ageMonths') },
    { value: 'days', label: t('death.ageDays') },
    { value: 'hours', label: t('death.ageHours') },
  ];

  const PLACE_OF_DEATH_OPTIONS_TRANSLATED = [
    { value: 'hospital', label: t('death.hospital') },
    { value: 'home', label: t('death.home') },
    { value: 'road', label: t('death.road') },
    { value: 'workplace', label: t('death.workplace') },
    { value: 'other', label: t('death.other') },
  ];

  const CAUSE_TYPE_OPTIONS_TRANSLATED = [
    { value: 'natural', label: t('death.natural') },
    { value: 'accident', label: t('death.accident') },
    { value: 'homicide', label: t('death.homicide') },
    { value: 'suicide', label: t('death.suicide') },
    { value: 'pending', label: t('death.pendingInvestigation') },
    { value: 'unknown', label: t('death.unknown') },
  ];

  const MARITAL_STATUS_OPTIONS_TRANSLATED = [
    { value: 'single', label: t('death.single') },
    { value: 'married', label: t('death.married') },
    { value: 'divorced', label: t('death.divorced') },
    { value: 'widowed', label: t('death.widowed') },
  ];

  const EDUCATION_OPTIONS_TRANSLATED = [
    { value: 'none', label: t('death.educationNone') },
    { value: 'primary', label: t('death.educationPrimary') },
    { value: 'secondary', label: t('death.educationSecondary') },
    { value: 'tertiary', label: t('death.educationTertiary') },
    { value: 'university', label: t('death.educationUniversity') },
  ];

  const ETHIOPIAN_REGIONS_TRANSLATED = [
    { value: 'AD', label: t('death.addisAbaba') },
    { value: 'AA', label: t('death.afar') },
    { value: 'AM', label: t('death.amhara') },
    { value: 'BG', label: t('death.benishangul') },
    { value: 'DD', label: t('death.direDawa') },
    { value: 'GA', label: t('death.gambella') },
    { value: 'HA', label: t('death.harari') },
    { value: 'OR', label: t('death.oromia') },
    { value: 'SI', label: t('death.sidama') },
    { value: 'SO', label: t('death.somali') },
    { value: 'SN', label: t('death.southernNations') },
    { value: 'TI', label: t('death.tigray') },
  ];

  const tabs = [
    { id: 'deceased', label: t('death.deceasedInfo'), icon: '👤' },
    { id: 'death', label: t('death.deathDetails'), icon: '📋' },
    { id: 'location', label: t('death.location'), icon: '📍' },
    { id: 'informant', label: t('death.informantInfo'), icon: '👥' },
    { id: 'medical', label: t('death.medicalInfo'), icon: '⚕️' },
    { id: 'burial', label: t('death.burialInfo'), icon: '⚰️' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={record ? t('death.editDeath') : t('death.registerNewDeath')}
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
                <h3 className="text-lg font-semibold mb-4 text-red-800">{t('death.personalInformation')}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label={t('death.firstName')}
                    {...register('deceased_first_name', { required: t('death.firstNameRequired') })}
                    error={errors.deceased_first_name}
                    required
                  />
                  <Input
                    label={t('death.middleName')}
                    {...register('deceased_father_name', { required: t('death.fatherNameRequired') })}
                    error={errors.deceased_father_name}
                    required
                  />
                  <Input
                    label={t('death.lastName')}
                    {...register('deceased_grandfather_name')}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <SelectField
                    label={t('death.gender')}
                    name="deceased_gender"
                    options={GENDER_OPTIONS_TRANSLATED}
                    register={register}
                    errors={errors}
                    required
                  />
                  <Input
                    type="date"
                    label={t('death.dateOfBirth')}
                    {...register('date_of_birth')}
                  />
                  <Input
                    label={t('death.nationality')}
                    {...register('nationality')}
                    placeholder={t('death.nationalityPlaceholder')}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <Input
                    label={t('death.ethnicity')}
                    {...register('ethnicity')}
                    placeholder={t('death.ethnicityPlaceholder')}
                  />
                  <Input
                    label={t('death.religion')}
                    {...register('religion')}
                    placeholder={t('death.religionPlaceholder')}
                  />
                  <SelectField
                    label={t('death.maritalStatus')}
                    name="marital_status"
                    options={MARITAL_STATUS_OPTIONS_TRANSLATED}
                    register={register}
                    errors={errors}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Input
                    label={t('death.occupation')}
                    {...register('occupation')}
                    placeholder={t('death.occupationPlaceholder')}
                  />
                  <SelectField
                    label={t('death.educationLevel')}
                    name="education"
                    options={EDUCATION_OPTIONS_TRANSLATED}
                    register={register}
                    errors={errors}
                  />
                </div>
              </div>

              {/* Usual Residence */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">{t('death.usualResidence')}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SelectField
                    label={t('death.deathRegion')}
                    name="usual_region"
                    options={ETHIOPIAN_REGIONS_TRANSLATED}
                    register={register}
                    errors={errors}
                  />
                  <Input
                    label={t('death.deathZone')}
                    {...register('usual_zone')}
                    placeholder={t('death.zonePlaceholder')}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <Input
                    label={t('death.deathWoreda')}
                    {...register('usual_woreda')}
                    placeholder={t('death.woredaPlaceholder')}
                  />
                  <Input
                    label={t('death.deathKebele')}
                    {...register('usual_kebele')}
                    placeholder={t('death.kebelePlaceholder')}
                  />
                  <Input
                    label={t('death.cityTown')}
                    {...register('usual_city')}
                  />
                </div>

                <div className="mt-4">
                  <Input
                    label={t('death.houseNumber')}
                    {...register('usual_house_number')}
                    placeholder={t('death.houseNumberPlaceholder')}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Death Details */}
          {activeTab === 'death' && (
            <div className="space-y-6">
              <div className="bg-red-50 p-6 rounded-lg border border-red-200">
                <h3 className="text-lg font-semibold mb-4 text-red-800">{t('death.deathInformation')}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    type="date"
                    label={t('death.dateOfDeath')}
                    {...register('date_of_death', { required: t('death.dateOfDeathRequired') })}
                    error={errors.date_of_death}
                    required
                  />
                  <Input
                    type="time"
                    label={t('death.timeOfDeathLabel')}
                    {...register('time_of_death')}
                  />
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      {t('death.ageAtDeathAutoCalculated')}
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        {...register('age_at_death')}
                        placeholder={t('common.loading')}
                        className="flex-1"
                        readOnly
                        style={{ backgroundColor: '#f3f4f6' }}
                      />
                      {calculatedAge.value && (
                        <span className="text-sm font-medium text-green-600 whitespace-nowrap">
                          {calculatedAge.value} {t(`death.age${calculatedAge.type.charAt(0).toUpperCase() + calculatedAge.type.slice(1)}`)}
                        </span>
                      )}
                    </div>
                    {!dateOfBirth && !dateOfDeath && (
                      <p className="text-xs text-gray-500">{t('death.enterDatesToCalculate')}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      {t('death.ageTypeAutoSet')}
                    </label>
                    <select
                      {...register('age_type')}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm bg-gray-100"
                      disabled
                    >
                      <option value="">{t('common.select')} {t('death.ageTypeAutoSet').toLowerCase()}</option>
                      {AGE_TYPE_OPTIONS_TRANSLATED.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <SelectField
                    label={t('death.placeOfDeathType')}
                    name="place_of_death_type"
                    options={PLACE_OF_DEATH_OPTIONS_TRANSLATED}
                    register={register}
                    errors={errors}
                  />
                </div>

                <div className="mt-4">
                  <Input
                    label={t('death.placeOfDeathName')}
                    {...register('place_of_death_name')}
                    placeholder={t('death.placeOfDeathPlaceholder')}
                  />
                </div>
              </div>

              {/* Cause of Death */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">{t('death.causeOfDeathSection')}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label={t('death.immediateCause')}
                    {...register('cause_of_death')}
                    placeholder={t('death.immediateCausePlaceholder')}
                  />
                  <SelectField
                    label={t('death.causeType')}
                    name="cause_of_death_type"
                    options={CAUSE_TYPE_OPTIONS_TRANSLATED}
                    register={register}
                    errors={errors}
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('death.underlyingCauses')}
                  </label>
                  <textarea
                    {...register('underlying_causes')}
                    rows={3}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                    placeholder={t('death.underlyingCausesPlaceholder')}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Location */}
          {activeTab === 'location' && (
            <div className="space-y-6">
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold mb-4 text-blue-800">{t('death.deathLocationDetails')}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SelectField
                    label={t('death.deathRegion')}
                    name="death_region"
                    options={ETHIOPIAN_REGIONS_TRANSLATED}
                    register={register}
                    errors={errors}
                  />
                  <Input
                    label={t('death.deathZone')}
                    {...register('death_zone')}
                    placeholder={t('death.zonePlaceholder')}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <Input
                    label={t('death.deathWoreda')}
                    {...register('death_woreda')}
                    placeholder={t('death.woredaPlaceholder')}
                  />
                  <Input
                    label={t('death.deathKebele')}
                    {...register('death_kebele')}
                    placeholder={t('death.kebelePlaceholder')}
                  />
                  <Input
                    label={t('death.cityTown')}
                    {...register('death_city')}
                  />
                </div>

                <div className="mt-4">
                  <Input
                    label={t('death.specificLocation')}
                    {...register('death_specific_location')}
                    placeholder={t('death.specificLocationPlaceholder')}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Informant */}
          {activeTab === 'informant' && (
            <div className="space-y-6">
              <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                <h3 className="text-lg font-semibold mb-4 text-green-800">{t('death.informantInformation')}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label={t('death.informantNameLabel')}
                    {...register('informant_name')}
                    placeholder={t('death.fullNamePlaceholder')}
                  />
                  <Input
                    label={t('death.relationshipToDeceased')}
                    {...register('informant_relationship')}
                    placeholder={t('death.relationshipPlaceholder')}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Input
                    label={t('death.idNumberLabel')}
                    {...register('informant_id_number')}
                    placeholder={t('death.idNumberPlaceholder')}
                  />
                  <Input
                    type="tel"
                    label={t('death.phoneNumberLabel')}
                    {...register('informant_phone')}
                    placeholder={t('death.phoneNumberPlaceholder')}
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('death.addressLabel')}
                  </label>
                  <textarea
                    {...register('informant_address')}
                    rows={2}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                    placeholder={t('death.informantAddressPlaceholder')}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 5: Medical */}
          {activeTab === 'medical' && (
            <div className="space-y-6">
              <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                <h3 className="text-lg font-semibold mb-4 text-purple-800">{t('death.medicalCertification')}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label={t('death.certifyingDoctor')}
                    {...register('certifying_doctor')}
                    placeholder={t('death.doctorNamePlaceholder')}
                  />
                  <Input
                    label={t('death.doctorQualification')}
                    {...register('doctor_qualification')}
                    placeholder={t('death.doctorQualificationPlaceholder')}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Input
                    label={t('death.medicalCertificateNumber')}
                    {...register('medical_certificate_number')}
                    placeholder={t('death.medicalCertificatePlaceholder')}
                  />
                  <Input
                    label={t('death.healthFacilityName')}
                    {...register('health_facility_name')}
                    placeholder={t('death.healthFacilityPlaceholder')}
                  />
                </div>

                <div className="mt-4 flex items-center">
                  <input
                    type="checkbox"
                    {...register('death_cause_verified')}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    {t('death.deathCauseVerified')}
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Tab 6: Burial */}
          {activeTab === 'burial' && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">{t('death.burialInformation')}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    type="date"
                    label={t('death.burialDateLabel')}
                    {...register('burial_date')}
                  />
                  <Input
                    label={t('death.burialPlaceLabel')}
                    {...register('burial_place')}
                    placeholder={t('death.burialPlacePlaceholder')}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <SelectField
                    label={t('death.burialRegion')}
                    name="burial_region"
                    options={ETHIOPIAN_REGIONS_TRANSLATED}
                    register={register}
                    errors={errors}
                  />
                  <Input
                    label={t('death.burialZone')}
                    {...register('burial_zone')}
                  />
                  <Input
                    label={t('death.burialWoreda')}
                    {...register('burial_woreda')}
                  />
                </div>

                <div className="mt-4">
                  <Input
                    label={t('death.undertakerName')}
                    {...register('undertaker_name')}
                    placeholder={t('death.undertakerPlaceholder')}
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
            
            {activeTab !== 'burial' ? (
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
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
              >
                {record ? t('death.updateRecord') : t('death.createRecord')}
              </Button>
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default DeathRecordForm;
