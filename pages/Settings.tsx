
import React, { useState } from 'react';
import { Settings as SettingsIcon, Layers, ChevronRight, Plus, Trash2, X } from 'lucide-react';
import { User } from '../types';
import { UNIFORM_CATEGORIES, COLORS, SIZES } from '../constants';

const Settings: React.FC<{ user: User }> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'kategori' | 'warna' | 'ukuran'>('kategori');

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4 mb-10">
         <div className="w-16 h-16 bg-slate-900 rounded-[20px] flex items-center justify-center text-white shadow-xl shadow-slate-900/10">
            <SettingsIcon size={32} />
         </div>
         <div>
            <h2 className="text-2xl font-black text-slate-900">Master Settings</h2>
            <p className="text-slate-500 text-sm">Konfigurasi jenis barang dan atribut seragam.</p>
         </div>
      </div>

      <div className="flex gap-4 border-b border-slate-200 pb-2 overflow-x-auto whitespace-nowrap">
         {[
           { id: 'kategori', label: 'Jenis Seragam' },
           { id: 'warna', label: 'Jenis Warna' },
           { id: 'ukuran', label: 'Standar Ukuran' }
         ].map(tab => (
           <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-3 text-xs font-black uppercase tracking-widest transition-all relative ${
              activeTab === tab.id ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
            }`}
           >
             {tab.label}
             {activeTab === tab.id && <div className="absolute bottom-[-8px] left-0 right-0 h-1 bg-blue-600 rounded-full animate-in slide-in-from-bottom-2 duration-300"></div>}
           </button>
         ))}
      </div>

      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm p-8">
         <div className="flex items-center justify-between mb-8">
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Data {activeTab}</h4>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-100 transition-all">
               <Plus size={14} /> Tambah {activeTab}
            </button>
         </div>

         <div className="space-y-3">
            {(activeTab === 'kategori' ? UNIFORM_CATEGORIES : activeTab === 'warna' ? COLORS : SIZES).map((item, idx) => (
               <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                  <div className="flex items-center gap-4">
                     <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-slate-300 font-black text-[10px] shadow-sm">
                        {idx + 1}
                     </div>
                     <span className="text-sm font-bold text-slate-700">{item}</span>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button className="p-2 text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={16} /></button>
                  </div>
               </div>
            ))}
         </div>
      </div>
      
      <div className="bg-blue-600 rounded-[32px] p-8 text-white flex items-center justify-between shadow-2xl shadow-blue-500/20">
         <div>
            <h4 className="text-lg font-black uppercase tracking-tight">Perhatian</h4>
            <p className="text-blue-100 text-sm mt-1 max-w-md italic">Pengubahan data master ini dapat berdampak pada laporan history dan data barang lama.</p>
         </div>
         <Layers size={48} className="opacity-20" />
      </div>
    </div>
  );
};

export default Settings;
