import React, { useState, useEffect } from 'react';
import { X, Minus, Plus, ShoppingBag, Check } from 'lucide-react';
import { MenuItem, CustomizationOption } from '../types';
import { formatPrice } from '../utils/formatters';

interface ProductDetailModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (
    item: MenuItem,
    quantity: number,
    selectedOptions: string[],
    specialInstructions: string,
    itemTotal: number
  ) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  item,
  isOpen,
  onClose,
  onAddToCart,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState('');

  useEffect(() => {
    if (item) {
      setQuantity(1);
      setSelectedOptionIds([]);
      setSpecialInstructions('');
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const toggleOption = (option: CustomizationOption) => {
    if (selectedOptionIds.includes(option.id)) {
      setSelectedOptionIds(selectedOptionIds.filter((id) => id !== option.id));
    } else {
      setSelectedOptionIds([...selectedOptionIds, option.id]);
    }
  };

  // Calculate extra costs
  const extraCost = (item.options || [])
    .filter((opt) => selectedOptionIds.includes(opt.id))
    .reduce((sum, opt) => sum + opt.price, 0);

  const unitPrice = item.price + extraCost;
  const totalPrice = unitPrice * quantity;

  const handleAdd = () => {
    const selectedOptionNames = (item.options || [])
      .filter((opt) => selectedOptionIds.includes(opt.id))
      .map((opt) => (opt.price > 0 ? `${opt.name} (+${opt.price} ج.س)` : opt.name));

    onAddToCart(item, quantity, selectedOptionNames, specialInstructions, totalPrice);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal / Bottom Sheet Content */}
      <div
        id="bottom-sheet"
        className="relative w-full max-w-lg bg-[#FFFFFF] rounded-t-[28px] sm:rounded-[28px] z-50 max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300 border border-[#E5E2DC]"
      >
        {/* Hero Image Section */}
        <div className="w-full h-52 sm:h-60 bg-[#E5E2DC] relative flex-shrink-0">
          <img
            src={item.heroImage || item.image}
            alt={item.name}
            className="w-full h-full object-cover"
          />
          {/* Dark gradient overlay for contrast on close button */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/40 pointer-events-none" />

          {/* Close Button */}
          <button
            id="btn-close-modal"
            onClick={onClose}
            className="absolute top-4 right-4 bg-[#111111]/70 hover:bg-[#111111] backdrop-blur-md text-white rounded-full p-2.5 flex items-center justify-center shadow-lg transition-transform active:scale-90"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Badge if available */}
          {item.badge && (
            <span className="absolute bottom-4 right-4 bg-[#F28C18] text-white text-xs font-extrabold px-3 py-1 rounded-full shadow-md">
              {item.badge}
            </span>
          )}
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-grow space-y-5">
          {/* Title & Base Price */}
          <div className="flex justify-between items-start gap-4">
            <div>
              <h2 className="text-2xl font-bold text-[#1C1C18] tracking-tight">{item.name}</h2>
              <span className="text-xs text-[#887363] font-medium block mt-0.5">{item.nameEn}</span>
            </div>
            <span className="text-2xl font-black text-[#F28C18] whitespace-nowrap">
              {formatPrice(item.price)}
            </span>
          </div>

          {/* Description */}
          <p className="text-[#554335] text-sm sm:text-base leading-relaxed bg-[#F8F5EF] p-3.5 rounded-xl border border-[#E5E2DC]">
            {item.description}
          </p>

          {/* Customization Options */}
          {item.options && item.options.length > 0 && (
            <div className="space-y-3">
              <label className="block text-base font-bold text-[#1C1C18]">
                ملاحظات وإضافات اختيارية
              </label>
              <div className="flex flex-wrap gap-2">
                {item.options.map((option) => {
                  const isSelected = selectedOptionIds.includes(option.id);
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => toggleOption(option)}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all border ${
                        isSelected
                          ? 'bg-[#111111] text-white border-[#111111] shadow-sm scale-[1.02]'
                          : 'bg-[#F8F5EF] text-[#1C1C18] border-[#E5E2DC] hover:border-[#887363]'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-md flex items-center justify-center border text-[10px] ${
                          isSelected
                            ? 'bg-[#F28C18] border-[#F28C18] text-white'
                            : 'border-[#887363] bg-white'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span>{option.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Special Instructions */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-[#1C1C18]">
              تعليمات خاصة للطلب (اختياري)
            </label>
            <textarea
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="أضف أي تعليمات خاصة للمطبخ هنا..."
              rows={2}
              className="w-full bg-[#F8F5EF] border border-[#E5E2DC] rounded-xl p-3 text-sm text-[#1C1C18] focus:border-[#111111] focus:ring-0 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Footer Bar with Quantity and Add Button */}
        <div className="p-4 sm:p-5 bg-[#FFFFFF] border-t border-[#E5E2DC] flex items-center justify-between gap-3 shadow-lg">
          {/* Quantity Stepper */}
          <div className="flex items-center bg-[#F8F5EF] rounded-xl border border-[#E5E2DC] p-1">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="w-9 h-9 flex items-center justify-center text-[#1C1C18] hover:text-[#F28C18] disabled:opacity-40 transition-colors rounded-lg active:scale-90"
              aria-label="إنقاص الكمية"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span id="bs-quantity" className="w-8 text-center font-bold text-base text-[#1C1C18]">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-9 h-9 flex items-center justify-center text-[#1C1C18] hover:text-[#F28C18] transition-colors rounded-lg active:scale-90"
              aria-label="زيادة الكمية"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add to Cart CTA */}
          <button
            id="btn-add-to-cart-confirm"
            onClick={handleAdd}
            className="flex-grow bg-[#111111] hover:bg-[#252520] active:scale-[0.98] text-white rounded-xl py-3.5 px-4 font-bold text-base flex items-center justify-between shadow-md transition-all group"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#F28C18] group-hover:scale-110 transition-transform" />
              <span>أضف للسلة</span>
            </div>
            <span className="text-[#F28C18] font-black text-lg">
              {formatPrice(totalPrice)}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
