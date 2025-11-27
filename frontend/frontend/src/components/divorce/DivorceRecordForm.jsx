import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { divorceRecordsAPI } from '../../services/api';
import Button from '../common/Button';
import Input from '../common/Input';
import Modal from '../common/Modal';
import ImageUpload from '../common/ImageUpload';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('divorce');
  const [husbandPhoto, setHusbandPhoto] = useState(null);
  const [wifePhoto, setWifePhoto] = useState(null);
  const [marriageDuration, setMarriageDuration] = useState({ years: 0, months: 0, days: 0 });
  
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    defaultValues: record || {}
  });

  const GENDER_OPTIONS = [
    { value: 'male', label: t('divorce.male') },
    { value: 'female', label: t('divorce.female') },
  ];

  const DIVORCE_TYPE_OPTIONS = [
    { value: 'court', label: t('divorce.courtDecree') },
    { value: 'mutual', label: t('divorce.mutualConsent') },
    { value: 'contested', label: t('divorce.contested') },
  ];

  const DIVORCE_REASON_OPTIONS = [
    { value: 'irreconcilable_differences', label: t('divorce.irreconcilableDifferences') },
    { value: 'adultery', label: t('divorce.adultery') },
    { value: 'abandonment', label: t('divorce.abandonment') },
    { value: 'abuse', label: t('divorce.abuse') },
    { value: 'other', label: t('divorce.other') },
  ];

  const ETHIOPIAN_REGIONS = [
    { value: 'AD', label: t('divorce.addisAbaba') },
    { value: 'AA', label: t('divorce.afar') },
    { value: 'AM', label: t('divorce.amhara') },
    { value: 'BG', label: t('divorce.benishangul') },
    { value: 'DD', label: t('divorce.direDawa') },
    { value: 'GA', label: t('divorce.gambella') },
    { value: 'HA', label: t('divorce.harari') },
    { value: 'OR', label: t('divorce.oromia') },
    { value: 'SI', label: t('divorce.sidama') },
    { value: 'SO', label: t('divorce.somali') },
    { value: 'SN', label: t('divorce.southernNations') },
    { value: 'TI', label: t('divorce.tigray') },
  ];

  // Watch date fields for automatic duration calculation
  const marriageDate = watch('marriage_date') || watch('original_marriage_date');
  const divorceDate = watch('divorce_date');

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

  // Calculate marriage duration automatically
  useEffect(() => {
    if (marriageDate && divorceDate) {
      const marriage = new Date(marriageDate);
      const divorce = new Date(divorceDate);
      
      if (divorce >= marriage) {
        // Calculate years, months, and days
        let years = divorce.getFullYear() - marriage.getFullYear();
        let months = divorce.getMonth() - marriage.getMonth();
        let days = divorce.getDate() - marriage.getDate();
        
        // Adjust for negative days
        if (days < 0) {
          months--;
          const prevMonth = new Date(divorce.getFullYear(), divorce.getMonth(), 0);
          days += prevMonth.getDate();
        }
        
        // Adjust for negative months
        if (months < 0) {
          years--;
          months += 12;
        }
        
        setMarriageDuration({ years, months, days });
        setValue('marriage_duration_years', years);
      }
    }
  }, [marriageDate, divorceDate, setValue]);

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
        toast.success(t('messages.recordUpdated'));
      } else {
        await divorceRecordsAPI.createRecord({
          ...recordData,
          status: 'draft',
        });
        toast.success(t('messages.recordCreated'));
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving divorce record:', error);
      const errorMsg = error.response?.data?.errors?.join(', ') || error.message || t('messages.operationFailed');
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'divorce', label: t('divorce.divorceDetails'), icon: '⚖️' },
    { id: 'spouse1', label: t('divorce.spouse1Info'), icon: '👨' },
    { id: 'spouse2', label: t('divorce.spouse2Info'), icon: '👩' },
    { id: 'marriage', label: t('divorce.marriageInfo'), icon: '💍' },
    { id: 'settlement', label: t('divorce.settlement'), icon: '📄' },
    { id: 'witnesses', label: t('divorce.witnesses'), icon: '👥' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={record ? t('divorce.editDivorce') : t('divorce.registerNewDivorce')}
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
                <h3 className="text-lg font-semibold mb-4 text-orange-800">{t('divorce.divorceInformation')}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    type="date"
                    label={t('divorce.divorceDate')}
                    {...register('divorce_date', { required: t('divorce.divorceDateRequired') })}
                    error={errors.divorce_date}
                    required
                  />
                  <SelectField
                    label={t('divorce.divorceType')}
                    name="divorce_type"
                    options={DIVORCE_TYPE_OPTIONS}
                    register={register}
                    errors={errors}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <SelectField
                    label={t('divorce.divorceReason')}
                    name="divorce_reason"
                    options={DIVORCE_REASON_OPTIONS}
                    register={register}
                    errors={errors}
                  />
                  <Input
                    label={t('divorce.caseNumber')}
                    {...register('case_number')}
                    placeholder={t('divorce.caseNumberPlaceholder')}
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('divorce.divorceReasons')}
                  </label>
                  <textarea
                    {...register('divorce_reasons')}
                    rows={3}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                    placeholder={t('divorce.divorceReasonsPlaceholder')}
                  />
                </div>
              </div>

              {/* Court Information */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">{t('divorce.courtInformation')}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label={t('divorce.courtName')}
                    {...register('court_name')}
                    placeholder={t('divorce.courtNamePlaceholder')}
                  />
                  <Input
                    label={t('divorce.courtCaseNumber')}
                    {...register('court_case_number')}
                    placeholder={t('divorce.caseNumberPlaceholder')}
                  />
                </div>

                <div className="mt-4">
                  <Input
                    label={t('divorce.judgeName')}
                    {...register('judge_name')}
                    placeholder={t('divorce.judgeNamePlaceholder')}
                  />
                </div>
              </div>

              {/* Location */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">{t('divorce.divorceLocation')}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SelectField
                    label={t('divorce.region')}
                    name="divorce_region"
                    options={ETHIOPIAN_REGIONS}
                    register={register}
                    errors={errors}
                  />
                  <Input
                    label={t('divorce.zone')}
                    {...register('divorce_zone')}
                    placeholder={t('divorce.zonePlaceholder')}
                  />
                </div>

                <div className="mt-4">
                  <Input
                    label={t('divorce.woreda')}
                    {...register('divorce_woreda')}
                    placeholder={t('divorce.woredaPlaceholder')}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Spouse 1 */}
          {activeTab === 'spouse1' && (
            <div className="space-y-6">
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold mb-4 text-blue-800">{t('divorce.spouse1Info')}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label={t('divorce.fullName')}
                    {...register('spouse1_full_name', { required: t('divorce.fullNameRequired') })}
                    error={errors.spouse1_full_name}
                    required
                    placeholder={t('divorce.fullNamePlaceholder')}
                  />
                  <Input
                    label={t('divorce.fatherName')}
                    {...register('spouse1_father_name')}
                    placeholder={t('divorce.fatherNamePlaceholder')}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <Input
                    type="date"
                    label={t('divorce.dateOfBirth')}
                    {...register('spouse1_date_of_birth')}
                  />
                  <SelectField
                    label={t('divorce.gender')}
                    name="spouse1_gender"
                    options={GENDER_OPTIONS}
                    register={register}
                    errors={errors}
                  />
                  <Input
                    label={t('divorce.nationality')}
                    {...register('spouse1_nationality')}
                    placeholder={t('divorce.nationalityPlaceholder')}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Input
                    label={t('divorce.ethnicity')}
                    {...register('spouse1_ethnicity')}
                    placeholder={t('divorce.ethnicityPlaceholder')}
                  />
                  <Input
                    label={t('divorce.occupation')}
                    {...register('spouse1_occupation')}
                    placeholder={t('divorce.occupationPlaceholder')}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Input
                    label={t('divorce.idNumber')}
                    {...register('spouse1_id_number')}
                    placeholder={t('divorce.idNumberPlaceholder')}
                  />
                  <Input
                    type="tel"
                    label={t('divorce.phoneNumber')}
                    {...register('spouse1_phone')}
                    placeholder={t('divorce.phoneNumberPlaceholder')}
                  />
                </div>

                {/* Photo Upload */}
                <div className="mt-4">
                  <ImageUpload
                    label={t('divorce.spouse1Photo')}
                    value={husbandPhoto}
                    onChange={(_file, preview) => {
                      setHusbandPhoto(preview);
                    }}
                    helperText={t('divorce.uploadSpouse1Photo')}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Spouse 2 */}
          {activeTab === 'spouse2' && (
            <div className="space-y-6">
              <div className="bg-pink-50 p-6 rounded-lg border border-pink-200">
                <h3 className="text-lg font-semibold mb-4 text-pink-800">{t('divorce.spouse2Info')}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label={t('divorce.fullName')}
                    {...register('spouse2_full_name', { required: t('divorce.fullNameRequired') })}
                    error={errors.spouse2_full_name}
                    required
                    placeholder={t('divorce.fullNamePlaceholder')}
                  />
                  <Input
                    label={t('divorce.fatherName')}
                    {...register('spouse2_father_name')}
                    placeholder={t('divorce.fatherNamePlaceholder')}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <Input
                    type="date"
                    label={t('divorce.dateOfBirth')}
                    {...register('spouse2_date_of_birth')}
                  />
                  <SelectField
                    label={t('divorce.gender')}
                    name="spouse2_gender"
                    options={GENDER_OPTIONS}
                    register={register}
                    errors={errors}
                  />
                  <Input
                    label={t('divorce.nationality')}
                    {...register('spouse2_nationality')}
                    placeholder={t('divorce.nationalityPlaceholder')}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Input
                    label={t('divorce.ethnicity')}
                    {...register('spouse2_ethnicity')}
                    placeholder={t('divorce.ethnicityPlaceholder')}
                  />
                  <Input
                    label={t('divorce.occupation')}
                    {...register('spouse2_occupation')}
                    placeholder={t('divorce.occupationPlaceholder')}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Input
                    label={t('divorce.idNumber')}
                    {...register('spouse2_id_number')}
                    placeholder={t('divorce.idNumberPlaceholder')}
                  />
                  <Input
                    type="tel"
                    label={t('divorce.phoneNumber')}
                    {...register('spouse2_phone')}
                    placeholder={t('divorce.phoneNumberPlaceholder')}
                  />
                </div>

                {/* Photo Upload */}
                <div className="mt-4">
                  <ImageUpload
                    label={t('divorce.spouse2Photo')}
                    value={wifePhoto}
                    onChange={(_file, preview) => {
                      setWifePhoto(preview);
                    }}
                    helperText={t('divorce.uploadSpouse2Photo')}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Marriage Information */}
          {activeTab === 'marriage' && (
            <div className="space-y-6">
              <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                <h3 className="text-lg font-semibold mb-4 text-purple-800">{t('divorce.originalMarriageInfo')}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    type="date"
                    label={t('divorce.marriageDate')}
                    {...register('marriage_date')}
                  />
                  <Input
                    type="date"
                    label={t('divorce.originalMarriageDate')}
                    {...register('original_marriage_date')}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Input
                    label={t('divorce.marriageCertificateNumber')}
                    {...register('original_marriage_certificate_number')}
                    placeholder={t('divorce.marriageCertificatePlaceholder')}
                  />
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      {t('divorce.marriageDurationYears')}
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        {...register('marriage_duration_years')}
                        placeholder={t('divorce.marriageDurationPlaceholder')}
                        className="flex-1"
                        readOnly
                        style={{ backgroundColor: '#f3f4f6' }}
                      />
                      {(marriageDuration.years > 0 || marriageDuration.months > 0 || marriageDuration.days > 0) && (
                        <span className="text-sm font-medium text-green-600 whitespace-nowrap">
                          {marriageDuration.years}y {marriageDuration.months}m {marriageDuration.days}d
                        </span>
                      )}
                    </div>
                    {!marriageDate && !divorceDate && (
                      <p className="text-xs text-gray-500">{t('divorce.enterDatesToCalculate')}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 5: Settlement */}
          {activeTab === 'settlement' && (
            <div className="space-y-6">
              <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                <h3 className="text-lg font-semibold mb-4 text-green-800">{t('divorce.childrenCustody')}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    type="number"
                    label={t('divorce.numberOfChildren')}
                    {...register('number_of_children')}
                    placeholder={t('divorce.numberOfChildrenPlaceholder')}
                  />
                  <Input
                    label={t('divorce.childCustodyDetails')}
                    {...register('child_custody_details')}
                    placeholder={t('divorce.childCustodyPlaceholder')}
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('divorce.childSupportArrangements')}
                  </label>
                  <textarea
                    {...register('child_support_arrangements')}
                    rows={3}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                    placeholder={t('divorce.childSupportPlaceholder')}
                  />
                </div>
              </div>

              {/* Property Settlement */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">{t('divorce.propertySettlement')}</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('divorce.propertySettlementDetails')}
                    </label>
                    <textarea
                      {...register('property_settlement')}
                      rows={4}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                      placeholder={t('divorce.propertySettlementPlaceholder')}
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
                <h3 className="text-lg font-semibold mb-4 text-indigo-800">{t('divorce.witness1')}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label={t('divorce.witnessName')}
                    {...register('witness1_name')}
                    placeholder={t('divorce.witnessNamePlaceholder')}
                  />
                  <Input
                    type="tel"
                    label={t('divorce.witnessPhone')}
                    {...register('witness1_phone')}
                    placeholder={t('divorce.witnessPhonePlaceholder')}
                  />
                </div>
              </div>

              <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-200">
                <h3 className="text-lg font-semibold mb-4 text-indigo-800">{t('divorce.witness2')}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label={t('divorce.witnessName')}
                    {...register('witness2_name')}
                    placeholder={t('divorce.witnessNamePlaceholder')}
                  />
                  <Input
                    type="tel"
                    label={t('divorce.witnessPhone')}
                    {...register('witness2_phone')}
                    placeholder={t('divorce.witnessPhonePlaceholder')}
                  />
                </div>
              </div>

              {/* Additional Notes */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">{t('divorce.additionalInformation')}</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('divorce.notes')}
                    </label>
                    <textarea
                      {...register('notes')}
                      rows={4}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                      placeholder={t('divorce.notesPlaceholder')}
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
            
            {activeTab !== 'witnesses' ? (
              <Button
                type="button"
                onClick={() => {
                  const currentIndex = tabs.findIndex(t => t.id === activeTab);
                  if (currentIndex < tabs.length - 1) setActiveTab(tabs[currentIndex + 1].id);
                }}
                className="bg-gradient-to-r from-orange-600 to-orange-700"
              >
                {t('common.next')} →
              </Button>
            ) : (
              <Button
                type="submit"
                loading={isSubmitting}
                className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800"
              >
                {record ? t('divorce.updateRecord') : t('divorce.createRecord')}
              </Button>
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default DivorceRecordForm;
