
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
  size: string;
  color: string;
  price: number;
  stock: number;
  imageUrl?: string;
  lastUpdated: string;
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

export interface DashboardStats {
  totalSales: number;
  totalTransactions: number;
  lowStockItems: number;
  totalUsers: number;
}
