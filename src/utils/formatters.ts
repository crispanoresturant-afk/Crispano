import { CartItem, CustomerDetails, DeliveryMethod, Order } from '../types';
import { RESTAURANT_INFO } from '../data/menuData';

export const formatPrice = (amount: number): string => {
  return `${amount.toLocaleString('en-US')} ${RESTAURANT_INFO.currency}`;
};

export const generateWhatsAppOrderMessage = (
  items: CartItem[],
  customer: CustomerDetails,
  deliveryMethod: DeliveryMethod,
  subtotal: number,
  deliveryFee: number,
  total: number,
  orderId: string
): string => {
  const deliveryMethodText =
    deliveryMethod === 'delivery'
      ? '🚗 توصيل للمنزل'
      : deliveryMethod === 'pickup'
      ? '🏬 استلام من الفرع'
      : '🍽️ داخل المحل';

  let message = `*طلب جديد من تطبيق كرسبانو* 🍗🍕\n`;
  message += `━━━━━━━━━━━━━━━━━━━━\n`;
  message += `*رقم الطلب:* #${orderId}\n`;
  message += `*طريقة الاستلام:* ${deliveryMethodText}\n\n`;

  message += `*بيانات العميل:*\n`;
  message += `👤 *الاسم:* ${customer.name || 'غير محدد'}\n`;
  message += `📱 *الهاتف:* ${customer.phone || 'غير محدد'}\n`;
  
  if (deliveryMethod === 'delivery') {
    message += `📍 *العنوان:* ${customer.address || 'غير محدد'}\n`;
  } else if (deliveryMethod === 'dinein' && customer.tableNumber) {
    message += `🪑 *رقم الطاولة:* ${customer.tableNumber}\n`;
  }

  if (customer.notes) {
    message += `📝 *ملاحظات:* ${customer.notes}\n`;
  }

  message += `\n*تفاصيل الوجبات المطلوبة:*\n`;
  items.forEach((item, index) => {
    message += `\n${index + 1}. *${item.menuItem.name}* (الكمية: ${item.quantity})\n`;
    message += `   السعر: ${formatPrice(item.itemTotal)}\n`;
    
    if (item.selectedOptions && item.selectedOptions.length > 0) {
      message += `   التفضيلات: ${item.selectedOptions.join(' ، ')}\n`;
    }
    
    if (item.specialInstructions && item.specialInstructions.trim()) {
      message += `   تعليمات: ${item.specialInstructions.trim()}\n`;
    }
  });

  message += `\n━━━━━━━━━━━━━━━━━━━━\n`;
  message += `*المجموع الفرعي:* ${formatPrice(subtotal)}\n`;
  if (deliveryMethod === 'delivery') {
    message += `*رسوم التوصيل:* ${formatPrice(deliveryFee)}\n`;
  }
  message += `*الإجمالي النهائي:* ${formatPrice(total)}\n`;
  message += `━━━━━━━━━━━━━━━━━━━━\n`;
  message += `✨ *كرسبانو - طعم معروف عنوانه*\n`;
  message += `📞 الخط الساخن: ${RESTAURANT_INFO.hotline} | الهاتف: ${RESTAURANT_INFO.phoneFormatted}`;

  return message;
};

export const createWhatsAppUrl = (message: string): string => {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${RESTAURANT_INFO.whatsappNumber}?text=${encoded}`;
};
