import React, { useState } from 'react';
import {
  ArrowRight,
  Car,
  Store,
  Utensils,
  Trash2,
  Plus,
  Minus,
  Send,
  Phone,
  Headset,
  MapPin,
  ShoppingBag,
  AlertCircle,
} from 'lucide-react';
import { CartItem, CustomerDetails, DeliveryMethod, Order } from '../types';
import { RESTAURANT_INFO } from '../data/menuData';
import { formatPrice, generateWhatsAppOrderMessage, createWhatsAppUrl } from '../utils/formatters';

interface CheckoutScreenProps {
  cartItems: CartItem[];
  onUpdateQuantity: (cartItemId: string, newQuantity: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onClearCart: () => void;
  onBackToMenu: () => void;
  onOrderCompleted: (order: Order) => void;
}

export const CheckoutScreen: React.FC<CheckoutScreenProps> = ({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onBackToMenu,
  onOrderCompleted,
}) => {
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('delivery');
  const [customer, setCustomer] = useState<CustomerDetails>({
    name: '',
    phone: '',
    address: '',
    tableNumber: '',
    notes: '',
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const subtotal = cartItems.reduce((sum, item) => sum + item.itemTotal, 0);
  const deliveryFee = deliveryMethod === 'delivery' ? RESTAURANT_INFO.deliveryFee : 0;
  const grandTotal = subtotal + deliveryFee;

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    if (!customer.name.trim()) {
      errors.name = 'يرجى كتابة الاسم الكريم';
    }
    if (!customer.phone.trim()) {
      errors.phone = 'يرجى كتابة رقم الهاتف';
    } else if (customer.phone.trim().length < 9) {
      errors.phone = 'يرجى إدخال رقم هاتف صحيح';
    }
    if (deliveryMethod === 'delivery' && !customer.address.trim()) {
      errors.address = 'يرجى إدخال العنوان التفصيلي للتوصيل';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSendOrder = () => {
    if (cartItems.length === 0) return;

    if (!validateForm()) {
      // Scroll to first error
      const firstInput = document.querySelector('.error-input');
      if (firstInput) {
        firstInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    const orderId = Math.floor(1000 + Math.random() * 9000).toString();
    const orderMessage = generateWhatsAppOrderMessage(
      cartItems,
      customer,
      deliveryMethod,
      subtotal,
      deliveryFee,
      grandTotal,
      orderId
    );

    const newOrder: Order = {
      id: orderId,
      items: [...cartItems],
      customer: { ...customer },
      deliveryMethod,
      subtotal,
      deliveryFee,
      total: grandTotal,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    // Open WhatsApp URL
    const waUrl = createWhatsAppUrl(orderMessage);
    window.open(waUrl, '_blank');

    // Notify parent for receipt & state save
    onOrderCompleted(newOrder);
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center space-y-6">
        <div className="w-24 h-24 bg-[#FFFFFF] rounded-full mx-auto flex items-center justify-center ambient-shadow-1 border border-[#E5E2DC]">
          <ShoppingBag className="w-12 h-12 text-[#887363]" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-[#1C1C18]">السلة فارغة حالياً</h2>
          <p className="text-[#554335] text-sm max-w-sm mx-auto">
            لم تقم بإضافة أي وجبات بعد. تصفح قائمة الطعام واختر ما تشتهيه!
          </p>
        </div>
        <button
          id="btn-empty-cart-back"
          onClick={onBackToMenu}
          className="bg-[#F28C18] text-white px-8 py-3.5 rounded-full font-bold text-base shadow-md hover:bg-[#D97706] active:scale-95 transition-all"
        >
          تصفح قائمة الطعام
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[760px] mx-auto px-4 sm:px-6 py-4 pb-32 space-y-6">
      {/* Header Bar Navigation */}
      <div className="flex items-center justify-between pb-2 border-b border-[#E5E2DC]">
        <button
          onClick={onBackToMenu}
          className="flex items-center gap-1.5 text-sm font-bold text-[#1C1C18] hover:text-[#F28C18] transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          <span>متابعة التسوق</span>
        </button>
        <span className="text-sm font-bold text-[#887363]">
          {cartItems.reduce((sum, item) => sum + item.quantity, 0)} عناصر في السلة
        </span>
      </div>

      {/* Step 1: Delivery Method matching mockup */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[#1C1C18]">طريقة استلام الطلب</h2>
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
          {/* Delivery */}
          <button
            type="button"
            onClick={() => setDeliveryMethod('delivery')}
            className={`flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-[20px] transition-all border-2 active:scale-95 ${
              deliveryMethod === 'delivery'
                ? 'bg-[#F28C18] text-white border-[#F28C18] shadow-md'
                : 'bg-[#FFFFFF] text-[#1C1C18] border-transparent hover:border-[#E5E2DC] ambient-shadow-1'
            }`}
          >
            <Car className="w-6 h-6 mb-1.5" />
            <span className="text-xs sm:text-sm font-bold">توصيل</span>
          </button>

          {/* Pickup */}
          <button
            type="button"
            onClick={() => setDeliveryMethod('pickup')}
            className={`flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-[20px] transition-all border-2 active:scale-95 ${
              deliveryMethod === 'pickup'
                ? 'bg-[#F28C18] text-white border-[#F28C18] shadow-md'
                : 'bg-[#FFFFFF] text-[#1C1C18] border-transparent hover:border-[#E5E2DC] ambient-shadow-1'
            }`}
          >
            <Store className="w-6 h-6 mb-1.5" />
            <span className="text-xs sm:text-sm font-bold">استلام من الفرع</span>
          </button>

          {/* Dine-in */}
          <button
            type="button"
            onClick={() => setDeliveryMethod('dinein')}
            className={`flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-[20px] transition-all border-2 active:scale-95 ${
              deliveryMethod === 'dinein'
                ? 'bg-[#F28C18] text-white border-[#F28C18] shadow-md'
                : 'bg-[#FFFFFF] text-[#1C1C18] border-transparent hover:border-[#E5E2DC] ambient-shadow-1'
            }`}
          >
            <Utensils className="w-6 h-6 mb-1.5" />
            <span className="text-xs sm:text-sm font-bold">داخل المحل</span>
          </button>
        </div>
      </section>

      {/* Step 2: Contact Form matching mockup */}
      <section className="bg-[#FFFFFF] rounded-[24px] p-5 sm:p-6 space-y-4 ambient-shadow-1 border border-[#E5E2DC]">
        <h2 className="text-lg font-bold text-[#1C1C18]">تفاصيل التواصل</h2>

        <div className="space-y-3.5">
          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-[#554335] mb-1.5">
              الاسم الكريم <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={customer.name}
              onChange={(e) => {
                setCustomer({ ...customer, name: e.target.value });
                if (formErrors.name) setFormErrors({ ...formErrors, name: '' });
              }}
              placeholder="الاسم الكريم"
              className={`w-full bg-[#F8F5EF] border rounded-xl p-3 text-sm text-[#1C1C18] focus:border-[#111111] focus:ring-0 focus:outline-none transition-colors ${
                formErrors.name ? 'border-red-500 error-input' : 'border-[#E5E2DC]'
              }`}
            />
            {formErrors.name && (
              <p className="text-xs text-red-500 font-medium mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {formErrors.name}
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-bold text-[#554335] mb-1.5">
              رقم الهاتف <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={customer.phone}
              onChange={(e) => {
                setCustomer({ ...customer, phone: e.target.value });
                if (formErrors.phone) setFormErrors({ ...formErrors, phone: '' });
              }}
              placeholder="01XXXXXXXX"
              className={`w-full bg-[#F8F5EF] border rounded-xl p-3 text-sm text-[#1C1C18] focus:border-[#111111] focus:ring-0 focus:outline-none transition-colors ${
                formErrors.phone ? 'border-red-500 error-input' : 'border-[#E5E2DC]'
              }`}
            />
            {formErrors.phone && (
              <p className="text-xs text-red-500 font-medium mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {formErrors.phone}
              </p>
            )}
          </div>

          {/* Address or Table depending on method */}
          {deliveryMethod === 'delivery' && (
            <div>
              <label className="block text-xs font-bold text-[#554335] mb-1.5">
                العنوان التفصيلي <span className="text-red-500">*</span>
              </label>
              <textarea
                value={customer.address}
                onChange={(e) => {
                  setCustomer({ ...customer, address: e.target.value });
                  if (formErrors.address) setFormErrors({ ...formErrors, address: '' });
                }}
                placeholder="المنطقة، الشارع، رقم المنزل، علامة مميزة..."
                rows={2}
                className={`w-full bg-[#F8F5EF] border rounded-xl p-3 text-sm text-[#1C1C18] focus:border-[#111111] focus:ring-0 focus:outline-none transition-colors ${
                  formErrors.address ? 'border-red-500 error-input' : 'border-[#E5E2DC]'
                }`}
              />
              {formErrors.address && (
                <p className="text-xs text-red-500 font-medium mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {formErrors.address}
                </p>
              )}
            </div>
          )}

          {deliveryMethod === 'dinein' && (
            <div>
              <label className="block text-xs font-bold text-[#554335] mb-1.5">
                رقم الطاولة (اختياري)
              </label>
              <input
                type="text"
                value={customer.tableNumber || ''}
                onChange={(e) => setCustomer({ ...customer, tableNumber: e.target.value })}
                placeholder="أدخل رقم الطاولة إذا كنت جالساً بالمطعم"
                className="w-full bg-[#F8F5EF] border border-[#E5E2DC] rounded-xl p-3 text-sm text-[#1C1C18] focus:border-[#111111] focus:ring-0 focus:outline-none transition-colors"
              />
            </div>
          )}

          {deliveryMethod === 'pickup' && (
            <div className="bg-[#F8F5EF] p-3 rounded-xl border border-[#E5E2DC] text-xs text-[#554335]">
              📍 يمكنك استلام طلبك مباشرة من فرعنا في:{' '}
              <strong className="text-[#1C1C18]">{RESTAURANT_INFO.address}</strong>
            </div>
          )}
        </div>
      </section>

      {/* Step 3: Order Summary matching mockup */}
      <section className="bg-[#FFFFFF] rounded-[24px] p-5 sm:p-6 space-y-4 ambient-shadow-1 border border-[#E5E2DC]">
        <div className="flex justify-between items-center pb-2 border-b border-[#F0EEE8]">
          <h2 className="text-lg font-bold text-[#1C1C18]">ملخص الطلب</h2>
          <button
            onClick={onClearCart}
            className="text-xs text-red-600 font-bold hover:underline"
          >
            إفراغ السلة
          </button>
        </div>

        {/* Cart Items List */}
        <div className="space-y-3 divide-y divide-[#F0EEE8]">
          {cartItems.map((item) => (
            <div
              key={item.cartItemId}
              className="pt-3 first:pt-0 flex items-center justify-between gap-3"
            >
              {/* Image & Title */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-14 h-14 rounded-xl bg-[#E5E2DC] flex-shrink-0 overflow-hidden relative">
                  <img
                    src={item.menuItem.image}
                    alt={item.menuItem.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm sm:text-base text-[#1C1C18] truncate">
                    {item.menuItem.name}
                  </h3>
                  {item.selectedOptions && item.selectedOptions.length > 0 && (
                    <p className="text-xs text-[#887363] truncate">
                      {item.selectedOptions.join(' ، ')}
                    </p>
                  )}
                  {item.specialInstructions && (
                    <p className="text-xs text-[#887363] italic truncate">
                      ملاحظة: {item.specialInstructions}
                    </p>
                  )}
                </div>
              </div>

              {/* Price, Stepper & Delete */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="flex items-center bg-[#F8F5EF] rounded-lg border border-[#E5E2DC] p-0.5">
                  <button
                    onClick={() => onUpdateQuantity(item.cartItemId, item.quantity - 1)}
                    className="w-6 h-6 flex items-center justify-center text-[#554335] hover:text-black"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
                  <button
                    onClick={() => onUpdateQuantity(item.cartItemId, item.quantity + 1)}
                    className="w-6 h-6 flex items-center justify-center text-[#554335] hover:text-black"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                <div className="text-left min-w-[70px]">
                  <p className="font-extrabold text-sm sm:text-base text-[#1C1C18]">
                    {formatPrice(item.itemTotal)}
                  </p>
                </div>

                <button
                  onClick={() => onRemoveItem(item.cartItemId)}
                  className="text-[#887363] hover:text-red-500 p-1"
                  aria-label="حذف الصنف"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bill Totals */}
        <div className="pt-4 border-t border-[#E5E2DC] space-y-2">
          <div className="flex justify-between text-sm text-[#554335]">
            <span>المجموع الفرعي</span>
            <span className="font-bold">{formatPrice(subtotal)}</span>
          </div>

          <div className="flex justify-between text-sm text-[#554335]">
            <span>رسوم التوصيل</span>
            <span className="font-bold">
              {deliveryMethod === 'delivery' ? formatPrice(deliveryFee) : 'مجاناً'}
            </span>
          </div>

          <div className="flex justify-between text-lg font-black text-[#1C1C18] pt-2 border-t border-[#F0EEE8]">
            <span>الإجمالي</span>
            <span className="text-[#F28C18] text-xl font-black">{formatPrice(grandTotal)}</span>
          </div>
        </div>
      </section>

      {/* CTA WhatsApp Order Section matching mockup */}
      <section className="text-center space-y-3 pt-2">
        <div>
          <h2 className="text-2xl font-black text-[#1C1C18] mb-1">طلبك جاهز ❤️</h2>
          <p className="text-sm text-[#554335]">
            راجع تفاصيل طلبك ثم أرسله عبر واتساب مباشرة إلى مطعم كرسبانو.
          </p>
        </div>

        <button
          id="btn-whatsapp-checkout"
          onClick={handleSendOrder}
          className="w-full bg-[#F28C18] hover:bg-[#D97706] text-white font-black text-lg py-4 rounded-[18px] shadow-lg flex items-center justify-center gap-2.5 active:scale-[0.98] transition-all group"
        >
          <Send className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>إرسال الطلب عبر واتساب</span>
        </button>
      </section>

      {/* Contact Info Card matching mockup */}
      <section className="bg-[#1C1C18] rounded-[24px] p-5 sm:p-6 text-white space-y-4 shadow-lg">
        {/* Phone */}
        <a
          href={`tel:${RESTAURANT_INFO.phone}`}
          className="flex items-center justify-between border-b border-white/10 pb-3.5 hover:opacity-85 transition-opacity"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#F28C18]/20 flex items-center justify-center text-[#F28C18]">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-white/60 font-bold">رقم الهاتف</p>
              <p className="font-bold text-base" dir="ltr">
                {RESTAURANT_INFO.phoneFormatted}
              </p>
            </div>
          </div>
          <span className="text-xs bg-[#F28C18] text-white px-3 py-1 rounded-full font-bold">
            اتصال
          </span>
        </a>

        {/* Hotline */}
        <a
          href={`tel:${RESTAURANT_INFO.hotline}`}
          className="flex items-center justify-between border-b border-white/10 pb-3.5 hover:opacity-85 transition-opacity"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#F28C18]/20 flex items-center justify-center text-[#F28C18]">
              <Headset className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-white/60 font-bold">الخط الساخن</p>
              <p className="font-bold text-base" dir="ltr">
                {RESTAURANT_INFO.hotline}
              </p>
            </div>
          </div>
          <span className="text-xs bg-[#F28C18] text-white px-3 py-1 rounded-full font-bold">
            اتصال
          </span>
        </a>

        {/* Address */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#F28C18]/20 flex items-center justify-center text-[#F28C18]">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-white/60 font-bold">الموقع</p>
              <p className="font-bold text-sm sm:text-base leading-snug">
                {RESTAURANT_INFO.address}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
