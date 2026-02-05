
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
  
  // Filtering States
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterSize, setFilterSize] = useState<string>('All');
  const [filterColor, setFilterColor] = useState<string>('All');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500000]);

  // Checkout States
  const [checkoutStep, setCheckoutStep] = useState<'IDLE' | 'SHIPPING' | 'PAYMENT' | 'SUCCESS'>('IDLE');
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    customerName: '',
    phoneNumber: '',
    address: ''
  });
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'TRANSFER'>('CASH');
  const [lastTx, setLastTx] = useState<Transaction | null>(null);

  const filteredItems = useMemo(() => {
    return inventory.filter(item => {
      const matchesSearch = 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
      const matchesSize = filterSize === 'All' || item.size === filterSize;
      const matchesColor = filterColor === 'All' || item.color === filterColor;
      const matchesPrice = item.price >= priceRange[0] && item.price <= priceRange[1];

      return matchesSearch && matchesCategory && matchesSize && matchesColor && matchesPrice;
    });
  }, [inventory, searchTerm, filterCategory, filterSize, filterColor, priceRange]);

  const addToCart = (item: Uniform) => {
    if (item.stock === 0) return;
    setCart(prev => {
      const existing = prev.find(i => i.item.id === item.id);
      if (existing) {
        if (existing.quantity >= item.stock) return prev;
        return prev.map(i => i.item.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(i => i.item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.item.id === id) {
        const newQty = Math.max(1, Math.min(i.item.stock, i.quantity + delta));
        return { ...i, quantity: newQty };
      }
      return i;
    }));
  };

  const subtotal = cart.reduce((acc, curr) => acc + (curr.item.price * curr.quantity), 0);

  const handleStartCheckout = () => {
    if (cart.length > 0) setCheckoutStep('SHIPPING');
  };

  const handleFinalizeCheckout = () => {
    const newTx: Transaction = {
      id: 'TX' + Date.now().toString(),
      cashierId: user.id,
      customerInfo: shippingInfo,
      items: cart.map(c => ({ 
        uniformId: c.item.id, 
        quantity: c.quantity, 
        price: c.item.price,
        name: c.item.name 
      })),
      totalAmount: subtotal,
      paymentMethod: paymentMethod,
      status: paymentMethod === 'CASH' ? 'PAID' : 'PENDING',
      createdAt: new Date().toISOString()
    };

    const newInventory = inventory.map(item => {
      const cartItem = cart.find(c => c.item.id === item.id);
      if (cartItem) return { ...item, stock: item.stock - cartItem.quantity };
      return item;
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
    setShippingInfo({ customerName: '', phoneNumber: '', address: '' });
  };

  return (
    <div className="flex flex-col xl:flex-row gap-8">
      {/* Sidebar Filters */}
      <aside className="w-full xl:w-72 space-y-6 flex-shrink-0">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm sticky top-24">
          <div className="flex items-center gap-2 mb-6 text-slate-800 font-bold border-b border-slate-100 pb-4">
            <Filter size={18} className="text-blue-600" />
            Filter Pencarian
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-3">Kategori</label>
              <select 
                value={filterCategory} 
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">Semua Kategori</option>
                {UNIFORM_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-3">Ukuran</label>
              <div className="grid grid-cols-3 gap-2">
                <button 
                  onClick={() => setFilterSize('All')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all border ${filterSize === 'All' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400'}`}
                >
                  ALL
                </button>
                {SIZES.map(s => (
                  <button 
                    key={s}
                    onClick={() => setFilterSize(s)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all border ${filterSize === s ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-3">Warna</label>
              <select 
                value={filterColor} 
                onChange={(e) => setFilterColor(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">Semua Warna</option>
                {COLORS.map(c => <option key={c} value={c}>{c}</option>)}
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
                setFilterSize('All');
                setFilterColor('All');
                setPriceRange([0, 500000]);
              }}
              className="w-full py-2 text-xs font-bold text-slate-400 hover:text-rose-500 transition-colors"
            >
              Reset Semua Filter
            </button>
          </div>
        </div>
      </aside>

      {/* Product Feed */}
      <div className="flex-1 space-y-6">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
          <input
            type="text"
            placeholder="Cari berdasarkan nama atau kode (contoh: SD-P01)..."
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
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <span className="px-2 py-1 bg-white/80 backdrop-blur-sm rounded text-[10px] font-black tracking-widest text-slate-500 border border-slate-200 uppercase">
                    {item.code}
                  </span>
                  <span className="px-2 py-1 bg-blue-600 rounded text-[10px] font-bold text-white uppercase">
                    {item.size}
                  </span>
                </div>
                {item.stock === 0 && (
                  <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
                    <span className="bg-white px-4 py-2 rounded-lg font-black text-rose-600 shadow-xl uppercase tracking-widest text-sm rotate-12">Stok Habis</span>
                  </div>
                )}
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">{item.category}</p>
                <h4 className="font-bold text-slate-800 line-clamp-2 leading-tight mb-2 group-hover:text-blue-600 transition-colors">{item.name}</h4>
                <div className="mt-auto pt-4 flex items-end justify-between border-t border-slate-50">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-400">{item.color}</span>
                    <p className="text-lg font-black text-slate-900 leading-none mt-1">Rp {item.price.toLocaleString('id-ID')}</p>
                  </div>
                  <div className={`px-2 py-1 rounded-md text-[10px] font-bold ${item.stock <= 5 ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>
                    Stok: {item.stock}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="bg-white rounded-3xl p-20 flex flex-col items-center text-center border-2 border-dashed border-slate-200">
            <Search size={64} className="text-slate-200 mb-6" />
            <h3 className="text-xl font-bold text-slate-800 mb-2">Tidak ada hasil ditemukan</h3>
            <p className="text-slate-500 max-w-xs">Cobalah mengubah kata kunci atau filter yang sedang aktif.</p>
          </div>
        )}
      </div>

      {/* Cart Panel */}
      <div className="w-full xl:w-96 flex-shrink-0">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden sticky top-24">
          <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-3 font-bold">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <ShoppingCart size={20} />
              </div>
              <span className="text-lg">Pesanan Anda</span>
            </div>
            <span className="bg-white/20 text-white text-xs font-black px-2.5 py-1 rounded-full uppercase tracking-widest">{cart.length} Item</span>
          </div>

          <div className="p-6 max-h-[400px] overflow-y-auto space-y-6">
            {cart.length > 0 ? (
              cart.map(({ item, quantity }) => (
                <div key={item.id} className="flex gap-4 items-start group">
                  <div className="w-16 h-16 bg-slate-50 rounded-xl flex-shrink-0 flex items-center justify-center text-slate-300 border border-slate-100">
                    <Package size={24} />
                  </div>
                  <div className="flex-1 space-y-1">
                    <h5 className="text-sm font-bold text-slate-800 line-clamp-1 group-hover:text-blue-600 transition-colors">{item.name}</h5>
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase">{item.size}</span>
                       <span className="text-xs text-slate-400 font-medium">Rp {item.price.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex items-center gap-3 pt-2">
                      <div className="flex items-center gap-2 bg-slate-50 rounded-lg p-1 border border-slate-200">
                        <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-white hover:shadow-sm rounded transition-all text-slate-400 hover:text-blue-600"><Minus size={14} /></button>
                        <span className="text-xs font-black w-5 text-center">{quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-white hover:shadow-sm rounded transition-all text-slate-400 hover:text-blue-600"><Plus size={14} /></button>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"><Trash2 size={16} /></button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-48 flex flex-col items-center justify-center text-slate-400 space-y-4">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                  <ShoppingCart size={32} className="opacity-20" />
                </div>
                <p className="text-sm font-bold">Keranjang kosong</p>
              </div>
            )}
          </div>

          <div className="p-8 bg-slate-50 border-t border-slate-200 space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-500">Subtotal</span>
                <span className="text-sm font-bold text-slate-800">Rp {subtotal.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-500">Pajak (0%)</span>
                <span className="text-sm font-bold text-slate-800">Rp 0</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                <span className="text-lg font-black text-slate-800 uppercase tracking-widest">Total</span>
                <span className="text-2xl font-black text-blue-600">Rp {subtotal.toLocaleString('id-ID')}</span>
              </div>
            </div>

            <button 
              disabled={cart.length === 0}
              onClick={handleStartCheckout}
              className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 hover:-translate-y-1 transition-all active:translate-y-0 disabled:opacity-40 disabled:pointer-events-none disabled:grayscale flex items-center justify-center gap-3"
            >
              Lanjutkan ke Checkout
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Checkout Modal Flow */}
      {checkoutStep !== 'IDLE' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
          {/* SHIPPING STEP */}
          {checkoutStep === 'SHIPPING' && (
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
              <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
                <h3 className="text-xl font-bold flex items-center gap-3">
                   <MapPin className="text-blue-500" />
                   Info Pengiriman
                </h3>
                <button onClick={resetCheckout} className="p-2 hover:bg-white/10 rounded-full"><X size={20} /></button>
              </div>
              <div className="p-8 space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase mb-2">Nama Penerima</label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input 
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" 
                        placeholder="Contoh: Ahmad Subardjo"
                        value={shippingInfo.customerName}
                        onChange={(e) => setShippingInfo({...shippingInfo, customerName: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase mb-2">Nomor Telepon / WA</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input 
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" 
                        placeholder="0812xxxxxxxx"
                        value={shippingInfo.phoneNumber}
                        onChange={(e) => setShippingInfo({...shippingInfo, phoneNumber: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase mb-2">Alamat Lengkap</label>
                    <textarea 
                      rows={3}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 resize-none" 
                      placeholder="Masukkan alamat pengiriman..."
                      value={shippingInfo.address}
                      onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})}
                    />
                  </div>
                </div>
                <div className="pt-4 flex gap-4">
                  <button onClick={resetCheckout} className="flex-1 py-4 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-2xl transition-all">Batal</button>
                  <button 
                    disabled={!shippingInfo.customerName || !shippingInfo.phoneNumber || !shippingInfo.address}
                    onClick={() => setCheckoutStep('PAYMENT')}
                    className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 disabled:opacity-50"
                  >
                    Metode Pembayaran
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* PAYMENT STEP */}
          {checkoutStep === 'PAYMENT' && (
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
              <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
                <h3 className="text-xl font-bold flex items-center gap-3">
                   <CreditCard className="text-blue-500" />
                   Pilih Pembayaran
                </h3>
                <button onClick={() => setCheckoutStep('SHIPPING')} className="p-2 hover:bg-white/10 rounded-full"><X size={20} /></button>
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
                      <p className="text-xs text-slate-500 font-medium italic">Bayar langsung di kasir atau di tempat.</p>
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

                {paymentMethod === 'TRANSFER' && (
                  <div className="p-4 bg-blue-100 border border-blue-200 rounded-xl flex gap-3 text-blue-800">
                    <Info size={18} className="flex-shrink-0" />
                    <p className="text-xs font-medium leading-relaxed">Instruksi pembayaran akan muncul di layar struk setelah Anda menekan tombol di bawah.</p>
                  </div>
                )}

                <div className="pt-4 flex gap-4">
                  <button onClick={() => setCheckoutStep('SHIPPING')} className="flex-1 py-4 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-2xl transition-all">Kembali</button>
                  <button 
                    onClick={handleFinalizeCheckout}
                    className="flex-[2] py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20"
                  >
                    Proses Sekarang
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SUCCESS STEP */}
          {checkoutStep === 'SUCCESS' && lastTx && (
            <div className="bg-white rounded-[32px] w-full max-w-sm shadow-2xl overflow-hidden p-8 text-center animate-in fade-in zoom-in duration-300">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full mb-6 ring-8 ring-emerald-50">
                <CheckCircle2 size={40} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-1">Pesan Berhasil!</h3>
              <p className="text-slate-500 text-sm mb-8 font-medium italic">Pesanan #{lastTx.id.substring(8)} siap diproses.</p>
              
              <div className="bg-slate-50 rounded-2xl p-6 space-y-4 mb-8 text-left border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                  <Receipt size={64} />
                </div>
                <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2">
                  <span>Informasi Tagihan</span>
                  <Receipt size={14} />
                </div>
                
                <div className="space-y-3">
                  {lastTx.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-xs items-center">
                      <span className="text-slate-600 font-medium truncate max-w-[150px]">{item.name} <span className="text-slate-400">x{item.quantity}</span></span>
                      <span className="font-bold text-slate-800 whitespace-nowrap">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                  <span className="font-black text-slate-400 text-[10px] uppercase">Total Bayar</span>
                  <span className="font-black text-blue-600 text-xl tracking-tight">Rp {lastTx.totalAmount.toLocaleString('id-ID')}</span>
                </div>

                {lastTx.paymentMethod === 'TRANSFER' && (
                  <div className="pt-4 mt-4 border-t border-dashed border-slate-300 space-y-3">
                     <p className="text-[10px] font-black text-slate-400 uppercase text-center mb-1 italic">Instruksi Transfer</p>
                     <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Bank</span>
                          <span className="font-bold text-slate-800">{BANK_DETAILS.bankName}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">No. Rekening</span>
                          <span className="font-bold text-blue-600 tracking-wider">{BANK_DETAILS.accountNumber}</span>
                        </div>
                        <div className="flex justify-between text-[10px]">
                          <span className="text-slate-400">Atas Nama</span>
                          <span className="font-bold text-slate-800">{BANK_DETAILS.accountHolder}</span>
                        </div>
                     </div>
                     <p className="text-[10px] text-slate-400 text-center italic">Silakan kirim bukti transfer ke Admin via WhatsApp.</p>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={resetCheckout}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl transition-all hover:bg-slate-800 active:scale-95"
                >
                  Selesai
                </button>
                <button className="w-full py-2 text-xs font-bold text-blue-600 hover:underline">
                  Simpan Struk Digital
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Transactions;
