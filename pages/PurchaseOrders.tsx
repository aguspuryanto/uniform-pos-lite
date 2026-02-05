
import React, { useState, useMemo } from 'react';
import { 
  ShoppingBag, 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  Truck, 
  CheckCircle2, 
  X, 
  Trash2, 
  MoreVertical,
  ChevronRight,
  Package,
  AlertCircle
} from 'lucide-react';
import { User, PurchaseOrder, Vendor, Uniform } from '../types';

const PurchaseOrders: React.FC<{ user: User }> = ({ user }) => {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => {
    const saved = localStorage.getItem('purchase_orders');
    return saved ? JSON.parse(saved) : [];
  });

  const vendors: Vendor[] = JSON.parse(localStorage.getItem('vendors') || '[]');
  const inventory: Uniform[] = JSON.parse(localStorage.getItem('inventory') || '[]');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  // Form State
  const [selectedVendorId, setSelectedVendorId] = useState('');
  const [items, setItems] = useState<{ name: string; quantity: number; estimatedPrice: number }[]>([]);

  const filteredPOs = useMemo(() => {
    return purchaseOrders.filter(po => {
      const vendor = vendors.find(v => v.id === po.vendorId);
      const matchesSearch = vendor?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            po.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'All' || po.status === filterStatus;
      return matchesSearch && matchesStatus;
    }).reverse();
  }, [purchaseOrders, vendors, searchTerm, filterStatus]);

  const handleAddItem = () => {
    setItems([...items, { name: '', quantity: 1, estimatedPrice: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSavePO = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendorId || items.length === 0) return;

    const newPO: PurchaseOrder = {
      id: 'PO' + Date.now().toString().substring(6),
      vendorId: selectedVendorId,
      items: items,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };

    const updatedPOs = [...purchaseOrders, newPO];
    setPurchaseOrders(updatedPOs);
    localStorage.setItem('purchase_orders', JSON.stringify(updatedPOs));
    
    setIsModalOpen(false);
    setItems([]);
    setSelectedVendorId('');
  };

  const updateStatus = (id: string, status: PurchaseOrder['status']) => {
    const updated = purchaseOrders.map(po => po.id === id ? { ...po, status } : po);
    setPurchaseOrders(updated);
    localStorage.setItem('purchase_orders', JSON.stringify(updated));
  };

  const deletePO = (id: string) => {
    if (window.confirm('Hapus Pre-Order ini?')) {
      const updated = purchaseOrders.filter(po => po.id !== id);
      setPurchaseOrders(updated);
      localStorage.setItem('purchase_orders', JSON.stringify(updated));
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Pre Order (PO)</h2>
          <p className="text-slate-500 text-sm">Manajemen pesanan barang ke vendor sebelum stok masuk.</p>
        </div>
        <button 
          onClick={() => {
            setItems([{ name: '', quantity: 1, estimatedPrice: 0 }]);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20"
        >
          <Plus size={18} /> Buat PO Baru
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Cari PO atau Vendor..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          {['All', 'PENDING', 'ORDERED', 'RECEIVED'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
                filterStatus === status 
                  ? 'bg-slate-900 text-white border-slate-900' 
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPOs.map(po => {
          const vendor = vendors.find(v => v.id === po.vendorId);
          const totalItems = po.items.reduce((acc, curr) => acc + curr.quantity, 0);
          const estTotal = po.items.reduce((acc, curr) => acc + (curr.estimatedPrice * curr.quantity), 0);

          return (
            <div key={po.id} className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden flex flex-col group hover:shadow-xl hover:shadow-slate-200/50 transition-all">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    po.status === 'RECEIVED' ? 'bg-emerald-100 text-emerald-600' :
                    po.status === 'ORDERED' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'
                  }`}>
                    <ShoppingBag size={20} />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 leading-none">#{po.id}</h4>
                    <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">{new Date(po.createdAt).toLocaleDateString('id-ID')}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => deletePO(po.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="p-6 flex-1 space-y-4">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Vendor</p>
                  <p className="font-bold text-slate-800 flex items-center gap-2">
                    <Truck size={14} className="text-slate-400" />
                    {vendor?.name || 'Vendor Terhapus'}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Item Pesanan ({totalItems})</p>
                  <div className="max-h-24 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
                    {po.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-xs font-medium text-slate-600">
                        <span>{item.name}</span>
                        <span className="font-bold">x{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estimasi Biaya</p>
                    <p className="text-sm font-black text-blue-600">Rp {estTotal.toLocaleString('id-ID')}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                    po.status === 'RECEIVED' ? 'bg-emerald-50 text-emerald-600' :
                    po.status === 'ORDERED' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {po.status}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 grid grid-cols-2 gap-2">
                {po.status === 'PENDING' && (
                  <button 
                    onClick={() => updateStatus(po.id, 'ORDERED')}
                    className="col-span-2 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                  >
                    <Truck size={14} /> Tandai Dipesan
                  </button>
                )}
                {po.status === 'ORDERED' && (
                  <button 
                    onClick={() => updateStatus(po.id, 'RECEIVED')}
                    className="col-span-2 py-2.5 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={14} /> Barang Diterima
                  </button>
                )}
                {po.status === 'RECEIVED' && (
                  <div className="col-span-2 py-2.5 text-emerald-600 text-[10px] font-black uppercase tracking-widest text-center">
                    Transaksi Selesai
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {filteredPOs.length === 0 && (
          <div className="col-span-full py-32 text-center bg-white rounded-[32px] border border-dashed border-slate-200">
            <ShoppingBag size={64} className="mx-auto text-slate-100 mb-6" />
            <h3 className="text-xl font-bold text-slate-800">Belum ada Pre-Order</h3>
            <p className="text-slate-400 text-sm mt-2">Mulai buat pesanan baru untuk stok yang akan datang.</p>
          </div>
        )}
      </div>

      {/* CREATE PO MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in duration-300 flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white">
                    <ShoppingBag size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest leading-none">Buat Pre-Order</h3>
                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Permintaan Pesanan ke Vendor</p>
                  </div>
               </div>
               <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-all"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSavePO} className="flex-1 overflow-y-auto p-8 space-y-8">
               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-3">Pilih Vendor Tujuan</label>
                  <select 
                    required 
                    className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
                    value={selectedVendorId}
                    onChange={(e) => setSelectedVendorId(e.target.value)}
                  >
                     <option value="">-- Klik untuk memilih vendor --</option>
                     {vendors.map(v => <option key={v.id} value={v.id}>{v.name} ({v.type})</option>)}
                  </select>
               </div>
               
               <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rincian Barang Pesanan</h4>
                    <button type="button" onClick={handleAddItem} className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 transition-all">
                      + Tambah Baris
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {items.map((item, idx) => (
                      <div key={idx} className="bg-slate-50 p-6 rounded-2xl border border-slate-100 grid grid-cols-1 md:grid-cols-12 gap-4 items-end animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="md:col-span-6">
                            <label className="block text-[9px] font-black text-slate-400 uppercase mb-2">Nama Barang / Spesifikasi</label>
                            <input 
                              type="text"
                              required
                              list="inventory-names"
                              value={item.name}
                              onChange={(e) => updateItem(idx, 'name', e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Misal: Kemeja SMP Lengan Panjang"
                            />
                            <datalist id="inventory-names">
                              {inventory.map(inv => <option key={inv.id} value={`${inv.name} (${inv.size})`} />)}
                            </datalist>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-[9px] font-black text-slate-400 uppercase mb-2">Jumlah</label>
                            <input 
                              type="number"
                              required
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateItem(idx, 'quantity', parseInt(e.target.value) || 0)}
                              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 text-center"
                            />
                        </div>
                        <div className="md:col-span-3">
                            <label className="block text-[9px] font-black text-slate-400 uppercase mb-2">Est. Harga Beli</label>
                            <input 
                              type="number"
                              required
                              value={item.estimatedPrice}
                              onChange={(e) => updateItem(idx, 'estimatedPrice', parseInt(e.target.value) || 0)}
                              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="0"
                            />
                        </div>
                        <div className="md:col-span-1 flex justify-center">
                            <button 
                              type="button" 
                              onClick={() => removeItem(idx)}
                              className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                            >
                              <X size={18} />
                            </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {items.length === 0 && (
                    <div className="py-12 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                       <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Belum ada item pesanan yang diinput</p>
                    </div>
                  )}
               </div>
            </form>

            <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex flex-col md:flex-row items-center justify-between gap-6 flex-shrink-0">
               <div className="flex flex-col items-center md:items-start">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Estimasi Anggaran</span>
                  <span className="text-2xl font-black text-blue-600 tracking-tight">Rp {items.reduce((acc, curr) => acc + (curr.estimatedPrice * curr.quantity), 0).toLocaleString('id-ID')}</span>
               </div>
               <div className="flex gap-4 w-full md:w-auto">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 md:flex-none px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest hover:bg-slate-100 rounded-2xl transition-all">
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    onClick={handleSavePO}
                    disabled={!selectedVendorId || items.length === 0}
                    className="flex-[2] md:flex-none px-12 py-4 bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-2xl shadow-slate-900/20 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 transition-all active:scale-[0.98]"
                  >
                    Kirim Pre-Order
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrders;
