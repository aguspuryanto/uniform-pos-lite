
export enum UserRole {
  ADMIN = 'ADMIN',
  GUDANG = 'GUDANG',
  KASIR = 'KASIR'
}

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  password?: string;
}

export interface Uniform {
  id: string;
  code: string;
  name: string;
  category: string;
  type: string;
  size: string;
  color: string;
  price: number;
  stock: number;
  imageUrl?: string;
  lastUpdated: string;
}

export interface Vendor {
  id: string;
  name: string;
  contact: string;
  address: string;
  type: string;
}

export interface PurchaseOrder {
  id: string;
  vendorId: string;
  items: {
    name: string;
    quantity: number;
    estimatedPrice: number;
  }[];
  status: 'PENDING' | 'ORDERED' | 'RECEIVED';
  createdAt: string;
}

export interface ProcurementRecord {
  id: string;
  date: string;
  vendorId: string;
  items: {
    uniformId: string;
    quantity: number;
    cost: number;
    name: string;
  }[];
  totalCost: number;
}

export interface ShippingInfo {
  customerName: string;
  phoneNumber: string;
  address: string;
}

export interface Transaction {
  id: string;
  cashierId: string;
  customerInfo?: ShippingInfo;
  items: {
    uniformId: string;
    quantity: number;
    price: number;
    name: string;
  }[];
  totalAmount: number;
  paymentMethod: 'CASH' | 'TRANSFER';
  status: 'PENDING' | 'PAID';
  createdAt: string;
}
