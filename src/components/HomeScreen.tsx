import React, { useState, useMemo } from 'react';
import { Search, Heart, Plus, PhoneCall, Sparkles, MapPin, ArrowLeft, UtensilsCrossed } from 'lucide-react';
import { MenuItem, CategoryId, Category } from '../types';
import { RESTAURANT_INFO } from '../data/menuData';
import { formatPrice } from '../utils/formatters';

interface HomeScreenProps {
  categories: Category[];
  menuItems: MenuItem[];
  onSelectItem: (item: MenuItem) => void;
  onNavigateToMenu: (category?: CategoryId) => void;
  onNavigateToContact: () => void;
  favorites: string[];
  onToggleFavorite: (itemId: string) => void;
  onQuickAddToCart: (item: MenuItem) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  categories,
  menuItems,
  onSelectItem,
  onNavigateToMenu,
  onNavigateToContact,
  favorites,
  onToggleFavorite,
  onQuickAddToCart,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('all');

  // Categories list with 'all' at the beginning if categories exist
  const displayCategories = useMemo(() => {
    if (!categories || categories.length === 0) return [];
    const hasAll = categories.some((c) => c.id === 'all');
    if (hasAll) return categories;
    return [{ id: 'all' as CategoryId, name: 'الكل', nameEn: 'All', icon: 'Sparkles', sortOrder: -1 }, ...categories];
  }, [categories]);

  const popularItems = useMemo(() => {
    return menuItems.filter((item) => item.isPopular);
  }, [menuItems]);

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

  // Categories with dishes for section exploration
  const exploreCategories = useMemo(() => {
    return categories
      .filter((c) => c.id !== 'all')
      .map((cat) => {
        const catDishes = menuItems.filter((d) => d.category === cat.id);
        const sampleDish = catDishes[0];
        return {
          ...cat,
          dishCount: catDishes.length,
          sampleImage: sampleDish ? sampleDish.image : RESTAURANT_INFO.heroBannerLogoUrl,
        };
      })
      .filter((c) => c.dishCount > 0);
  }, [categories, menuItems]);

  return (
    <div className="space-y-6 pb-28 pt-2 max-w-7xl mx-auto px-4 sm:px-6">
      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="بتفتش عن شنو في كرسبانو؟"
          className="w-full bg-[#FFFFFF] border border-[#E5E2DC] focus:border-[#111111] focus:ring-1 focus:ring-[#111111] rounded-full py-3.5 px-6 pr-12 text-[#1C1C18] text-base outline-none transition-all shadow-xs"
        />
        <Search className="w-5 h-5 absolute right-4.5 top-1/2 -translate-y-1/2 text-[#887363] pointer-events-none" />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold bg-[#E5E2DC] text-[#554335] px-2.5 py-1 rounded-full hover:bg-[#DCDAD4]"
          >
            مسح
          </button>
        )}
      </div>

