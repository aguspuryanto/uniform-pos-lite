
import { UserRole, Uniform } from './types';

export const INITIAL_USERS = [
  { id: '1', username: 'admin', name: 'Administrator', role: UserRole.ADMIN, password: 'password123' },
  { id: '2', username: 'gudang1', name: 'Budi Gudang', role: UserRole.GUDANG, password: 'password123' },
  { id: '3', username: 'kasir1', name: 'Siti Kasir', role: UserRole.KASIR, password: 'password123' },
];

export const UNIFORM_CATEGORIES = [
  'SD (Merah Putih)',
  'SMP (Biru Putih)',
  'SMA (Abu-abu Putih)',
  'Pramuka',
  'Olahraga',
  'Batik'
];

export const SIZES = ['S', 'M', 'L', 'XL', 'XXL', '3XL'];
export const COLORS = ['Putih', 'Merah', 'Biru', 'Abu-abu', 'Cokelat', 'Hijau', 'Batik Biru', 'Batik Merah'];

export const BANK_DETAILS = {
  bankName: 'BCA',
  accountNumber: '1234-567-890',
  accountHolder: 'CV. SERAGAM NUSANTARA'
};

export const INITIAL_INVENTORY: Uniform[] = [
  // Fixed error: Added missing 'type' property to meet Uniform interface requirements
  { id: 'u1', code: 'SD-P01', name: 'Kemeja Putih SD Pendek', category: 'SD (Merah Putih)', type: 'Atasan', size: 'M', color: 'Putih', price: 65000, stock: 45, lastUpdated: new Date().toISOString() },
  // Fixed error: Added missing 'type' property to meet Uniform interface requirements
  { id: 'u2', code: 'SD-C01', name: 'Celana Merah SD', category: 'SD (Merah Putih)', type: 'Bawahan', size: 'L', color: 'Merah', price: 85000, stock: 30, lastUpdated: new Date().toISOString() },
  // Fixed error: Added missing 'type' property to meet Uniform interface requirements
  { id: 'u3', code: 'SMP-P01', name: 'Kemeja Biru SMP', category: 'SMP (Biru Putih)', type: 'Atasan', size: 'XL', color: 'Biru', price: 75000, stock: 12, lastUpdated: new Date().toISOString() },
  // Fixed error: Added missing 'type' property to meet Uniform interface requirements
  { id: 'u4', code: 'SMA-R01', name: 'Rok Abu-abu SMA', category: 'SMA (Abu-abu Putih)', type: 'Bawahan', size: 'S', color: 'Abu-abu', price: 95000, stock: 5, lastUpdated: new Date().toISOString() },
  // Fixed error: Added missing 'type' property to meet Uniform interface requirements
  { id: 'u5', code: 'PRM-B01', name: 'Baju Pramuka Penggalang', category: 'Pramuka', type: 'Atasan', size: 'M', color: 'Cokelat', price: 80000, stock: 25, lastUpdated: new Date().toISOString() },
  // Fixed error: Added missing 'type' property to meet Uniform interface requirements
  { id: 'u6', code: 'BTK-01', name: 'Batik Nasional SD', category: 'Batik', type: 'Atasan', size: 'L', color: 'Batik Biru', price: 70000, stock: 50, lastUpdated: new Date().toISOString() },
];
