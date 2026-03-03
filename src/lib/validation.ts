import { z } from 'zod'
import { parsePhoneNumberFromString } from 'libphonenumber-js'

export const patientSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  middle_name: z.string().optional().or(z.literal('')),
  last_name: z.string().min(1, 'Last name is required'),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
  gender: z.string().min(1, 'Gender is required'),
  nationality: z.string().min(1, 'Nationality is required'),
  religion: z.string().optional().or(z.literal('')),
  preferred_language: z.string().min(1, 'Preferred language is required'),

  phone: z
  .string()
  .min(1, 'Phone number is required')
  .refine(
    (val) => {
      const phone = parsePhoneNumberFromString(val)
      return phone?.isValid() ?? false
    },
    'Invalid phone number for the selected country'
  ),
  email: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine(
      (val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
      'Invalid email address'
    ),
  address: z.string().min(1, 'Address is required'),

  emergency_name: z.string().optional().or(z.literal('')),
  emergency_relationship: z.string().optional().or(z.literal('')),
})

export type PatientSchemaType = z.infer<typeof patientSchema>