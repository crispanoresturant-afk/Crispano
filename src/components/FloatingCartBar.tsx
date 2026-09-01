import React from 'react';
import { ShoppingBag, ArrowLeft } from 'lucide-react';
import { formatPrice } from '../utils/formatters';

interface FloatingCartBarProps {
  itemCount: number;
  totalAmount: number;
  onClick: () => void;
}

export const FloatingCartBar: React.FC<FloatingCartBarProps> = ({
  itemCount,
  totalAmount,
  onClick,
}) => {
  if (itemCount === 0) return null;

  return (
    <div className="fixed bottom-20 md:bottom-8 left-0 right-0 px-4 z-30 max-w-screen-md mx-auto pointer-events-none animate-in slide-in-from-bottom-5 duration-300">
      <button
        id="btn-floating-cart"
        onClick={onClick}
        className="w-full bg-[#111111] hover:bg-[#1C1C18] text-white rounded-[18px] p-3.5 sm:p-4 flex items-center justify-between ambient-shadow-2 pointer-events-auto transition-all active:scale-[0.98] border border-white/10 shadow-2xl group"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-[#F28C18]/20 flex items-center justify-center text-[#F28C18] group-hover:scale-105 transition-transform">
            <ShoppingBag className="w-5 h-5 text-[#F28C18]" />
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base text-white">السلة</span>
              <span className="text-white/40 text-sm">|</span>
              <span className="text-sm font-medium text-[#F8F5EF]/80">
                {itemCount} {itemCount === 1 ? 'صنف' : itemCount === 2 ? 'صنفان' : 'أصناف'}
              </span>
            </div>
            <p className="text-xs text-white/50 hidden sm:block">اضغط للاستمرار إلى إتمام الطلب</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-extrabold text-lg sm:text-xl text-[#F28C18] tracking-tight">
            {formatPrice(totalAmount)}
          </span>
          <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/80 group-hover:bg-[#F28C18] group-hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </div>
        </div>
      </button>
    </div>
  );
};
