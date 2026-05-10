import type { CompanyApi } from './companyApi.types'
import type { Company } from '../types/company'

export function mapCompanyFromApi(raw: CompanyApi): Company {
  return {
    id: String(raw.id),
    name: String(raw.name ?? ''),
    email: String(raw.email ?? ''),
    addressLine1: String(raw.addressLine1 ?? ''),
    addressLine2: String(raw.addressLine2 ?? ''),
    city: String(raw.city ?? ''),
    state: String(raw.state ?? ''),
    country: String(raw.country ?? ''),
    pincode: String(raw.pincode ?? ''),
    phone: String(raw.phone ?? ''),
    website: String(raw.website ?? ''),
    taxId: String(raw.taxId ?? ''),
    notes: String(raw.notes ?? ''),
    ...(raw.createdAt != null ? { createdAt: String(raw.createdAt) } : {}),
    ...(raw.updatedAt != null ? { updatedAt: String(raw.updatedAt) } : {}),
  }
}
