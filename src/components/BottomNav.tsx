import React from 'react';
import { Home, UtensilsCrossed, ShoppingBag, MessageCircle } from 'lucide-react';
import { ActiveTab } from '../types';

interface BottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  cartCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  cartCount,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 w-full z-40 bg-[#111111] text-white shadow-2xl border-t border-white/10 px-3 py-2 pb-5 md:hidden">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {/* Home Tab */}
        <button
          id="nav-tab-home"
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center justify-center transition-all duration-200 active:scale-90 rounded-xl px-3.5 py-1.5 ${
            activeTab === 'home'
              ? 'bg-[#F28C18] text-white shadow-md'
              : 'text-[#E5E2DC] hover:text-white hover:bg-white/5'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[12px] font-bold mt-1 tracking-tight">الرئيسية</span>
        </button>

        {/* Menu Tab */}
        <button
          id="nav-tab-menu"
          onClick={() => setActiveTab('menu')}
          className={`flex flex-col items-center justify-center transition-all duration-200 active:scale-90 rounded-xl px-3.5 py-1.5 ${
            activeTab === 'menu'
              ? 'bg-[#F28C18] text-white shadow-md'
              : 'text-[#E5E2DC] hover:text-white hover:bg-white/5'
          }`}
        >
          <UtensilsCrossed className="w-5 h-5" />
          <span className="text-[12px] font-bold mt-1 tracking-tight">المنيو</span>
        </button>

        {/* Cart Tab */}
        <button
          id="nav-tab-cart"
          onClick={() => setActiveTab('cart')}
          className={`flex flex-col items-center justify-center transition-all duration-200 active:scale-90 rounded-xl px-3.5 py-1.5 relative ${
            activeTab === 'cart'
              ? 'bg-[#F28C18] text-white shadow-md'
              : 'text-[#E5E2DC] hover:text-white hover:bg-white/5'
          }`}
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span
                className={`absolute -top-1.5 -right-2 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-[#111111] ${
                  activeTab === 'cart' ? 'bg-[#111111] text-[#F28C18]' : 'bg-[#F28C18] text-white'
                }`}
              >
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </div>
          <span className="text-[12px] font-bold mt-1 tracking-tight">السلة</span>
        </button>

        {/* Contact Tab */}
        <button
          id="nav-tab-contact"
          onClick={() => setActiveTab('contact')}
          className={`flex flex-col items-center justify-center transition-all duration-200 active:scale-90 rounded-xl px-3.5 py-1.5 ${
            activeTab === 'contact'
              ? 'bg-[#F28C18] text-white shadow-md'
              : 'text-[#E5E2DC] hover:text-white hover:bg-white/5'
          }`}
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-[12px] font-bold mt-1 tracking-tight">تواصل</span>
        </button>
      </div>
    </nav>
  );
};
