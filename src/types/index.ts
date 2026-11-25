export type Role = 'tenant' | 'manager' | 'malik';

export type BedStatus = 'occupied' | 'vacant' | 'notice';

export type ElectricityType = 'metered' | 'included';

export type PaymentMethod = 'upi_direct' | 'cash';

export type BillStatus = 'unpaid' | 'verification_pending' | 'paid' | 'rejected';

export interface Bed {
  id: string;
  bedLabel: string; // e.g. "101-A"
  roomNumber: string;
  status: BedStatus;
  rentAmount: number;
  tenantId?: string;
  tenantName?: string;
  noticeEndDate?: string;
}

export interface Room {
  roomNumber: string;
  floor: number;
  electricityType: ElectricityType;
  previousReading: number;
  currentReading: number;
  ratePerUnit: number;
  meterPhotoUri?: string;
  beds: Bed[];
}

export interface Tenant {
  id: string;
  name: string;
  phone: string;
  roomNumber: string;
  bedLabel: string;
  joinDate: string; // YYYY-MM-DD
  monthlyRent: number;
  depositAmount: number;
  electricityType: ElectricityType;
  kyc: {
    idProof: boolean;
    photo: boolean;
    agreement: boolean;
    policeVerification: boolean;
  };
}

export interface Bill {
  id: string;
  tenantId: string;
  tenantName: string;
  roomNumber: string;
  bedLabel: string;
  month: string; // e.g. "November 2026"
  dueDate: string;
  rentAmount: number;
  electricityType: ElectricityType;
  electricityUnits: number;
  electricityAmount: number;
  totalAmount: number;
  status: BillStatus;
  paymentMethod?: PaymentMethod;
  utrNumber?: string;
  paidDate?: string;
  daysLate?: number;
}

export type ComplaintCategory = 'AC' | 'WiFi' | 'Water' | 'Cleaning' | 'Lock' | 'Other';

export type ComplaintStatus = 'submitted' | 'viewed' | 'resolved';

export interface Complaint {
  id: string;
  tenantId: string;
  tenantName: string;
  roomNumber: string;
  category: ComplaintCategory;
  title: string;
  description: string;
  status: ComplaintStatus;
  createdAt: string;
  viewedAt?: string;
  resolvedAt?: string;
}

export interface MealDay {
  day: string;
  dateStr: string;
  breakfast: string;
  lunch: string;
  dinner: string;
  timings: {
    breakfast: string;
    lunch: string;
    dinner: string;
  };
}

export interface OwnerSettings {
  pgName: string;
  ownerName: string;
  upiId: string; // e.g. 'owner@okhdfcbank'
  phone: string;
  address: string;
  ratePerUnit: number;
}
