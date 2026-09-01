import React from 'react';
import { CheckCircle2, MessageSquare, PhoneCall, Clock, X, ShoppingBag } from 'lucide-react';
import { Order } from '../types';
import { RESTAURANT_INFO } from '../data/menuData';
import { formatPrice, generateWhatsAppOrderMessage, createWhatsAppUrl } from '../utils/formatters';

interface OrderSuccessModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !order) return null;

  const handleReopenWhatsApp = () => {
    const message = generateWhatsAppOrderMessage(
      order.items,
      order.customer,
      order.deliveryMethod,
      order.subtotal,
      order.deliveryFee,
      order.total,
      order.id
    );
    window.open(createWhatsAppUrl(message), '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-[#FFFFFF] rounded-[28px] p-6 sm:p-7 shadow-2xl z-50 space-y-5 animate-in zoom-in-95 duration-200 border border-[#E5E2DC]">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-[#887363] hover:bg-[#F0EEE8] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success Icon & Title */}
        <div className="text-center space-y-2 pt-2">
          <div className="w-16 h-16 bg-[#25D366]/15 text-[#25D366] rounded-full mx-auto flex items-center justify-center shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-[#1C1C18]">تم إرسال الطلب بنجاح!</h2>
          <p className="text-xs sm:text-sm text-[#554335]">
            شكراً لطلبك من <strong className="text-[#1C1C18]">مطعم كرسبانو</strong>. رقم طلبك هو:
          </p>
          <div className="inline-block bg-[#F8F5EF] border border-[#E5E2DC] px-4 py-1.5 rounded-full text-base font-black text-[#F28C18]">
            #{order.id}
          </div>
        </div>

        {/* Status & Estimated Time */}
        <div className="bg-[#F8F5EF] p-4 rounded-2xl border border-[#E5E2DC] space-y-3">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-[#554335] font-semibold">حالة الطلب الحالية:</span>
            <span className="bg-[#F28C18]/15 text-[#F28C18] font-bold px-2.5 py-0.5 rounded-full">
              قيد الاستلام والتجهيز 🍳
            </span>
          </div>

          <div className="flex items-center justify-between text-xs sm:text-sm border-t border-[#E5E2DC] pt-2">
            <div className="flex items-center gap-1.5 text-[#554335]">
              <Clock className="w-4 h-4 text-[#F28C18]" />
              <span>الوقت المتوقع للتجهيز:</span>
            </div>
            <span className="font-bold text-[#1C1C18]">20 - 35 دقيقة</span>
          </div>
        </div>

        {/* Mini Receipt Summary */}
        <div className="space-y-2 text-xs">
          <p className="font-bold text-[#1C1C18]">الوجبات المطلوبة ({order.items.length}):</p>
          <div className="max-h-32 overflow-y-auto space-y-1.5 pr-1">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-[#554335]">
                <span className="truncate max-w-[200px]">
                  {item.quantity}x {item.menuItem.name}
                </span>
                <span className="font-bold text-[#1C1C18]">{formatPrice(item.itemTotal)}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center text-sm font-black text-[#1C1C18] pt-2 border-t border-[#E5E2DC]">
            <span>الإجمالي:</span>
            <span className="text-[#F28C18] text-base">{formatPrice(order.total)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          <button
            onClick={handleReopenWhatsApp}
            className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
          >
            <MessageSquare className="w-5 h-5" />
            <span>فتح واتساب للتواصل مع المطعم</span>
          </button>

          <a
            href={`tel:${RESTAURANT_INFO.hotline}`}
            className="w-full bg-[#111111] hover:bg-[#252520] text-white py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all"
          >
            <PhoneCall className="w-4 h-4 text-[#F28C18]" />
            <span>اتصال بالخط الساخن ({RESTAURANT_INFO.hotline})</span>
          </a>

          <button
            onClick={onClose}
            className="w-full text-xs font-bold text-[#887363] hover:text-[#1C1C18] py-1 text-center"
          >
            العودة للقائمة الرئيسية
          </button>
        </div>
      </div>
    </div>
  );
};
