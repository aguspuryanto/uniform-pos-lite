
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  // Added Package to fix "Cannot find name 'Package'" error
  Package
} from 'lucide-react';
import { Uniform, User, UserRole } from '../types';
import { INITIAL_INVENTORY, UNIFORM_CATEGORIES, SIZES } from '../constants';

const Inventory: React.FC<{ user: User }> = ({ user }) => {
  const [items, setItems] = useState<Uniform[]>(() => {
    const saved = localStorage.getItem('inventory');
    return saved ? JSON.parse(saved) : INITIAL_INVENTORY;
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Uniform | null>(null);

  useEffect(() => {
    localStorage.setItem('inventory', JSON.stringify(items));
  }, [items]);

  const handleDelete = (id: string) => {
    if (window.confirm('Hapus item ini?')) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newItem: Partial<Uniform> = {
      name: formData.get('name') as string,
      category: formData.get('category') as string,
      size: formData.get('size') as string,
      price: Number(formData.get('price')),
      stock: Number(formData.get('stock')),
      lastUpdated: new Date().toISOString()
    };

    if (editingItem) {
      setItems(items.map(item => item.id === editingItem.id ? { ...item, ...newItem } as Uniform : item));
    } else {
      const item: Uniform = {
        id: Math.random().toString(36).substr(2, 9),
        ...newItem as Omit<Uniform, 'id'>
      };
      setItems([...items, item]);
    }
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Cari nama seragam atau kategori..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 font-semibold hover:bg-slate-50">
            <Filter size={18} />
            Filter
          </button>
          <button 
            onClick={() => {
              setEditingItem(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20"
          >
            <Plus size={18} />
            Tambah Produk
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-sm font-bold text-slate-500 uppercase">Produk</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-500 uppercase">Kategori</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-500 uppercase text-center">Ukuran</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-500 uppercase">Harga</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-500 uppercase">Stok</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredItems.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <p className="font-bold text-slate-800">{item.name}</p>
                  <p className="text-xs text-slate-400">ID: {item.id}</p>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-block px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 text-xs font-bold">
                    {item.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="font-semibold text-slate-700">{item.size}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="font-bold text-slate-900">Rp {item.price.toLocaleString('id-ID')}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className={`font-bold ${item.stock <= 10 ? 'text-rose-500' : 'text-slate-700'}`}>
                      {item.stock}
                    </span>
                    {item.stock <= 10 && <AlertCircle size={14} className="text-rose-500" />}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => {
                        setEditingItem(item);
                        setIsModalOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredItems.length === 0 && (
          <div className="py-20 text-center">
            <Package size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-500 font-medium">Tidak ada produk yang ditemukan</p>
          </div>
        )}

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <p className="text-sm text-slate-500 font-medium">
            Menampilkan <span className="text-slate-800">{filteredItems.length}</span> dari <span className="text-slate-800">{items.length}</span> produk
          </p>
          <div className="flex items-center gap-2">
            <button className="p-1 border border-slate-200 rounded bg-white hover:bg-slate-50 disabled:opacity-50">
              <ChevronLeft size={16} />
            </button>
            <button className="p-1 border border-slate-200 rounded bg-white hover:bg-slate-50 disabled:opacity-50">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Modal CRUD */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-100">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">
                {editingItem ? 'Edit Produk' : 'Tambah Produk Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-8 space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Produk</label>
                  <input
                    name="name"
                    required
                    defaultValue={editingItem?.name || ''}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Contoh: Kemeja SD Lengan Pendek"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Kategori</label>
                  <select
                    name="category"
                    defaultValue={editingItem?.category || UNIFORM_CATEGORIES[0]}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {UNIFORM_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Ukuran</label>
                  <select
                    name="size"
                    defaultValue={editingItem?.size || SIZES[0]}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Harga (Rp)</label>
                  <input
                    name="price"
                    type="number"
                    required
                    defaultValue={editingItem?.price || ''}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Stok Awal</label>
                  <input
                    name="stock"
                    type="number"
                    required
                    defaultValue={editingItem?.stock || ''}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="pt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 text-slate-600 font-semibold hover:bg-slate-50 rounded-xl transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-8 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all"
                >
                  {editingItem ? 'Simpan Perubahan' : 'Tambah Produk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const X = ({ size, ...props }: any) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export default Inventory;
