
import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Receipt, 
  ChevronRight, 
  Clock, 
  MapPin, 
  Phone, 
  User as UserIcon, 
  Calendar,
  CreditCard,
  Wallet,
  CheckCircle2,
  AlertCircle,
  X,
  Save,
  Trash2
} from 'lucide-react';
import { Transaction, User, ShippingInfo } from '../types';

const TransactionHistory: React.FC<{ user: User }> = ({ user }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('transactions');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [isEditingShipping, setIsEditingShipping] = useState(false);
  const [editShipping, setEditShipping] = useState<ShippingInfo>({
    customerName: '',
    phoneNumber: '',
    address: ''
  });

  const filteredTransactions = useMemo(() => {
    const sorted = [...transactions].reverse();
    return sorted.filter(tx => 
      tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.customerInfo?.customerName || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [transactions, searchTerm]);

  const handleOpenDetails = (tx: Transaction) => {
    setSelectedTx(tx);
    setEditShipping(tx.customerInfo || { customerName: '', phoneNumber: '', address: '' });
    setIsEditingShipping(false);
  };

  const handleSaveShipping = () => {
    if (!selectedTx) return;
    
    const updatedTransactions = transactions.map(t => 
      t.id === selectedTx.id ? { ...t, customerInfo: editShipping } : t
    );
    
    setTransactions(updatedTransactions);
    localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
    setSelectedTx({ ...selectedTx, customerInfo: editShipping });
    setIsEditingShipping(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Hapus data transaksi ini dari riwayat?')) {
      const updated = transactions.filter(t => t.id !== id);
      setTransactions(updated);
      localStorage.setItem('transactions', JSON.stringify(updated));
      setSelectedTx(null);
    }
  };

  const handleUpdateStatus = (id: string, newStatus: 'PAID' | 'PENDING') => {
    const updated = transactions.map(t => 
      t.id === id ? { ...t, status: newStatus } : t
    );
    setTransactions(updated);
    localStorage.setItem('transactions', JSON.stringify(updated));
    if (selectedTx?.id === id) {
      setSelectedTx({ ...selectedTx, status: newStatus });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Cari ID Transaksi atau Nama Pelanggan..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Transaksi</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Pelanggan</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Total</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Metode</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer" onClick={() => handleOpenDetails(tx)}>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                        <Receipt size={18} />
                      </div>
                      <div>
                        <p className="font-black text-slate-900 leading-none">#{tx.id.substring(2, 10)}</p>
                        <p className="text-[10px] text-slate-400 font-bold mt-1.5 flex items-center gap-1 uppercase tracking-tight">
                          <Clock size={10} />
                          {new Date(tx.createdAt).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <p className="font-bold text-slate-700 truncate max-w-[150px]">
                      {tx.customerInfo?.customerName || 'Guest Customer'}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium italic">
                      {tx.customerInfo?.phoneNumber || '-'}
                    </p>
                  </td>
                  <td className="px-8 py-5">
                    <p className="font-black text-slate-900">Rp {tx.totalAmount.toLocaleString('id-ID')}</p>
                    <p className="text-[10px] text-slate-400 font-bold">{tx.items.length} Item</p>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      {tx.paymentMethod === 'CASH' ? <Wallet size={14} className="text-blue-500" /> : <CreditCard size={14} className="text-purple-500" />}
                      <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">{tx.paymentMethod}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex justify-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        tx.status === 'PAID' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                      }`}>
                        {tx.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <button className="p-2 text-slate-300 hover:text-blue-600 hover:bg-white rounded-xl transition-all shadow-sm shadow-transparent hover:shadow-slate-200">
                      <ChevronRight size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredTransactions.length === 0 && (
          <div className="py-32 text-center">
            <Receipt size={64} className="mx-auto text-slate-100 mb-6" />
            <h3 className="text-xl font-bold text-slate-800">Tidak ada riwayat</h3>
            <p className="text-slate-400 max-w-xs mx-auto mt-2">Belum ada transaksi yang tercatat di sistem saat ini.</p>
          </div>
        )}
      </div>

      {/* Transaction Detail Side Panel / Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-[100] flex justify-end p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-xl rounded-[32px] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-8 bg-slate-900 text-white flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
                  <Receipt size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Detail Transaksi</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">ID: #{selectedTx.id.substring(2, 14)}</p>
                </div>
              </div>
              <button onClick={() => setSelectedTx(null)} className="p-3 hover:bg-white/10 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-10">
              {/* Status & Date */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-8">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-slate-400" />
                  <span className="text-sm font-bold text-slate-600">
                    {new Date(selectedTx.createdAt).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
                <div className="flex gap-2">
                   <button 
                    onClick={() => handleUpdateStatus(selectedTx.id, 'PENDING')}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedTx.status === 'PENDING' ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20' : 'bg-slate-100 text-slate-400'}`}
                   >
                     Pending
                   </button>
                   <button 
                    onClick={() => handleUpdateStatus(selectedTx.id, 'PAID')}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedTx.status === 'PAID' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'bg-slate-100 text-slate-400'}`}
                   >
                     Paid
                   </button>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-l-4 border-blue-600 pl-3">Rincian Belanja</h4>
                <div className="bg-slate-50 rounded-[24px] p-6 space-y-4 border border-slate-100">
                  {selectedTx.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start">
                      <div className="flex gap-4">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-300 border border-slate-200 shadow-sm">
                          <CheckCircle2 size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800 leading-tight">{item.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">{item.quantity} x Rp {item.price.toLocaleString('id-ID')}</p>
                        </div>
                      </div>
                      <p className="text-sm font-black text-slate-900">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</p>
                    </div>
                  ))}
                  <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                    <span className="text-[11px] font-black text-slate-400 uppercase">Total Akhir</span>
                    <span className="text-2xl font-black text-blue-600">Rp {selectedTx.totalAmount.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>

              {/* Shipping Info Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-l-4 border-blue-600 pl-3">Data Pengiriman</h4>
                  {!isEditingShipping ? (
                    <button 
                      onClick={() => setIsEditingShipping(true)}
                      className="text-[10px] font-black text-blue-600 hover:underline uppercase tracking-widest"
                    >
                      Ubah Data
                    </button>
                  ) : (
                    <div className="flex gap-3">
                      <button 
                        onClick={() => setIsEditingShipping(false)}
                        className="text-[10px] font-black text-slate-400 hover:underline uppercase tracking-widest"
                      >
                        Batal
                      </button>
                      <button 
                        onClick={handleSaveShipping}
                        className="text-[10px] font-black text-emerald-600 hover:underline uppercase tracking-widest flex items-center gap-1"
                      >
                        <Save size={12} /> Simpan
                      </button>
                    </div>
                  )}
                </div>

                {isEditingShipping ? (
                  <div className="bg-white border-2 border-blue-100 rounded-[24px] p-6 space-y-4 shadow-xl shadow-blue-500/5">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Nama Pelanggan</label>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                        <input 
                          className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
                          value={editShipping.customerName}
                          onChange={(e) => setEditShipping({ ...editShipping, customerName: e.target.value })}
                          placeholder="Nama lengkap..."
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">WhatsApp / HP</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                        <input 
                          className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
                          value={editShipping.phoneNumber}
                          onChange={(e) => setEditShipping({ ...editShipping, phoneNumber: e.target.value })}
                          placeholder="0812..."
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Alamat Pengiriman</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 text-slate-300" size={16} />
                        <textarea 
                          rows={3}
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                          value={editShipping.address}
                          onChange={(e) => setEditShipping({ ...editShipping, address: e.target.value })}
                          placeholder="Alamat lengkap tujuan..."
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 rounded-[24px] p-6 space-y-5 border border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-500 border border-slate-200 shadow-sm">
                        <UserIcon size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Penerima</p>
                        <p className="text-sm font-bold text-slate-800">{selectedTx.customerInfo?.customerName || 'Belum diinput'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-500 border border-slate-200 shadow-sm">
                        <Phone size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kontak</p>
                        <p className="text-sm font-bold text-slate-800">{selectedTx.customerInfo?.phoneNumber || 'Belum diinput'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-500 border border-slate-200 shadow-sm flex-shrink-0">
                        <MapPin size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alamat</p>
                        <p className="text-sm font-bold text-slate-800 leading-relaxed italic">
                          {selectedTx.customerInfo?.address || 'Alamat belum diisi'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-8 bg-slate-50 border-t border-slate-200 flex items-center justify-between flex-shrink-0">
              <button 
                onClick={() => handleDelete(selectedTx.id)}
                className="flex items-center gap-2 px-6 py-3 text-rose-500 font-black uppercase text-[11px] tracking-widest hover:bg-rose-50 rounded-2xl transition-all"
              >
                <Trash2 size={16} /> Hapus Data
              </button>
              <button 
                onClick={() => setSelectedTx(null)}
                className="px-8 py-3 bg-slate-900 text-white font-black uppercase text-[11px] tracking-widest rounded-2xl shadow-xl shadow-slate-900/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                Tutup Panel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;
