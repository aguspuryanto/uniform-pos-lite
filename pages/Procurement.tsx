
import React, { useState } from 'react';
import { Truck, Plus, Package, Calendar, ArrowRight, X, Search } from 'lucide-react';
import { User, Vendor, Uniform, ProcurementRecord } from '../types';

const Procurement: React.FC<{ user: User }> = ({ user }) => {
  const [procurements, setProcurements] = useState<ProcurementRecord[]>(() => {
    const saved = localStorage.getItem('procurements');
    return saved ? JSON.parse(saved) : [];
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const vendors: Vendor[] = JSON.parse(localStorage.getItem('vendors') || '[]');
  const inventory: Uniform[] = JSON.parse(localStorage.getItem('inventory') || '[]');

  const [formItems, setFormItems] = useState<{ uniformId: string; quantity: number; cost: number }[]>([]);

  const handleAddItem = () => {
    setFormItems([...formItems, { uniformId: inventory[0]?.id || '', quantity: 1, cost: 0 }]);
  };

  const handleSaveProcurement = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const vendorId = formData.get('vendorId') as string;
    
    const items = formItems.map(item => ({
      ...item,
      name: inventory.find(i => i.id === item.uniformId)?.name || 'Unknown'
    }));

    const totalCost = items.reduce((acc, curr) => acc + (curr.cost * curr.quantity), 0);
    
    const newProcurement: ProcurementRecord = {
      id: 'PROC' + Date.now(),
      date: new Date().toISOString(),
      vendorId,
      items,
      totalCost
    };

    // Update Inventory
    const updatedInventory = inventory.map(invItem => {
      const added = items.find(i => i.uniformId === invItem.id);
      if (added) return { ...invItem, stock: invItem.stock + added.quantity };
      return invItem;
    });

    const updatedProcurements = [...procurements, newProcurement];
    setProcurements(updatedProcurements);
    localStorage.setItem('procurements', JSON.stringify(updatedProcurements));
    localStorage.setItem('inventory', JSON.stringify(updatedInventory));
    
    setIsModalOpen(false);
    setFormItems([]);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
           <h2 className="text-2xl font-black text-slate-900">Barang Masuk</h2>
           <p className="text-slate-500 text-sm italic">Pencatatan pengadaan stok dari vendor.</p>
        </div>
        <button 
          onClick={() => { setFormItems([]); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20"
        >
          <Plus size={16} /> Catat Barang Masuk
        </button>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
         <table className="w-full text-left">
            <thead>
               <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Faktur</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Vendor</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Item</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Total Biaya</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
               {procurements.slice().reverse().map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                     <td className="px-8 py-4 font-black text-xs text-slate-900 uppercase">#{p.id.substring(4, 12)}</td>
                     <td className="px-8 py-4 text-xs font-bold text-slate-600">
                        {vendors.find(v => v.id === p.vendorId)?.name || 'Unknown Vendor'}
                     </td>
                     <td className="px-8 py-4">
                        <span className="text-xs font-bold text-blue-600">{p.items.length} Macam Barang</span>
                     </td>
                     <td className="px-8 py-4 text-right font-black text-xs text-slate-800">Rp {p.totalCost.toLocaleString('id-ID')}</td>
                  </tr>
               ))}
               {procurements.length === 0 && (
                 <tr>
                    <td colSpan={4} className="py-20 text-center">
                       <Truck size={48} className="mx-auto text-slate-100 mb-4" />
                       <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Belum ada catatan barang masuk</p>
                    </td>
                 </tr>
               )}
            </tbody>
         </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in duration-300 flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
               <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest">Input Barang Masuk</h3>
               <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-full"><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveProcurement} className="flex-1 overflow-y-auto p-8 space-y-6">
               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-2">Pilih Vendor</label>
                  <select name="vendorId" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none">
                     {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                     {vendors.length === 0 && <option disabled>Tidak ada vendor tersedia</option>}
                  </select>
               </div>
               
               <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Daftar Barang</h4>
                    <button type="button" onClick={handleAddItem} className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">+ Tambah Item</button>
                  </div>
                  
                  {formItems.map((item, idx) => (
                    <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 grid grid-cols-12 gap-3 items-end">
                       <div className="col-span-6">
                          <label className="block text-[9px] font-black text-slate-400 uppercase mb-1.5">Barang</label>
                          <select 
                            value={item.uniformId}
                            onChange={(e) => {
                               const newItems = [...formItems];
                               newItems[idx].uniformId = e.target.value;
                               setFormItems(newItems);
                            }}
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold outline-none"
                          >
                             {inventory.map(i => <option key={i.id} value={i.id}>{i.name} ({i.size})</option>)}
                          </select>
                       </div>
                       <div className="col-span-2">
                          <label className="block text-[9px] font-black text-slate-400 uppercase mb-1.5">Qty</label>
                          <input 
                            type="number"
                            value={item.quantity}
                            onChange={(e) => {
                               const newItems = [...formItems];
                               newItems[idx].quantity = parseInt(e.target.value);
                               setFormItems(newItems);
                            }}
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold outline-none"
                          />
                       </div>
                       <div className="col-span-3">
                          <label className="block text-[9px] font-black text-slate-400 uppercase mb-1.5">Harga Beli (Satuan)</label>
                          <input 
                            type="number"
                            value={item.cost}
                            onChange={(e) => {
                               const newItems = [...formItems];
                               newItems[idx].cost = parseInt(e.target.value);
                               setFormItems(newItems);
                            }}
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold outline-none"
                          />
                       </div>
                       <div className="col-span-1">
                          <button 
                            type="button" 
                            onClick={() => setFormItems(formItems.filter((_, i) => i !== idx))}
                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-all mb-0.5"
                          >
                            <X size={16} />
                          </button>
                       </div>
                    </div>
                  ))}

                  {formItems.length === 0 && (
                    <div className="py-8 text-center border-2 border-dashed border-slate-100 rounded-2xl">
                       <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Belum ada item yang ditambahkan</p>
                    </div>
                  )}
               </div>
            </form>
            <div className="p-8 border-t border-slate-100 flex items-center justify-between flex-shrink-0">
               <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estimasi Total</span>
                  <span className="text-xl font-black text-emerald-600">Rp {formItems.reduce((acc, curr) => acc + (curr.cost * curr.quantity), 0).toLocaleString('id-ID')}</span>
               </div>
               <div className="flex gap-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Batal</button>
                  <button 
                    type="submit" 
                    form="procurement-form" 
                    disabled={formItems.length === 0}
                    onClick={(e: any) => handleSaveProcurement(e)}
                    className="px-10 py-4 bg-emerald-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-emerald-500/20 disabled:opacity-50"
                  >
                    Simpan Faktur
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Procurement;
