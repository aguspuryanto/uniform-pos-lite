
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
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
  ChevronRight
} from 'lucide-react';
import { User, UserRole } from './types';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Transactions from './pages/Transactions';
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
        <Route 
          path="/login" 
          element={currentUser ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />} 
        />
        <Route 
          path="/register" 
          element={currentUser ? <Navigate to="/dashboard" /> : <Register />} 
        />
        <Route 
          path="/*" 
          element={
            currentUser ? (
              <AuthenticatedLayout user={currentUser} onLogout={handleLogout}>
                <Routes>
                  <Route path="/dashboard" element={<Dashboard user={currentUser} />} />
                  <Route path="/inventory" element={<Inventory user={currentUser} />} />
                  <Route path="/transactions" element={<Transactions user={currentUser} />} />
                  <Route path="/users" element={<UsersList user={currentUser} />} />
                  <Route path="*" element={<Navigate to="/dashboard" />} />
                </Routes>
              </AuthenticatedLayout>
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
      </Routes>
    </HashRouter>
  );
};

interface AuthenticatedLayoutProps {
  user: User;
  onLogout: () => void;
  children: React.ReactNode;
}

const AuthenticatedLayout: React.FC<AuthenticatedLayoutProps> = ({ user, onLogout, children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard', roles: [UserRole.ADMIN, UserRole.GUDANG, UserRole.KASIR] },
    { name: 'Inventory', icon: <Package size={20} />, path: '/inventory', roles: [UserRole.ADMIN, UserRole.GUDANG] },
    { name: 'Point of Sale', icon: <ShoppingCart size={20} />, path: '/transactions', roles: [UserRole.ADMIN, UserRole.KASIR] },
    { name: 'User Management', icon: <UsersIcon size={20} />, path: '/users', roles: [UserRole.ADMIN] },
  ];

  const filteredMenuItems = menuItems.filter(item => item.roles.includes(user.role));

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-slate-900 text-white transition-all duration-300 ease-in-out fixed h-full z-50`}
      >
        <div className="flex items-center justify-between p-4 h-16 border-b border-slate-800">
          <div className={`flex items-center gap-3 overflow-hidden ${!isSidebarOpen && 'hidden'}`}>
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Package size={24} className="text-white" />
            </div>
            <span className="font-bold text-lg whitespace-nowrap">UniformPOS</span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1 hover:bg-slate-800 rounded-md"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="mt-6 px-3 space-y-2">
          {filteredMenuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-colors ${
                location.pathname === item.path 
                  ? 'bg-blue-600 text-white' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {item.icon}
              <span className={`${!isSidebarOpen && 'hidden'} font-medium`}>{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-4 left-0 w-full px-3">
          <button
            onClick={onLogout}
            className="flex items-center gap-4 px-4 py-3 w-full rounded-lg text-rose-400 hover:bg-rose-500/10 hover:text-rose-500 transition-colors"
          >
            <LogOut size={20} />
            <span className={`${!isSidebarOpen && 'hidden'} font-medium`}>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-40">
          <h1 className="text-xl font-semibold text-slate-800 capitalize">
            {location.pathname.substring(1).replace('-', ' ')}
          </h1>
          
          <div className="flex items-center gap-6">
            <button className="relative text-slate-400 hover:text-slate-600">
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-rose-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                <p className="text-xs font-medium text-slate-500">{user.role}</p>
              </div>
              <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                <UserIcon size={20} />
              </div>
            </div>
          </div>
        </header>

        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default App;
