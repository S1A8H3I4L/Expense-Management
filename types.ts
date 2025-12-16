export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  EMPLOYEE = 'EMPLOYEE'
}

export enum ExpenseStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  ESCALATED = 'ESCALATED'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  managerId?: string; // For hierarchy
  companyId: string;
  password?: string; // stored in plain text for this demo (mock db)
}

export interface Company {
  id: string;
  name: string;
  currency: string; // e.g., USD, EUR
  country: string;
}

export interface Expense {
  id: string;
  userId: string;
  amount: number;
  currency: string; // Original currency
  convertedAmount?: number; // In company default currency
  category: string;
  description: string;
  merchant: string;
  date: string;
  status: ExpenseStatus;
  receiptImage?: string; // Base64
  approverId?: string; // Current person who needs to approve
  history: {
    action: string;
    actorName: string;
    date: string;
    comment?: string;
  }[];
}

export interface ApprovalRule {
  id: string;
  threshold: number; // If amount > threshold, needs specific approval
  requiresDirector: boolean;
  requiresFinance: boolean;
}

// API Response Types
export interface CountryApiData {
  name: { common: string };
  currencies: Record<string, { name: string; symbol: string }>;
}