      {/* Categories Horizontal Scroll Chips */}
      {displayCategories.length > 0 && (
        <div className="overflow-x-auto no-scrollbar flex gap-2.5 pb-1">
          {displayCategories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-bold transition-all active:scale-95 ${
                  isActive
                    ? 'bg-[#111111] text-white shadow-md'
                    : 'bg-[#FFFFFF] border border-[#E5E2DC] text-[#1C1C18] hover:bg-[#F0EEE8]'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      )}

      {/* If searching or specific category selected, show direct grid */}
      {searchQuery.trim() !== '' || selectedCategory !== 'all' ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-[#1C1C18]">
              {selectedCategory === 'all'
                ? `نتائج البحث عن "${searchQuery}"`
                : categories.find((c) => c.id === selectedCategory)?.name || 'الأصناف'}
            </h2>
            <span className="text-xs font-bold text-[#887363]">
              ({filteredItems.length} وجبة)
            </span>
          </div>

          {filteredItems.length === 0 ? (
            <div className="bg-[#FFFFFF] rounded-2xl p-8 text-center space-y-3 border border-[#E5E2DC]">
              <p className="text-base text-[#554335]">لم نعثر على وجبات مطابقة في قاعدة البيانات.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="bg-[#F28C18] text-white px-5 py-2 rounded-xl text-sm font-bold shadow-sm"
              >
                عرض كل الأصناف
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((item) => {
                const isAvailable = item.isAvailable !== false;
                return (
                  <div
                    key={item.id}
                    onClick={() => isAvailable && onSelectItem(item)}
                    className={`bg-[#FFFFFF] rounded-2xl ambient-shadow-1 overflow-hidden flex transition-all border group ${
                      isAvailable
                        ? 'cursor-pointer hover:shadow-md border-[#E5E2DC]/80'
                        : 'opacity-70 border-red-200 cursor-not-allowed bg-red-50/10'
                    }`}
                  >
                    <div className="w-32 h-32 flex-shrink-0 bg-[#E5E2DC] relative overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.name}
                        className={`w-full h-full object-cover transition-transform duration-300 ${
                          isAvailable ? 'group-hover:scale-105' : 'grayscale'
                        }`}
                        referrerPolicy="no-referrer"
                      />
                      {!isAvailable && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-1 text-center">
                          <span className="text-[10px] font-black text-white bg-red-600 px-2 py-0.5 rounded-full">
                            غير متوفر
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-3.5 flex flex-col justify-between flex-grow">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-base text-[#1C1C18] mb-0.5">{item.name}</h3>
                        </div>
                        <p className="text-xs text-[#554335] line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                      <div className="flex justify-between items-end mt-2">
                        <span className="font-black text-lg text-[#F28C18]">
                          {formatPrice(item.price)}
                        </span>
                        {isAvailable ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onQuickAddToCart(item);
                            }}
                            className="w-8 h-8 rounded-full bg-[#F28C18] text-white flex items-center justify-center ambient-shadow-1 hover:bg-[#D97706] active:scale-90 transition-transform cursor-pointer"
                            aria-label="إضافة سريعة"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        ) : (
                          <span className="text-[11px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded-md border border-red-200">
                            غير متوفر حالياً
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Hero Banner Section */}
          <div className="bg-[#1C1C18] rounded-[24px] overflow-hidden shadow-xl relative flex flex-col items-center text-center p-6 sm:p-8 text-white">
            <div
              className="absolute inset-0 opacity-25 bg-cover bg-center mix-blend-luminosity pointer-events-none"
              style={{ backgroundImage: `url(${RESTAURANT_INFO.heroBgUrl})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#1C1C18]/90 to-transparent pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center max-w-md">
              <img
                src={RESTAURANT_INFO.heroBannerLogoUrl}
                alt="CRISPANO"
                className="h-20 sm:h-24 w-auto object-contain mb-3 drop-shadow-md"
              />

              <h1 className="text-2xl sm:text-3xl font-black text-[#F28C18] mb-1 tracking-tight">
                {RESTAURANT_INFO.slogan}
              </h1>
              <p className="text-sm sm:text-base text-white/90 mb-5 font-medium">
                {RESTAURANT_INFO.subSlogan}
              </p>

              <div className="flex items-center gap-3 w-full justify-center">
                <button
                  id="btn-hero-order-now"
                  onClick={() => onNavigateToMenu()}
                  className="bg-[#F28C18] hover:bg-[#E07D10] text-white px-8 py-3 rounded-full font-bold text-base hover:opacity-95 active:scale-95 transition-all shadow-lg flex items-center gap-2 cursor-pointer"
                >
                  <span>اطلب الآن</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <a
                  href={`tel:${RESTAURANT_INFO.hotline}`}
                  className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-3 rounded-full font-bold text-sm backdrop-blur-md active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <PhoneCall className="w-4 h-4 text-[#F28C18]" />
                  <span>{RESTAURANT_INFO.hotline}</span>
                </a>
              </div>
            </div>
          </div>

          {/* Quick Notice / Delivery Info Pill Bar */}
          <div className="bg-[#FFFFFF] rounded-2xl p-3.5 border border-[#E5E2DC] flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#F28C18]/15 flex items-center justify-center text-[#F28C18]">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#1C1C18]">أم درمان - المهندسين</p>
                <p className="text-[11px] text-[#887363]">بجوار طرمبة النيل وسلاح المهندسين</p>
              </div>
            </div>

            <button
              onClick={onNavigateToContact}
              className="text-xs font-bold text-[#F28C18] hover:underline cursor-pointer"
            >
              تفاصيل الفرع
            </button>
          </div>

          {/* Popular Section ("الأكثر طلباً 🔥") if popular items exist */}
          {popularItems.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-xl sm:text-2xl font-bold text-[#1C1C18]">الأكثر طلباً</h2>
                  <span className="text-xl">🔥</span>
                </div>
                <button
                  onClick={() => onNavigateToMenu()}
                  className="text-xs sm:text-sm font-bold text-[#F28C18] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>عرض الكل</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Horizontal Carousel */}
              <div className="flex overflow-x-auto no-scrollbar gap-4 pb-2 snap-x">
                {popularItems.map((item) => {
                  const isFav = favorites.includes(item.id);
                  const isAvailable = item.isAvailable !== false;
                  return (
                    <div
                      key={item.id}
                      onClick={() => isAvailable && onSelectItem(item)}
                      className={`min-w-[260px] max-w-[280px] bg-[#FFFFFF] rounded-[24px] shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col snap-start border border-[#E5E2DC] group flex-shrink-0 ${
                        isAvailable ? 'cursor-pointer' : 'opacity-70 cursor-not-allowed'
                      }`}
                    >
                      <div className="h-44 relative bg-[#E5E2DC] overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.name}
                          className={`w-full h-full object-cover transition-transform duration-300 ${
                            isAvailable ? 'group-hover:scale-105' : 'grayscale'
                          }`}
                          referrerPolicy="no-referrer"
                        />
                        {/* Favorite Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite(item.id);
                          }}
                          className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full text-[#1C1C18] shadow-sm hover:text-[#F28C18] transition-colors cursor-pointer"
                          aria-label="إضافة للمفضلة"
                        >
                          <Heart
                            className={`w-4 h-4 ${
                              isFav ? 'fill-[#F28C18] text-[#F28C18]' : 'text-[#1C1C18]'
                            }`}
                          />
                        </button>

                        {item.badge && isAvailable && (
                          <span className="absolute bottom-3 right-3 bg-[#F28C18] text-white text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-sm">
                            {item.badge}
                          </span>
                        )}

                        {!isAvailable && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <span className="bg-red-600 text-white font-black text-xs px-3 py-1 rounded-full">
                              غير متوفر حالياً
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="p-4 flex flex-col flex-1 justify-between">
                        <div>
                          <h3 className="font-bold text-base text-[#1C1C18] mb-1">{item.name}</h3>
                          <p className="text-xs text-[#554335] line-clamp-2 leading-relaxed mb-3">
                            {item.description}
                          </p>
                        </div>

                        <div className="mt-auto flex justify-between items-center pt-2 border-t border-[#F0EEE8]">
                          <span className="font-black text-lg text-[#F28C18]">
                            {formatPrice(item.price)}
                          </span>
                          {isAvailable ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onQuickAddToCart(item);
                              }}
                              className="bg-[#111111] hover:bg-[#F28C18] text-white w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition-all shadow-xs cursor-pointer"
                              aria-label="إضافة للسلة"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          ) : (
                            <span className="text-[11px] font-bold text-red-600">غير متاح</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Dynamic Categories Grid directly from DB */}
          {exploreCategories.length > 0 && (
            <div className="space-y-3 pt-2">
              <h2 className="text-xl font-bold text-[#1C1C18] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#F28C18]" />
                <span>أقسام قائمة الطعام</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {exploreCategories.map((cat, idx) => {
                  const gradientColors = [
                    'from-[#1C1C18] to-[#31312D]',
                    'from-[#F28C18] to-[#D97706]',
                    'from-[#31312D] to-[#1C1C18]',
                    'from-[#B45309] to-[#78350F]',
                  ];
                  const bgGradient = gradientColors[idx % gradientColors.length];

                  return (
                    <div
                      key={cat.id}
                      onClick={() => onNavigateToMenu(cat.id)}
                      className={`bg-gradient-to-br ${bgGradient} text-white rounded-2xl p-5 relative overflow-hidden cursor-pointer hover:shadow-lg transition-all group`}
                    >
                      <div className="relative z-10 max-w-[65%]">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#F28C18] bg-white/10 px-2.5 py-1 rounded-full inline-block mb-2">
                          {cat.dishCount} {cat.dishCount === 1 ? 'وجبة' : 'وجبات'}
                        </span>
                        <h3 className="text-lg font-bold mb-1">{cat.name}</h3>
                        <p className="text-xs text-white/80 mb-3">{cat.nameEn || 'قائمة طازجة'}</p>
                        <span className="text-xs font-bold text-[#F28C18] group-hover:underline inline-flex items-center gap-1">
                          تصفح القسم <ArrowLeft className="w-3 h-3" />
                        </span>
                      </div>
                      <img
                        src={cat.sampleImage}
                        alt={cat.name}
                        className="absolute -bottom-4 -left-4 w-28 h-28 object-cover rounded-full group-hover:scale-110 transition-transform shadow-md"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {menuItems.length === 0 && (
            <div className="bg-[#FFFFFF] rounded-2xl p-8 text-center space-y-3 border border-[#E5E2DC]">
              <UtensilsCrossed className="w-12 h-12 text-[#F28C18] mx-auto opacity-80" />
              <p className="text-base font-bold text-[#1C1C18]">قائمة الطعام فارغة حالياً في قاعدة البيانات</p>
              <p className="text-xs text-[#887363]">
                يمكنك إضافة الأصناف والتصنيفات أو تشغيل كود الـ SQL عبر لوحة التحكم الإدارية.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};
