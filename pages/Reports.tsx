
import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { 
  FileText, 
  Calendar, 
  Download, 
  ArrowUpRight, 
  ArrowDownRight, 
  TrendingUp,
  ShoppingCart,
  Receipt
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell 
} from 'recharts';
import { User, Transaction, ProcurementRecord } from '../types';

const Reports: React.FC<{ user: User }> = ({ user }) => {
  const { type } = useParams<{ type: 'sales' | 'purchase' }>();
  const isSales = type === 'sales';

  const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
  const purchases = JSON.parse(localStorage.getItem('procurements') || '[]');

  const stats = useMemo(() => {
    if (isSales) {
      const total = transactions.reduce((acc: number, t: Transaction) => acc + t.totalAmount, 0);
      return { label: 'Total Penjualan', value: total, count: transactions.length, color: 'text-blue-600' };
    } else {
      const total = purchases.reduce((acc: number, p: ProcurementRecord) => acc + p.totalCost, 0);
      return { label: 'Total Pembelian', value: total, count: purchases.length, color: 'text-rose-600' };
    }
  }, [isSales, transactions, purchases]);

  const chartData = [
    { name: 'Jan', value: 4500000 },
    { name: 'Feb', value: 5200000 },
    { name: 'Mar', value: 3800000 },
    { name: 'Apr', value: 6500000 },
    { name: 'Mei', value: 4800000 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900">{isSales ? 'Laporan Penjualan' : 'Laporan Pembelian'}</h2>
          <p className="text-slate-500 text-sm">Ringkasan aktivitas {isSales ? 'keluar' : 'masuk'} barang.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20">
          <Download size={16} /> Export PDF
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-2">{stats.label}</p>
          <h3 className={`text-2xl font-black ${stats.color}`}>Rp {stats.value.toLocaleString('id-ID')}</h3>
          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 mt-4">
             <ArrowUpRight size={14} /> +12% dari bulan lalu
          </div>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-2">Jumlah {isSales ? 'Transaksi' : 'Pengadaan'}</p>
          <h3 className="text-2xl font-black text-slate-800">{stats.count} {isSales ? 'Nota' : 'Faktur'}</h3>
          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 mt-4 uppercase">
             Rata-rata: Rp {(stats.value / (stats.count || 1)).toLocaleString('id-ID')}
          </div>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-2">Periode Aktif</p>
          <h3 className="text-2xl font-black text-slate-800">Mei 2024</h3>
          <div className="flex items-center gap-1 text-[10px] font-bold text-blue-500 mt-4 uppercase">
             <Calendar size={14} /> Terakhir diperbarui hari ini
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-8">
           <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Tren {isSales ? 'Penjualan' : 'Pembelian'}</h4>
           <div className="flex gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500"></span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Nilai Rupiah</span>
           </div>
        </div>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
              <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
              <Bar dataKey="value" fill={isSales ? '#3b82f6' : '#f43f5e'} radius={[6, 6, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50">
           <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Riwayat Lengkap</h4>
        </div>
        <table className="w-full text-left">
           <thead>
              <tr className="border-b border-slate-100">
                 <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID / Faktur</th>
                 <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tanggal</th>
                 <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</th>
                 <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
              </tr>
           </thead>
           <tbody className="divide-y divide-slate-50">
              {(isSales ? transactions : purchases).slice(0, 10).map((item: any) => (
                 <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-4">
                       <p className="text-xs font-black text-slate-900 uppercase">#{item.id.substring(0, 8)}</p>
                    </td>
                    <td className="px-8 py-4">
                       <p className="text-xs font-bold text-slate-500">{new Date(item.date || item.createdAt).toLocaleDateString('id-ID')}</p>
                    </td>
                    <td className="px-8 py-4">
                       <p className="text-xs font-black text-slate-800">Rp {(item.totalAmount || item.totalCost).toLocaleString('id-ID')}</p>
                    </td>
                    <td className="px-8 py-4">
                       <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded text-[9px] font-black uppercase">Selesai</span>
                    </td>
                 </tr>
              ))}
           </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reports;
