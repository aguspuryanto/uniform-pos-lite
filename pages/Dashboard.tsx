
import React, { useMemo } from 'react';
import { 
  TrendingUp, 
  Package, 
  Users, 
  ShoppingCart,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area 
} from 'recharts';
import { User, UserRole } from '../types';
import { INITIAL_INVENTORY, INITIAL_USERS } from '../constants';

const Dashboard: React.FC<{ user: User }> = ({ user }) => {
  const inventory = JSON.parse(localStorage.getItem('inventory') || JSON.stringify(INITIAL_INVENTORY));
  const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
  const users = JSON.parse(localStorage.getItem('users') || JSON.stringify(INITIAL_USERS));

  const stats = useMemo(() => {
    const totalSales = transactions.reduce((acc: number, curr: any) => acc + curr.totalAmount, 0);
    const lowStock = inventory.filter((item: any) => item.stock <= 10).length;
    return {
      totalSales,
      transactions: transactions.length,
      lowStock,
      totalUsers: users.length
    };
  }, [transactions, inventory, users]);

  const chartData = [
    { name: 'Sen', sales: 4000 },
    { name: 'Sel', sales: 3000 },
    { name: 'Rab', sales: 5000 },
    { name: 'Kam', sales: 2780 },
    { name: 'Jum', sales: 1890 },
    { name: 'Sab', sales: 2390 },
    { name: 'Min', sales: 3490 },
  ];

  const recentTransactions = transactions.slice(-5).reverse();

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Penjualan" 
          value={`Rp ${stats.totalSales.toLocaleString('id-ID')}`}
          icon={<TrendingUp className="text-emerald-500" />}
          change="+12.5%"
          isUp={true}
        />
        <StatCard 
          title="Transaksi" 
          value={stats.transactions.toString()}
          icon={<ShoppingCart className="text-blue-500" />}
          change="+3%"
          isUp={true}
        />
        <StatCard 
          title="Stok Menipis" 
          value={stats.lowStock.toString()}
          icon={<Package className="text-rose-500" />}
          change="-2"
          isUp={false}
          subValue="Item segera habis"
        />
        <StatCard 
          title="Total User" 
          value={stats.totalUsers.toString()}
          icon={<Users className="text-purple-500" />}
          subValue="Staff aktif"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-slate-800">Ikhtisar Penjualan Mingguan</h3>
            <select className="bg-slate-50 border border-slate-200 text-sm rounded-lg px-3 py-1.5 outline-none">
              <option>7 Hari Terakhir</option>
              <option>30 Hari Terakhir</option>
            </select>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Aktivitas Terkini</h3>
          <div className="space-y-6">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((tx: any) => (
                <div key={tx.id} className="flex gap-4">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 flex-shrink-0">
                    <CheckCircle2 size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-800">Transaksi Baru</p>
                    <p className="text-xs text-slate-500">ID: {tx.id.substring(0, 8)}</p>
                    <p className="text-sm font-semibold text-blue-600 mt-1">Rp {tx.totalAmount.toLocaleString('id-ID')}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                      <Clock size={10} />
                      Baru saja
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10">
                <p className="text-slate-400 text-sm">Belum ada transaksi hari ini</p>
              </div>
            )}
          </div>
          <button className="w-full mt-6 py-2.5 text-sm font-semibold text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-xl transition-all border border-slate-100">
            Lihat Semua Aktivitas
          </button>
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  change?: string;
  isUp?: boolean;
  subValue?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, change, isUp, subValue }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
    <div className="flex items-start justify-between mb-4">
      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
        {icon}
      </div>
      {change && (
        <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${isUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
          {isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {change}
        </div>
      )}
    </div>
    <p className="text-slate-500 text-sm font-medium">{title}</p>
    <h4 className="text-2xl font-bold text-slate-900 mt-1">{value}</h4>
    {subValue && <p className="text-xs text-slate-400 mt-2">{subValue}</p>}
  </div>
);

export default Dashboard;
