export interface BirthRecord {
  birth_id?: string;
  certificate_number: string;
  child_first_name: string;
  child_father_name: string;
  child_grandfather_name?: string;
  child_gender: 'male' | 'female';
  date_of_birth: string;
  time_of_birth?: string;
  weight_kg?: number;
  place_of_birth_type?: string;
  place_of_birth_name?: string;
  birth_region: string;
  birth_zone: string;
  birth_woreda: string;
  birth_kebele: string;
  father_full_name: string;
  father_nationality?: string;
  father_ethnicity?: string;
  father_religion?: string;
  father_date_of_birth?: string;
  father_occupation?: string;
  father_id_number?: string;
  father_phone?: string;
  mother_full_name: string;
  mother_nationality?: string;
  mother_ethnicity?: string;
  mother_religion?: string;
  mother_date_of_birth?: string;
  mother_occupation?: string;
  mother_id_number?: string;
  mother_phone?: string;
  registered_by: string;
  status: 'draft' | 'approved' | 'rejected';
  created_at?: string;
  updated_at?: string;
  ethiopian_date_of_birth?: string;
}

export interface DeathRecord {
  death_id?: string;
  certificate_number: string;
  deceased_first_name: string;
  deceased_father_name: string;
  deceased_grandfather_name?: string;
  deceased_gender: 'male' | 'female';
  date_of_death: string;
  time_of_death?: string;
  cause_of_death?: string;
  place_of_death_type?: string;
  place_of_death_name?: string;
  death_region: string;
  death_zone: string;
  death_woreda: string;
  death_kebele: string;
  informant_name?: string;
  informant_relationship?: string;
  informant_phone?: string;
  registered_by: string;
  status: 'draft' | 'approved' | 'rejected';
  created_at?: string;
  updated_at?: string;
}

export interface MarriageRecord {
  marriage_id?: string;
  certificate_number: string;
  groom_first_name: string;
  groom_father_name: string;
  groom_grandfather_name?: string;
  groom_age: number;
  groom_nationality?: string;
  groom_ethnicity?: string;
  groom_religion?: string;
  groom_occupation?: string;
  groom_id_number?: string;
  groom_phone?: string;
  bride_first_name: string;
  bride_father_name: string;
  bride_grandfather_name?: string;
  bride_age: number;
  bride_nationality?: string;
  bride_ethnicity?: string;
  bride_religion?: string;
  bride_occupation?: string;
  bride_id_number?: string;
  bride_phone?: string;
  marriage_date: string;
  marriage_region: string;
  marriage_zone: string;
  marriage_woreda: string;
  marriage_kebele: string;
  witness1_name?: string;
  witness2_name?: string;
  registered_by: string;
  status: 'draft' | 'approved' | 'rejected';
  created_at?: string;
  updated_at?: string;
}

export interface DivorceRecord {
  divorce_id?: string;
  certificate_number?: string;
  
  // Divorce Information
  divorce_date: string;
  divorce_reason?: string;
  case_number?: string;
  court_name?: string;
  
  // Spouse 1 Information
  spouse1_full_name: string;
  spouse1_gender?: string;
  spouse1_date_of_birth?: string;
  spouse1_nationality?: string;
  spouse1_ethnicity?: string;
  spouse1_religion?: string;
  spouse1_occupation?: string;
  spouse1_id_number?: string;
  spouse1_phone?: string;
  
  // Spouse 2 Information
  spouse2_full_name: string;
  spouse2_gender?: string;
  spouse2_date_of_birth?: string;
  spouse2_nationality?: string;
  spouse2_ethnicity?: string;
  spouse2_religion?: string;
  spouse2_occupation?: string;
  spouse2_id_number?: string;
  spouse2_phone?: string;
  
  // Marriage Information
  marriage_date?: string;
  marriage_duration_years?: number;
  
  // Witnesses Information
  witness1_name?: string;
  witness1_phone?: string;
  witness2_name?: string;
  witness2_phone?: string;
  
  // Photos
  husband_photo?: string;
  wife_photo?: string;
  
  // Additional Notes
  notes?: string;
  
  // System
  registered_by?: string;
  registered_by_name?: string;
  status?: 'draft' | 'submitted' | 'approved' | 'rejected';
  created_at?: string;
  updated_at?: string;
}

export type VitalRecord = BirthRecord | DeathRecord | MarriageRecord | DivorceRecord;
export type RecordType = 'birth' | 'death' | 'marriage' | 'divorce';

