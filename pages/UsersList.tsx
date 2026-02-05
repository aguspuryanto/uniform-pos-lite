
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Shield, 
  User as UserIcon, 
  Trash2, 
  MoreVertical,
  Mail,
  UserCheck
} from 'lucide-react';
import { User, UserRole } from '../types';
import { INITIAL_USERS } from '../constants';

const UsersList: React.FC<{ user: User }> = ({ user: currentUser }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });
  
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);

  const handleDelete = (id: string) => {
    if (id === currentUser.id) {
      alert("Anda tidak bisa menghapus akun anda sendiri.");
      return;
    }
    if (window.confirm('Hapus user ini?')) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Cari nama staff atau username..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700">
          <Plus size={18} />
          Tambah Staff
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <div key={user.id} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white ${
                  user.role === UserRole.ADMIN ? 'bg-indigo-500' : 
                  user.role === UserRole.GUDANG ? 'bg-amber-500' : 'bg-blue-500'
                }`}>
                  <UserIcon size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">{user.name}</h4>
                  <p className="text-sm text-slate-500 font-medium">@{user.username}</p>
                </div>
              </div>
              <button 
                onClick={() => handleDelete(user.id)}
                className="p-1.5 text-slate-300 hover:text-rose-500 rounded-lg"
              >
                <Trash2 size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-2 text-slate-500">
                  <Shield size={16} />
                  <span className="text-xs font-bold uppercase tracking-wider">Hak Akses</span>
                </div>
                <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${
                  user.role === UserRole.ADMIN ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' :
                  user.role === UserRole.GUDANG ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                  'bg-blue-100 text-blue-700 border border-blue-200'
                }`}>
                  {user.role}
                </span>
              </div>
              
              <div className="flex items-center justify-between px-3">
                <div className="flex items-center gap-2 text-slate-400">
                  <UserCheck size={16} />
                  <span className="text-xs font-semibold">Status Akun</span>
                </div>
                <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                  Aktif
                </span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-2 gap-3">
              <button className="py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-lg border border-slate-200 transition-all">
                Detail Profile
              </button>
              <button className="py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-lg border border-blue-100 transition-all">
                Ubah Role
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UsersList;
