import type { Company } from '../types/company'

/** Raw document from ArAutomation `Company` model (`toJSON` adds `id`). */
export interface CompanyApi extends Omit<Company, 'createdAt' | 'updatedAt'> {
  createdAt?: string
  updatedAt?: string
}

export interface CompanyListApiResponse {
  companies: CompanyApi[]
  total: number
  page: number
  limit: number
}

export interface CompanySingleApiResponse {
  company: CompanyApi
}

export interface CompanyDeleteApiResponse {
  deleted: boolean
  id: string
}
