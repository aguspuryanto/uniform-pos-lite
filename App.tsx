
import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users as UsersIcon, 
  LogOut, 
  Menu, 
  X,
  Bell,
  User as UserIcon,
  ClipboardList,
  Truck,
  FileText,
  Settings as SettingsIcon,
  Archive,
  Layers,
  ShoppingBag
} from 'lucide-react';
import { User, UserRole } from './types';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Transactions from './pages/Transactions';
import TransactionHistory from './pages/TransactionHistory';
import Procurement from './pages/Procurement';
import PurchaseOrders from './pages/PurchaseOrders';
import Vendors from './pages/Vendors';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import UsersList from './pages/UsersList';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={currentUser ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />} />
        <Route path="/register" element={currentUser ? <Navigate to="/dashboard" /> : <Register />} />
        <Route 
          path="/*" 
          element={
            currentUser ? (
              <AuthenticatedLayout user={currentUser} onLogout={handleLogout}>
                <Routes>
                  <Route path="/dashboard" element={<Dashboard user={currentUser} />} />
                  <Route path="/inventory" element={<Inventory user={currentUser} />} />
                  <Route path="/pos" element={<Transactions user={currentUser} />} />
                  <Route path="/barang-masuk" element={<Procurement user={currentUser} />} />
                  <Route path="/purchase-orders" element={<PurchaseOrders user={currentUser} />} />
                  <Route path="/vendors" element={<Vendors user={currentUser} />} />
                  <Route path="/reports/:type" element={<Reports user={currentUser} />} />
                  <Route path="/settings" element={<Settings user={currentUser} />} />
                  <Route path="/users" element={<UsersList user={currentUser} />} />
                  <Route path="*" element={<Navigate to="/dashboard" />} />
                </Routes>
              </AuthenticatedLayout>
            ) : <Navigate to="/login" />
          } 
        />
      </Routes>
    </HashRouter>
  );
};

const AuthenticatedLayout: React.FC<{ user: User; onLogout: () => void; children: React.ReactNode }> = ({ user, onLogout, children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  const navGroups = [
    {
      title: 'Main',
      roles: [UserRole.ADMIN, UserRole.GUDANG, UserRole.KASIR],
      items: [
        { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard', roles: [UserRole.ADMIN, UserRole.GUDANG, UserRole.KASIR] },
        { name: 'Barang Keluar', icon: <ShoppingCart size={20} />, path: '/pos', roles: [UserRole.ADMIN, UserRole.GUDANG, UserRole.KASIR] },
        { name: 'Barang Masuk', icon: <Truck size={20} />, path: '/barang-masuk', roles: [UserRole.ADMIN, UserRole.GUDANG, UserRole.KASIR] },
        { name: 'Pre Order (PO)', icon: <ShoppingBag size={20} />, path: '/purchase-orders', roles: [UserRole.ADMIN] },
        { name: 'Stok Barang', icon: <Archive size={20} />, path: '/inventory', roles: [UserRole.ADMIN, UserRole.GUDANG, UserRole.KASIR] },
      ]
    },
    {
      title: 'Data',
      roles: [UserRole.ADMIN],
      items: [
        { name: 'Vendor', icon: <Truck size={20} />, path: '/vendors', roles: [UserRole.ADMIN] },
        { name: 'Barang', icon: <Package size={20} />, path: '/inventory', roles: [UserRole.ADMIN] },
        { name: 'User Management', icon: <UsersIcon size={20} />, path: '/users', roles: [UserRole.ADMIN] },
      ]
    },
    {
      title: 'Rekapitulasi',
      roles: [UserRole.ADMIN, UserRole.GUDANG, UserRole.KASIR],
      items: [
        { name: 'Laporan Penjualan', icon: <FileText size={20} />, path: '/reports/sales', roles: [UserRole.ADMIN, UserRole.GUDANG, UserRole.KASIR] },
        { name: 'Laporan Pembelian', icon: <ClipboardList size={20} />, path: '/reports/purchase', roles: [UserRole.ADMIN, UserRole.GUDANG, UserRole.KASIR] },
      ]
    },
    {
      title: 'Setting',
      roles: [UserRole.ADMIN],
      items: [
        { name: 'Master Settings', icon: <SettingsIcon size={20} />, path: '/settings', roles: [UserRole.ADMIN] },
      ]
    }
  ];

  return (
    <div className="min-h-screen flex bg-slate-50">
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-slate-900 text-white transition-all duration-300 fixed h-full z-50 overflow-y-auto`}>
        <div className="flex items-center justify-between p-4 h-16 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
          <div className={`flex items-center gap-3 ${!isSidebarOpen && 'hidden'}`}>
            <Package size={24} className="text-blue-500" />
            <span className="font-bold text-lg">UniformSYS</span>
          </div>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 hover:bg-slate-800 rounded-md">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="p-3 space-y-6">
          {navGroups.map((group, idx) => {
            if (!group.roles.includes(user.role)) return null;
            const groupItems = group.items.filter(item => item.roles.includes(user.role));
            if (groupItems.length === 0) return null;

            return (
              <div key={idx}>
                <h4 className={`text-[10px] font-black uppercase tracking-[2px] text-slate-500 px-4 mb-2 ${!isSidebarOpen && 'hidden'}`}>
                  {group.title}
                </h4>
                <div className="space-y-1">
                  {groupItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-4 px-4 py-2.5 rounded-xl transition-all ${
                        location.pathname === item.path ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      {item.icon}
                      <span className={`${!isSidebarOpen && 'hidden'} font-medium text-sm whitespace-nowrap`}>{item.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        <div className="px-3 pb-4 pt-8">
           <button onClick={onLogout} className="flex items-center gap-4 px-4 py-2.5 w-full rounded-xl text-rose-400 hover:bg-rose-500/10 transition-all">
            <LogOut size={20} />
            <span className={`${!isSidebarOpen && 'hidden'} font-medium text-sm`}>Logout</span>
          </button>
        </div>
      </aside>

      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-40">
          <h1 className="text-lg font-black text-slate-800 uppercase tracking-widest">
            {location.pathname.split('/').pop()?.replace('-', ' ') || 'Dashboard'}
          </h1>
          <div className="flex items-center gap-3">
             <div className="text-right mr-3">
                <p className="text-xs font-black text-slate-900 leading-none">{user.name}</p>
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-tight mt-1">{user.role}</p>
             </div>
             <div className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-200">
                <UserIcon size={20} />
             </div>
          </div>
        </header>
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
};

export default App;
