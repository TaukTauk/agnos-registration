export type PatientStatus = 'filling' | 'inactive' | 'expired' | 'submitted'

export interface PatientSession {
  id: string
  session_id: string

  // Personal
  first_name: string | null
  middle_name: string | null
  last_name: string | null
  date_of_birth: string | null
  gender: string | null
  nationality: string | null
  religion: string | null
  preferred_language: string | null

  // Contact
  phone: string | null
  email: string | null
  address: string | null

  // Emergency
  emergency_name: string | null
  emergency_relationship: string | null

  // Status
  status: PatientStatus
  last_activity_at: string
  submitted_at: string | null
  created_at: string
}

export type PatientFormData = Omit<
  PatientSession,
  'id' | 'session_id' | 'status' | 'last_activity_at' | 'submitted_at' | 'created_at'
>