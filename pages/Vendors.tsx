
import React, { useState } from 'react';
import { Truck, Plus, Search, Trash2, Edit2, Phone, MapPin, X } from 'lucide-react';
import { User, Vendor } from '../types';

const Vendors: React.FC<{ user: User }> = ({ user }) => {
  const [vendors, setVendors] = useState<Vendor[]>(() => {
    const saved = localStorage.getItem('vendors');
    return saved ? JSON.parse(saved) : [
      { id: 'v1', name: 'PT. Tekstil Jaya', contact: '0812-3456-7890', address: 'Bandung, Jawa Barat', type: 'Kain & Seragam' }
    ];
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const vendorData = {
      name: formData.get('name') as string,
      contact: formData.get('contact') as string,
      address: formData.get('address') as string,
      type: formData.get('type') as string,
    };

    if (editingVendor) {
      const updated = vendors.map(v => v.id === editingVendor.id ? { ...v, ...vendorData } : v);
      setVendors(updated);
      localStorage.setItem('vendors', JSON.stringify(updated));
    } else {
      const newVendor = { id: 'V' + Date.now(), ...vendorData };
      const updated = [...vendors, newVendor];
      setVendors(updated);
      localStorage.setItem('vendors', JSON.stringify(updated));
    }
    setIsModalOpen(false);
    setEditingVendor(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
           <h2 className="text-2xl font-black text-slate-900">Data Vendor</h2>
           <p className="text-slate-500 text-sm italic">Manajemen mitra pemasok seragam.</p>
        </div>
        <button 
          onClick={() => { setEditingVendor(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20"
        >
          <Plus size={16} /> Tambah Vendor
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vendors.map(vendor => (
          <div key={vendor.id} className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm hover:shadow-lg transition-all group">
            <div className="flex justify-between items-start mb-6">
              <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
                <Truck size={24} />
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => { setEditingVendor(vendor); setIsModalOpen(true); }}
                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                >
                  <Edit2 size={16} />
                </button>
                <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            
            <h4 className="text-lg font-black text-slate-800 mb-1">{vendor.name}</h4>
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded-md">{vendor.type}</span>
            
            <div className="mt-8 space-y-4">
               <div className="flex items-center gap-3 text-slate-500">
                  <Phone size={16} className="text-slate-300" />
                  <span className="text-xs font-bold">{vendor.contact}</span>
               </div>
               <div className="flex items-start gap-3 text-slate-500">
                  <MapPin size={16} className="text-slate-300 mt-0.5" />
                  <span className="text-xs font-medium leading-relaxed italic">{vendor.address}</span>
               </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
               <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest">{editingVendor ? 'Edit Vendor' : 'Tambah Vendor'}</h3>
               <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-full"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="p-8 space-y-5">
               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-2">Nama Perusahaan</label>
                  <input name="name" required defaultValue={editingVendor?.name} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500" placeholder="Contoh: CV. Garment Makmur" />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-2">Kontak</label>
                    <input name="contact" required defaultValue={editingVendor?.contact} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500" placeholder="08..." />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-2">Jenis Vendor</label>
                    <input name="type" required defaultValue={editingVendor?.type} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500" placeholder="Pemasok Seragam" />
                  </div>
               </div>
               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-2">Alamat Lengkap</label>
                  <textarea name="address" required rows={3} defaultValue={editingVendor?.address} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Masukkan alamat..." />
               </div>
               <div className="pt-4 flex gap-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-xs font-black text-slate-400 uppercase tracking-widest hover:bg-slate-50 rounded-2xl transition-all">Batal</button>
                  <button type="submit" className="flex-[2] py-4 bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-slate-900/20">Simpan Data</button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vendors;
