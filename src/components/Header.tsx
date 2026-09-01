import React from 'react';
import { ShoppingCart, Menu, PhoneCall } from 'lucide-react';
import { RESTAURANT_INFO } from '../data/menuData';

interface HeaderProps {
  cartCount: number;
  onOpenDrawer: () => void;
  onOpenCart: () => void;
  onNavigateHome: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  onOpenDrawer,
  onOpenCart,
  onNavigateHome,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 w-full z-40 h-16 bg-[#F8F5EF]/95 backdrop-blur-md shadow-sm border-b border-[#E5E2DC] transition-all">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between">
        {/* Menu Drawer Toggle */}
        <button
          id="btn-drawer-open"
          onClick={onOpenDrawer}
          className="p-2 -mr-1 rounded-xl text-[#1C1C18] hover:bg-[#EBE8E2] active:scale-95 transition-all focus:outline-none"
          aria-label="القائمة الجانبية"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Center Logo */}
        <button
          id="btn-logo-home"
          onClick={onNavigateHome}
          className="h-11 flex items-center justify-center focus:outline-none active:scale-95 transition-transform"
          aria-label="الرئيسية"
        >
          <img
            src={RESTAURANT_INFO.logoUrl}
            alt={RESTAURANT_INFO.fullName}
            className="h-10 w-auto object-contain drop-shadow-sm"
          />
        </button>

        {/* Right Actions: Hotline link and Cart Button */}
        <div className="flex items-center gap-2">
          <a
            id="link-hotline-header"
            href={`tel:${RESTAURANT_INFO.hotline}`}
            className="hidden sm:flex items-center gap-1.5 bg-[#1C1C18] text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-sm hover:bg-[#31312D] transition-colors"
            title="الخط الساخن"
          >
            <PhoneCall className="w-3.5 h-3.5 text-[#F28C18]" />
            <span>{RESTAURANT_INFO.hotline}</span>
          </a>

          <button
            id="btn-cart-header"
            onClick={onOpenCart}
            className="relative p-2 -ml-1 rounded-xl text-[#1C1C18] hover:bg-[#EBE8E2] active:scale-95 transition-all focus:outline-none"
            aria-label={`السلة (${cartCount} أصناف)`}
          >
            <ShoppingCart className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 bg-[#F28C18] text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#F8F5EF] shadow-sm animate-in zoom-in-50 duration-200">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
