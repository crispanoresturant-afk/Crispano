import React, { useState, useMemo } from 'react';
import { Search, Plus, Heart, UtensilsCrossed } from 'lucide-react';
import { MenuItem, CategoryId, Category } from '../types';
import { formatPrice } from '../utils/formatters';

interface MenuScreenProps {
  categories: Category[];
  menuItems: MenuItem[];
  selectedCategory: CategoryId;
  onSelectCategory: (category: CategoryId) => void;
  onSelectItem: (item: MenuItem) => void;
  onQuickAddToCart: (item: MenuItem) => void;
  favorites: string[];
  onToggleFavorite: (itemId: string) => void;
}

export const MenuScreen: React.FC<MenuScreenProps> = ({
  categories,
  menuItems,
  selectedCategory,
  onSelectCategory,
  onSelectItem,
  onQuickAddToCart,
  favorites,
  onToggleFavorite,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Computed categories with 'all' if not present
  const displayCategories = useMemo(() => {
    if (!categories || categories.length === 0) return [];
    const hasAll = categories.some((c) => c.id === 'all');
    if (hasAll) return categories;
    return [{ id: 'all' as CategoryId, name: 'الكل', nameEn: 'All', icon: 'Sparkles', sortOrder: -1 }, ...categories];
  }, [categories]);

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesSearch =
        searchQuery.trim() === '' ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.nameEn.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [menuItems, selectedCategory, searchQuery]);

  const currentCategoryName = useMemo(() => {
    if (selectedCategory === 'all') return 'كل الأصناف اللذيذة';
    return categories.find((c) => c.id === selectedCategory)?.name || 'الأصناف';
  }, [selectedCategory, categories]);

  return (
    <div className="space-y-5 pb-32 pt-2 max-w-7xl mx-auto px-4 sm:px-6">
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث في قائمة طعام كرسبانو..."
          className="w-full bg-[#FFFFFF] border border-[#E5E2DC] focus:border-[#111111] focus:ring-1 focus:ring-[#111111] rounded-full py-3 px-6 pr-12 text-[#1C1C18] text-sm sm:text-base outline-none transition-all shadow-xs"
        />
        <Search className="w-5 h-5 absolute right-4.5 top-1/2 -translate-y-1/2 text-[#887363] pointer-events-none" />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#554335] bg-[#E5E2DC] px-2.5 py-1 rounded-full hover:bg-[#DCDAD4] cursor-pointer"
          >
            مسح
          </button>
        )}
      </div>

      {/* Categories Chips */}
      {displayCategories.length > 0 && (
        <div className="flex overflow-x-auto gap-2 pb-1 no-scrollbar whitespace-nowrap">
          {displayCategories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                id={`cat-chip-${cat.id}`}
                onClick={() => onSelectCategory(cat.id)}
                className={`px-4 sm:px-5 py-2 rounded-full font-bold text-xs sm:text-sm transition-all active:scale-95 border cursor-pointer ${
                  isActive
                    ? 'bg-[#111111] text-white border-[#111111] shadow-sm'
                    : 'bg-[#FFFFFF] text-[#1C1C18] border-[#E5E2DC] hover:bg-[#F0EEE8]'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      )}

      {/* Active Category Header info */}
      <div className="flex justify-between items-center px-1">
        <h2 className="text-lg font-bold text-[#1C1C18]">
          {currentCategoryName}
        </h2>
        <span className="text-xs font-bold text-[#887363]">
          {filteredItems.length} {filteredItems.length === 1 ? 'صنف' : 'أصناف'}
        </span>
      </div>

      {/* Menu Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-[#FFFFFF] rounded-2xl p-10 text-center space-y-3 border border-[#E5E2DC]">
          <UtensilsCrossed className="w-10 h-10 text-[#887363] mx-auto opacity-70" />
          <p className="text-base text-[#554335]">لا توجد وجبات في هذا التصنيف حالياً في قاعدة البيانات.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              onSelectCategory('all');
            }}
            className="bg-[#F28C18] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm cursor-pointer hover:bg-[#D97706]"
          >
            عرض الكل
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredItems.map((item) => {
            const isFav = favorites.includes(item.id);
            const isAvailable = item.isAvailable !== false;

            return (
              <div
                key={item.id}
                id={`card-item-${item.id}`}
                onClick={() => isAvailable && onSelectItem(item)}
                className={`bg-[#FFFFFF] rounded-2xl ambient-shadow-1 overflow-hidden flex transition-all border group ${
                  isAvailable
                    ? 'cursor-pointer hover:shadow-md border-[#E5E2DC]/90 active:scale-[0.99]'
                    : 'opacity-75 border-red-200 cursor-not-allowed bg-red-50/10'
                }`}
              >
                {/* Product Image */}
                <div className="w-32 sm:w-36 h-32 sm:h-36 flex-shrink-0 bg-[#E5E2DC] relative overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className={`w-full h-full object-cover transition-transform duration-300 ${
                      isAvailable ? 'group-hover:scale-105' : 'grayscale'
                    }`}
                    referrerPolicy="no-referrer"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(item.id);
                    }}
                    className="absolute top-2 right-2 bg-white/90 backdrop-blur-xs p-1.5 rounded-full text-[#1C1C18] shadow-sm hover:text-[#F28C18] transition-colors cursor-pointer"
                    aria-label="المفضلة"
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${
                        isFav ? 'fill-[#F28C18] text-[#F28C18]' : 'text-[#1C1C18]'
                      }`}
                    />
                  </button>

                  {!isAvailable && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-2 text-center">
                      <span className="text-[11px] font-black text-white bg-red-600 px-2.5 py-1 rounded-full shadow-sm">
                        غير متوفر حالياً
                      </span>
                    </div>
                  )}
                </div>

                {/* Product Content */}
                <div className="p-3.5 sm:p-4 flex flex-col justify-between flex-grow">
                  <div>
                    <h3 className="font-bold text-base sm:text-lg text-[#1C1C18] mb-1 group-hover:text-[#F28C18] transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-xs text-[#554335] line-clamp-2 leading-relaxed mb-2">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-2 flex justify-between items-center pt-2 border-t border-[#F0EEE8]">
                    <div>
                      <span className="font-black text-base sm:text-lg text-[#F28C18]">
                        {formatPrice(item.price)}
                      </span>
                    </div>

                    {isAvailable ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onQuickAddToCart(item);
                        }}
                        className="bg-[#111111] hover:bg-[#F28C18] text-white w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition-all shadow-xs cursor-pointer"
                        aria-label="إضافة للطلب"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    ) : (
                      <span className="text-[11px] font-bold text-red-600">غير متوفر</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
