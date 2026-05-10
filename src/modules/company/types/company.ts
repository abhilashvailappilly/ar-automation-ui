export interface Company {
  id: string
  name: string
  email: string
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  country: string
  pincode: string
  phone: string
  website: string
  taxId: string
  notes: string
  createdAt?: string
  updatedAt?: string
}

export type CompanyCreatePayload = {
  name: string
  email: string
  addressLine1: string
  addressLine2?: string
  city?: string
  state?: string
  country?: string
  pincode?: string
  phone?: string
  website?: string
  taxId?: string
  notes?: string
}

export type CompanyUpdatePayload = Partial<CompanyCreatePayload>
