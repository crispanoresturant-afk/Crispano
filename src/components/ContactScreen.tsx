import React from 'react';
import { Phone, Headset, MapPin, Clock, MessageSquare, ExternalLink, ShieldCheck, Heart } from 'lucide-react';
import { RESTAURANT_INFO } from '../data/menuData';

export const ContactScreen: React.FC = () => {
  return (
    <div className="max-w-[760px] mx-auto px-4 sm:px-6 py-4 pb-32 space-y-6">
      {/* Brand Hero Card */}
      <div className="bg-[#1C1C18] text-white rounded-[24px] p-6 text-center space-y-3 relative overflow-hidden shadow-xl">
        <div
          className="absolute inset-0 opacity-20 bg-cover bg-center pointer-events-none"
          style={{ backgroundImage: `url(${RESTAURANT_INFO.heroBgUrl})` }}
        />
        <div className="relative z-10">
          <img
            src={RESTAURANT_INFO.heroBannerLogoUrl}
            alt="CRISPANO"
            className="h-16 w-auto mx-auto object-contain mb-2"
          />
          <h1 className="text-2xl font-black text-[#F28C18]">{RESTAURANT_INFO.fullName}</h1>
          <p className="text-sm text-white/80 font-medium">{RESTAURANT_INFO.slogan}</p>
        </div>
      </div>

      {/* Direct Contact Methods */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Hotline */}
        <a
          id="btn-call-hotline"
          href={`tel:${RESTAURANT_INFO.hotline}`}
          className="bg-[#FFFFFF] hover:bg-[#F8F5EF] p-5 rounded-2xl border border-[#E5E2DC] ambient-shadow-1 flex items-center justify-between transition-all active:scale-98 group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#F28C18]/15 flex items-center justify-center text-[#F28C18] group-hover:scale-110 transition-transform">
              <Headset className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-[#887363] font-bold">الخط الساخن المباشر</p>
              <p className="text-xl font-black text-[#1C1C18]" dir="ltr">
                {RESTAURANT_INFO.hotline}
              </p>
            </div>
          </div>
          <span className="text-xs font-bold bg-[#111111] text-white px-3 py-1.5 rounded-full">
            اتصال الآن
          </span>
        </a>

        {/* Mobile Phone */}
        <a
          id="btn-call-phone"
          href={`tel:${RESTAURANT_INFO.phone}`}
          className="bg-[#FFFFFF] hover:bg-[#F8F5EF] p-5 rounded-2xl border border-[#E5E2DC] ambient-shadow-1 flex items-center justify-between transition-all active:scale-98 group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#F28C18]/15 flex items-center justify-center text-[#F28C18] group-hover:scale-110 transition-transform">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-[#887363] font-bold">رقم الإدارة والطلبات</p>
              <p className="text-lg font-black text-[#1C1C18]" dir="ltr">
                {RESTAURANT_INFO.phoneFormatted}
              </p>
            </div>
          </div>
          <span className="text-xs font-bold bg-[#111111] text-white px-3 py-1.5 rounded-full">
            اتصال
          </span>
        </a>
      </div>

      {/* WhatsApp Chat Card */}
      <a
        id="btn-chat-whatsapp"
        href={`https://wa.me/${RESTAURANT_INFO.whatsappNumber}`}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-[#25D366] hover:bg-[#20bd5a] text-white p-5 rounded-2xl flex items-center justify-between shadow-md transition-all active:scale-98"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-white/90 font-bold">خدمة العملاء عبر واتساب</p>
            <p className="text-base font-black">محادثة فورية واستفسارات</p>
          </div>
        </div>
        <span className="text-xs font-bold bg-white text-[#25D366] px-3.5 py-1.5 rounded-full shadow-xs">
          فتح واتساب
        </span>
      </a>

      {/* Location Details Card */}
      <div className="bg-[#FFFFFF] rounded-[24px] p-6 space-y-4 ambient-shadow-1 border border-[#E5E2DC]">
        <div className="flex items-center gap-3 pb-3 border-b border-[#F0EEE8]">
          <div className="w-10 h-10 rounded-xl bg-[#F28C18]/15 flex items-center justify-center text-[#F28C18]">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#1C1C18]">عنوان المطعم والفرع</h2>
            <p className="text-xs text-[#887363]">{RESTAURANT_INFO.city} - السودان</p>
          </div>
        </div>

        <div className="bg-[#F8F5EF] p-4 rounded-xl border border-[#E5E2DC] space-y-2">
          <p className="text-sm font-bold text-[#1C1C18] leading-relaxed">
            {RESTAURANT_INFO.address}
          </p>
          <p className="text-xs text-[#554335]">
            نرحب بكم يومياً لتناول أشهى الوجبات السريعة داخل الصالة أو استلام الطلبات الخارجية وخدمة التوصيل السريع لجميع مناطق أم درمان.
          </p>
        </div>

        {/* Google Maps link button */}
        <a
          href="https://maps.google.com/?q=Omdurman+Sudan"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-[#111111] hover:bg-[#252520] text-white py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          <span>فتح الموقع على خرائط Google Maps</span>
        </a>
      </div>

      {/* Working Hours & Service */}
      <div className="bg-[#FFFFFF] rounded-[24px] p-6 space-y-4 ambient-shadow-1 border border-[#E5E2DC]">
        <div className="flex items-center gap-3 pb-3 border-b border-[#F0EEE8]">
          <div className="w-10 h-10 rounded-xl bg-[#F28C18]/15 flex items-center justify-center text-[#F28C18]">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#1C1C18]">أوقات العمل والتوصيل</h2>
            <p className="text-xs text-[#887363]">خدمة على مدار اليوم</p>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm py-1">
          <span className="font-bold text-[#1C1C18]">ساعات العمل اليومية:</span>
          <span className="font-semibold text-[#F28C18]">{RESTAURANT_INFO.openingHours}</span>
        </div>

        <div className="flex items-center justify-between text-sm py-1 border-t border-[#F0EEE8]">
          <span className="font-bold text-[#1C1C18]">مناطق التوصيل:</span>
          <span className="font-semibold text-[#554335]">أم درمان والمهندسين والمناطق المجاورة</span>
        </div>
      </div>

      {/* Quality Promise */}
      <div className="bg-gradient-to-r from-[#F8F5EF] to-[#F0EEE8] p-5 rounded-2xl border border-[#E5E2DC] flex items-center gap-3 text-xs text-[#554335]">
        <ShieldCheck className="w-8 h-8 text-[#F28C18] flex-shrink-0" />
        <p>
          نلتزم في <strong className="text-[#1C1C18]">مطعم كرسبيانو</strong> بتقديم أعلى معايير الجودة والنظافة، مع استخدام الدواجن واللحوم الطازجة والخلطات الأصلية يومياً.
        </p>
      </div>
    </div>
  );
};
