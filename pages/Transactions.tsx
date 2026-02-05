
import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  CreditCard, 
  Wallet,
  Receipt,
  CheckCircle2,
  Package,
  Filter,
  ChevronRight,
  Info,
  MapPin,
  Phone,
  User as UserIcon,
  X
} from 'lucide-react';
import { Uniform, Transaction, User, ShippingInfo } from '../types';
import { INITIAL_INVENTORY, UNIFORM_CATEGORIES, SIZES, COLORS, BANK_DETAILS } from '../constants';

const Transactions: React.FC<{ user: User }> = ({ user }) => {
  const [inventory, setInventory] = useState<Uniform[]>(() => {
    const saved = localStorage.getItem('inventory');
    return saved ? JSON.parse(saved) : INITIAL_INVENTORY;
  });
  
  const [cart, setCart] = useState<{item: Uniform, quantity: number}[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Only Category and Price range remain as global filters
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500000]);

  // Checkout States
  const [checkoutStep, setCheckoutStep] = useState<'IDLE' | 'PAYMENT' | 'SUCCESS'>('IDLE');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'TRANSFER'>('CASH');
  const [lastTx, setLastTx] = useState<Transaction | null>(null);

  const filteredItems = useMemo(() => {
    return inventory.filter(item => {
      const matchesSearch = 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
      const matchesPrice = item.price >= priceRange[0] && item.price <= priceRange[1];

      return matchesSearch && matchesCategory && matchesPrice;
    });
  }, [inventory, searchTerm, filterCategory, priceRange]);

  const addToCart = (item: Uniform) => {
    if (item.stock === 0) return;
    setCart(prev => {
      const existing = prev.find(i => i.item.id === item.id);
      if (existing) {
        if (existing.quantity >= item.stock) return prev;
        return prev.map(i => i.item.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { item: { ...item }, quantity: 1 }];
    });
  };

  const removeFromCart = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const updateQuantity = (index: number, delta: number) => {
    setCart(prev => prev.map((item, i) => {
      if (i === index) {
        const newQty = Math.max(1, Math.min(item.item.stock, item.quantity + delta));
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const updateCartItemOption = (index: number, field: 'size' | 'color', value: string) => {
    setCart(prev => prev.map((item, i) => {
      if (i === index) {
        return { ...item, item: { ...item.item, [field]: value } };
      }
      return item;
    }));
  };

  const subtotal = cart.reduce((acc, curr) => acc + (curr.item.price * curr.quantity), 0);

  const handleStartCheckout = () => {
    if (cart.length > 0) setCheckoutStep('PAYMENT');
  };

  const handleFinalizeCheckout = () => {
    const newTx: Transaction = {
      id: 'TX' + Date.now().toString(),
      cashierId: user.id,
      customerInfo: {
        customerName: '',
        phoneNumber: '',
        address: ''
      }, // To be filled in Transaction Details later as per requirement
      items: cart.map(c => ({ 
        uniformId: c.item.id, 
        quantity: c.quantity, 
        price: c.item.price,
        name: `${c.item.name} (${c.item.size}/${c.item.color})` 
      })),
      totalAmount: subtotal,
      paymentMethod: paymentMethod,
      status: paymentMethod === 'CASH' ? 'PAID' : 'PENDING',
      createdAt: new Date().toISOString()
    };

    const newInventory = inventory.map(item => {
      const cartItems = cart.filter(c => c.item.id === item.id);
      const totalUsed = cartItems.reduce((acc, curr) => acc + curr.quantity, 0);
      return { ...item, stock: item.stock - totalUsed };
    });

    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    localStorage.setItem('transactions', JSON.stringify([...transactions, newTx]));
    localStorage.setItem('inventory', JSON.stringify(newInventory));
    
    setInventory(newInventory);
    setLastTx(newTx);
    setCheckoutStep('SUCCESS');
    setCart([]);
  };

  const resetCheckout = () => {
    setCheckoutStep('IDLE');
  };

  return (
    <div className="flex flex-col xl:flex-row gap-8">
      {/* Global Filters Sidebar */}
      <aside className="w-full xl:w-72 space-y-6 flex-shrink-0">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm sticky top-24">
          <div className="flex items-center gap-2 mb-6 text-slate-800 font-bold border-b border-slate-100 pb-4">
            <Filter size={18} className="text-blue-600" />
            Filter Katalog
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-3">Kategori</label>
              <select 
                value={filterCategory} 
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">Semua Kategori</option>
                {UNIFORM_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-3">Maks. Harga (Rp)</label>
              <input 
                type="range" 
                min="0" 
                max="500000" 
                step="5000"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                className="w-full accent-blue-600"
              />
              <div className="flex justify-between mt-2 text-xs font-bold text-blue-600">
                <span>0</span>
                <span>{priceRange[1].toLocaleString('id-ID')}</span>
              </div>
            </div>

            <button 
              onClick={() => {
                setFilterCategory('All');
                setPriceRange([0, 500000]);
              }}
              className="w-full py-2 text-xs font-bold text-slate-400 hover:text-rose-500 transition-colors"
            >
              Reset Filter
            </button>
          </div>
        </div>
      </aside>

      {/* Main Feed */}
      <div className="flex-1 space-y-6">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
          <input
            type="text"
            placeholder="Cari berdasarkan nama atau kode..."
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
          {filteredItems.map(item => (
            <div 
              key={item.id}
              onClick={() => addToCart(item)}
              className={`group bg-white rounded-2xl border ${item.stock === 0 ? 'opacity-60 grayscale cursor-not-allowed' : 'hover:border-blue-400 cursor-pointer hover:shadow-lg hover:shadow-blue-500/5'} border-slate-200 transition-all overflow-hidden flex flex-col`}
            >
              <div className="aspect-square bg-slate-50 flex items-center justify-center text-slate-200 relative">
                <Package size={64} className="group-hover:scale-110 transition-transform duration-300" />
                <div className="absolute top-4 left-4">
                  <span className="px-2 py-1 bg-white/80 backdrop-blur-sm rounded text-[10px] font-black tracking-widest text-slate-500 border border-slate-200 uppercase">
                    {item.code}
                  </span>
                </div>
                {item.stock === 0 && (
                  <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
                    <span className="bg-white px-4 py-2 rounded-lg font-black text-rose-600 shadow-xl uppercase tracking-widest text-sm rotate-12">Habis</span>
                  </div>
                )}
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">{item.category}</p>
                <h4 className="font-bold text-slate-800 line-clamp-2 leading-tight mb-2 group-hover:text-blue-600 transition-colors">{item.name}</h4>
                <div className="mt-auto pt-4 flex items-end justify-between border-t border-slate-50">
                  <p className="text-lg font-black text-slate-900 leading-none">Rp {item.price.toLocaleString('id-ID')}</p>
                  <div className={`px-2 py-1 rounded-md text-[10px] font-bold ${item.stock <= 5 ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>
                    Stok: {item.stock}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cart with Item Options */}
      <div className="w-full xl:w-[400px] flex-shrink-0">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden sticky top-24 flex flex-col max-h-[calc(100vh-120px)]">
          
          <div className="p-6 bg-slate-900 text-white flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3 font-bold">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <ShoppingCart size={20} />
              </div>
              <span className="text-lg">Keranjang</span>
            </div>
            <span className="bg-white/20 text-white text-xs font-black px-2.5 py-1 rounded-full uppercase tracking-widest">{cart.length}</span>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {cart.length > 0 ? (
              cart.map(({ item, quantity }, index) => (
                <div key={`${item.id}-${index}`} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                  <div className="flex gap-4 items-start">
                    <div className="w-12 h-12 bg-white rounded-xl flex-shrink-0 flex items-center justify-center text-slate-300 border border-slate-200 shadow-sm">
                      <Package size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-xs font-bold text-slate-800 line-clamp-2 leading-tight">{item.name}</h5>
                      <p className="text-[10px] text-slate-400 font-bold mt-1">Rp {item.price.toLocaleString('id-ID')}</p>
                    </div>
                    <button onClick={() => removeFromCart(index)} className="p-1.5 text-slate-300 hover:text-rose-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Inline Options: Size & Color */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Ukuran</label>
                      <select 
                        value={item.size}
                        onChange={(e) => updateCartItemOption(index, 'size', e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[11px] font-bold outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                      >
                        {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Warna</label>
                      <select 
                        value={item.color}
                        onChange={(e) => updateCartItemOption(index, 'color', e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[11px] font-bold outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                      >
                        {COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/50">
                    <span className="text-[11px] font-black text-blue-600">
                      Rp {(item.price * quantity).toLocaleString('id-ID')}
                    </span>
                    <div className="flex items-center gap-2 bg-white rounded-lg p-0.5 border border-slate-200 shadow-sm">
                      <button onClick={() => updateQuantity(index, -1)} className="p-1 hover:bg-slate-50 rounded text-slate-400"><Minus size={12} /></button>
                      <span className="text-xs font-black w-5 text-center">{quantity}</span>
                      <button onClick={() => updateQuantity(index, 1)} className="p-1 hover:bg-slate-50 rounded text-slate-400"><Plus size={12} /></button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-40 flex flex-col items-center justify-center text-slate-400 space-y-4">
                <ShoppingCart size={32} className="opacity-10" />
                <p className="text-[10px] font-black uppercase tracking-widest">Keranjang Kosong</p>
              </div>
            )}
          </div>

          <div className="p-6 bg-slate-50 border-t border-slate-200 space-y-4 flex-shrink-0">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Bayar</span>
              <span className="text-xl font-black text-blue-600">Rp {subtotal.toLocaleString('id-ID')}</span>
            </div>

            <button 
              disabled={cart.length === 0}
              onClick={handleStartCheckout}
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 hover:-translate-y-1 transition-all active:translate-y-0 disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2"
            >
              Proses Checkout
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Checkout Modal Flow - Now Skips Shipping Info */}
      {checkoutStep !== 'IDLE' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
          {/* PAYMENT STEP (Direct from Cart) */}
          {checkoutStep === 'PAYMENT' && (
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
              <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
                <div className="flex flex-col">
                   <h3 className="text-xl font-bold flex items-center gap-3">
                     <CreditCard className="text-blue-500" />
                     Pilih Pembayaran
                   </h3>
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Lengkapi pembayaran untuk memproses pesanan</span>
                </div>
                <button onClick={resetCheckout} className="p-2 hover:bg-white/10 rounded-full"><X size={20} /></button>
              </div>
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <button 
                    onClick={() => setPaymentMethod('CASH')}
                    className={`flex items-center gap-4 p-6 rounded-2xl border-2 transition-all text-left ${paymentMethod === 'CASH' ? 'border-blue-600 bg-blue-50' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${paymentMethod === 'CASH' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                      <Wallet size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">Tunai (Cash)</h4>
                      <p className="text-xs text-slate-500 font-medium italic">Bayar langsung di kasir.</p>
                    </div>
                  </button>

                  <button 
                    onClick={() => setPaymentMethod('TRANSFER')}
                    className={`flex items-center gap-4 p-6 rounded-2xl border-2 transition-all text-left ${paymentMethod === 'TRANSFER' ? 'border-blue-600 bg-blue-50' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${paymentMethod === 'TRANSFER' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                      <CreditCard size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">Transfer Bank Manual</h4>
                      <p className="text-xs text-slate-500 font-medium italic">Kirim ke rekening {BANK_DETAILS.bankName}.</p>
                    </div>
                  </button>
                </div>

                <div className="pt-4 flex gap-4">
                  <button onClick={resetCheckout} className="flex-1 py-4 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-2xl transition-all">Batal</button>
                  <button 
                    onClick={handleFinalizeCheckout}
                    className="flex-[2] py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20"
                  >
                    Proses Pesanan
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SUCCESS STEP */}
          {checkoutStep === 'SUCCESS' && lastTx && (
            <div className="bg-white rounded-[32px] w-full max-w-sm shadow-2xl overflow-hidden p-8 text-center animate-in fade-in zoom-in duration-300">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full mb-6"><CheckCircle2 size={40} /></div>
              <h3 className="text-2xl font-black text-slate-900">Pesanan Berhasil!</h3>
              <p className="text-slate-400 text-xs font-bold mt-1 uppercase tracking-widest">ID: {lastTx.id.substring(8)}</p>
              
              <div className="bg-slate-50 rounded-2xl p-6 my-6 text-left border border-slate-100 space-y-4">
                <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase border-b border-slate-200 pb-2"><span>Ringkasan Item</span><Receipt size={14} /></div>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {lastTx.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-[11px]"><span className="text-slate-600 font-medium truncate max-w-[150px]">{item.name}</span><span className="font-bold text-slate-800">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</span></div>
                  ))}
                </div>
                <div className="pt-4 border-t border-slate-200 flex justify-between items-center"><span className="font-black text-slate-400 text-[10px] uppercase">Total</span><span className="font-black text-blue-600 text-xl tracking-tight">Rp {lastTx.totalAmount.toLocaleString('id-ID')}</span></div>
                
                {lastTx.paymentMethod === 'TRANSFER' && (
                  <div className="bg-white border border-slate-200 rounded-xl p-4 text-center space-y-2 mt-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic border-b border-slate-50 pb-1">Instruksi Transfer {BANK_DETAILS.bankName}</p>
                    <p className="font-black text-blue-600 tracking-wider text-lg leading-none">{BANK_DETAILS.accountNumber}</p>
                    <p className="text-[9px] text-slate-500 font-bold uppercase">{BANK_DETAILS.accountHolder}</p>
                    <p className="text-[9px] text-rose-500 font-medium italic mt-2">Lengkapi data pengiriman di menu Transaksi nanti.</p>
                  </div>
                )}
              </div>
              <button onClick={resetCheckout} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl transition-all hover:bg-slate-800 active:scale-95">
                Tutup
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Transactions;
