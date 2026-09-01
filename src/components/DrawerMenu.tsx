import React from 'react';
import {
  X,
  Home,
  UtensilsCrossed,
  ShoppingBag,
  Phone,
  Heart,
  Headset,
  MapPin,
  Clock,
  ExternalLink,
  ChevronLeft,
  ShieldCheck,
} from 'lucide-react';
import { ActiveTab, CategoryId, Category } from '../types';
import { RESTAURANT_INFO } from '../data/menuData';

interface DrawerMenuProps {
  categories: Category[];
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: ActiveTab) => void;
  onSelectCategory: (cat: CategoryId) => void;
  favoritesCount: number;
}

export const DrawerMenu: React.FC<DrawerMenuProps> = ({
  categories,
  isOpen,
  onClose,
  onNavigateTab,
  onSelectCategory,
  favoritesCount,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Drawer Body (Right-to-Left slide) */}
      <div
        id="app-drawer"
        className="relative w-full max-w-xs sm:max-w-sm bg-[#FFFFFF] h-full shadow-2xl z-50 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300 border-l border-[#E5E2DC]"
      >
        {/* Drawer Header */}
        <div>
          <div className="p-5 bg-[#1C1C18] text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={RESTAURANT_INFO.logoUrl}
                alt="CRISPANO"
                className="h-10 w-auto object-contain"
              />
              <div>
                <h3 className="font-bold text-base text-[#F28C18]">{RESTAURANT_INFO.nameAr}</h3>
                <p className="text-xs text-white/70">{RESTAURANT_INFO.slogan}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              aria-label="إغلاق القائمة"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Navigation Links */}
          <div className="p-4 space-y-1 border-b border-[#F0EEE8]">
            <button
              onClick={() => {
                onNavigateTab('home');
                onClose();
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#F8F5EF] text-[#1C1C18] font-bold text-sm transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Home className="w-5 h-5 text-[#F28C18]" />
                <span>الرئيسية</span>
              </div>
              <ChevronLeft className="w-4 h-4 text-[#887363]" />
            </button>

            <button
              onClick={() => {
                onNavigateTab('menu');
                onClose();
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#F8F5EF] text-[#1C1C18] font-bold text-sm transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <UtensilsCrossed className="w-5 h-5 text-[#F28C18]" />
                <span>قائمة الطعام الكاملة</span>
              </div>
              <ChevronLeft className="w-4 h-4 text-[#887363]" />
            </button>

            <button
              onClick={() => {
                onNavigateTab('cart');
                onClose();
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#F8F5EF] text-[#1C1C18] font-bold text-sm transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-[#F28C18]" />
                <span>سلة المشتريات والطلب</span>
              </div>
              <ChevronLeft className="w-4 h-4 text-[#887363]" />
            </button>

            <button
              onClick={() => {
                onNavigateTab('contact');
                onClose();
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#F8F5EF] text-[#1C1C18] font-bold text-sm transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#F28C18]" />
                <span>تواصل ومعلومات الفرع</span>
              </div>
              <ChevronLeft className="w-4 h-4 text-[#887363]" />
            </button>

            {/* Admin Panel Direct Access Link */}
            <button
              id="drawer-admin-link"
              onClick={() => {
                onNavigateTab('admin');
                onClose();
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-[#1C1C18] font-bold text-sm transition-colors cursor-pointer border border-[#E5E2DC]"
            >
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>لوحة التحكم الإدارية (Admin)</span>
              </div>
              <span className="text-[10px] font-bold bg-[#1C1C18] text-white px-2 py-0.5 rounded-full">
                /admin
              </span>
            </button>
          </div>

          {/* Menu Categories list */}
          <div className="p-4 space-y-2">
            <h4 className="text-xs font-black uppercase text-[#887363] px-2 tracking-wider">
              أقسام قائمة الطعام
            </h4>
            <div className="grid grid-cols-2 gap-1.5">
              {categories.filter((c) => c.id !== 'all').map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    onSelectCategory(cat.id);
                    onNavigateTab('menu');
                    onClose();
                  }}
                  className="p-2.5 rounded-lg bg-[#F8F5EF] hover:bg-[#F0EEE8] text-right text-xs font-bold text-[#1C1C18] transition-colors border border-[#E5E2DC] cursor-pointer"
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Drawer Footer Contact Bar */}
        <div className="p-4 bg-[#F8F5EF] border-t border-[#E5E2DC] space-y-3">
          <div className="flex items-center justify-between gap-2">
            <a
              href={`tel:${RESTAURANT_INFO.hotline}`}
              className="flex-1 bg-[#111111] text-white py-2.5 px-3 rounded-xl text-center text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm hover:bg-[#252520]"
            >
              <Headset className="w-4 h-4 text-[#F28C18]" />
              <span>الخط الساخن: {RESTAURANT_INFO.hotline}</span>
            </a>
            <a
              href={`tel:${RESTAURANT_INFO.phone}`}
              className="flex-1 bg-[#F28C18] text-white py-2.5 px-3 rounded-xl text-center text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm hover:bg-[#D97706]"
            >
              <Phone className="w-4 h-4" />
              <span>اتصال مباشر</span>
            </a>
          </div>

          <div className="text-[11px] text-[#554335] text-center space-y-0.5">
            <p className="font-bold text-[#1C1C18]">{RESTAURANT_INFO.address}</p>
            <p>جميع الحقوق محفوظة © مطعم كرسبانو {new Date().getFullYear()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

