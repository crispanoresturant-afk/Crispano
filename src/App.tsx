import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { FloatingCartBar } from './components/FloatingCartBar';
import { HomeScreen } from './components/HomeScreen';
import { MenuScreen } from './components/MenuScreen';
import { CheckoutScreen } from './components/CheckoutScreen';
import { ContactScreen } from './components/ContactScreen';
import { ProductDetailModal } from './components/ProductDetailModal';
import { DrawerMenu } from './components/DrawerMenu';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { AdminPanel } from './components/AdminPanel';
import { ActiveTab, CartItem, CategoryId, MenuItem, Category, Order } from './types';
import { RESTAURANT_INFO } from './data/menuData';
import { fetchCategoriesFromDb, fetchDishesFromDb } from './utils/supabaseService';
import { Loader2 } from 'lucide-react';

export default function App() {
  // Check if current URL is /admin or #admin
  const checkIsAdminPath = () => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    return path === '/admin' || path.endsWith('/admin') || hash === '#admin' || hash.includes('admin');
  };

  const [activeTab, setActiveTab] = useState<ActiveTab>(() => (checkIsAdminPath() ? 'admin' : 'home'));
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('all');
  const [selectedItemForModal, setSelectedItemForModal] = useState<MenuItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Dynamic Data from Supabase Database
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Function to load all data from Supabase
  const loadDatabaseData = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const [catsRes, dishesRes] = await Promise.all([
        fetchCategoriesFromDb(),
        fetchDishesFromDb(),
      ]);

      if (catsRes.data) {
        setCategories(catsRes.data);
      }
      if (dishesRes.data) {
        setMenuItems(dishesRes.data);
      }
    } catch (err) {
      console.error('Error loading database data:', err);
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadDatabaseData();
  }, [loadDatabaseData]);

  // Sync URL with activeTab for /admin link requirement
  useEffect(() => {
    const handlePopState = () => {
      if (checkIsAdminPath()) {
        setActiveTab('admin');
      } else {
        setActiveTab((prev) => (prev === 'admin' ? 'home' : prev));
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (tab === 'admin') {
      if (window.location.pathname !== '/admin') {
        window.history.pushState(null, '', '/admin');
      }
    } else {
      if (window.location.pathname === '/admin') {
        window.history.pushState(null, '', '/');
      }
    }
  };

  // Persistent cart from localStorage
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('crispano_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persistent favorites from localStorage
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('crispano_favs');
      return saved ? JSON.parse(saved) : ['pizza-crispano', 'burger-double-cheese'];
    } catch {
      return ['pizza-crispano', 'burger-double-cheese'];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('crispano_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error('Error saving cart', e);
    }
  }, [cartItems]);

  useEffect(() => {
    try {
      localStorage.setItem('crispano_favs', JSON.stringify(favorites));
    } catch (e) {
      console.error('Error saving favorites', e);
    }
  }, [favorites]);

  // Cart total items & price
  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalCartAmount = cartItems.reduce((sum, item) => sum + item.itemTotal, 0);

  // Add customized item to cart
  const handleAddToCart = (
    item: MenuItem,
    quantity: number,
    selectedOptions: string[],
    specialInstructions: string,
    itemTotal: number
  ) => {
    const cartItemId = `${item.id}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newCartItem: CartItem = {
      cartItemId,
      menuItem: item,
      quantity,
      selectedOptions,
      specialInstructions,
      itemTotal,
    };
    setCartItems((prev) => [...prev, newCartItem]);
  };

  // Quick add single item
  const handleQuickAddToCart = (item: MenuItem) => {
    if (item.isAvailable === false) return;

    // If item has options, open modal for better customization; otherwise add directly
    if (item.options && item.options.length > 0) {
      setSelectedItemForModal(item);
    } else {
      const cartItemId = `${item.id}-${Date.now()}`;
      const newCartItem: CartItem = {
        cartItemId,
        menuItem: item,
        quantity: 1,
        selectedOptions: [],
        specialInstructions: '',
        itemTotal: item.price,
      };
      setCartItems((prev) => [...prev, newCartItem]);
    }
  };

  // Update item quantity in cart
  const handleUpdateQuantity = (cartItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveCartItem(cartItemId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.cartItemId === cartItemId) {
          const unitPrice = item.itemTotal / item.quantity;
          return {
            ...item,
            quantity: newQuantity,
            itemTotal: unitPrice * newQuantity,
          };
        }
        return item;
      })
    );
  };

  // Remove single item
  const handleRemoveCartItem = (cartItemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  // Clear all
  const handleClearCart = () => {
    setCartItems([]);
  };

  // Toggle favorite item
  const handleToggleFavorite = (itemId: string) => {
    setFavorites((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  // Order completion handler
  const handleOrderCompleted = (order: Order) => {
    setCompletedOrder(order);
    handleClearCart();
  };

  // If viewing admin panel, show full admin experience
  if (activeTab === 'admin') {
    return (
      <AdminPanel
        onBackToApp={() => {
          handleTabChange('home');
        }}
        onDataUpdated={loadDatabaseData}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F5EF] text-[#1C1C18] flex flex-col font-['Cairo',sans-serif] selection:bg-[#F28C18] selection:text-white">
      {/* Top App Bar */}
      <Header
        cartCount={totalCartCount}
        onOpenDrawer={() => setIsDrawerOpen(true)}
        onOpenCart={() => handleTabChange('cart')}
        onNavigateHome={() => handleTabChange('home')}
      />

      {/* Main Views Container */}
      <main className="flex-grow pt-20">
        {isLoadingData && menuItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#F28C18]" />
            <p className="text-sm font-bold text-[#887363]">جاري تحميل قائمة الطعام من قاعدة البيانات...</p>
          </div>
        ) : (
          <>
            {activeTab === 'home' && (
              <HomeScreen
                categories={categories}
                menuItems={menuItems}
                onSelectItem={(item) => setSelectedItemForModal(item)}
                onNavigateToMenu={(cat) => {
                  if (cat) setSelectedCategory(cat);
                  handleTabChange('menu');
                }}
                onNavigateToContact={() => handleTabChange('contact')}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
                onQuickAddToCart={handleQuickAddToCart}
              />
            )}

            {activeTab === 'menu' && (
              <MenuScreen
                categories={categories}
                menuItems={menuItems}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                onSelectItem={(item) => setSelectedItemForModal(item)}
                onQuickAddToCart={handleQuickAddToCart}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
              />
            )}

            {activeTab === 'cart' && (
              <CheckoutScreen
                cartItems={cartItems}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveCartItem}
                onClearCart={handleClearCart}
                onBackToMenu={() => handleTabChange('menu')}
                onOrderCompleted={handleOrderCompleted}
              />
            )}

            {activeTab === 'contact' && <ContactScreen />}
          </>
        )}
      </main>

      {/* Persistent Floating Cart Button (visible on Home and Menu when cart not empty) */}
      {activeTab !== 'cart' && (
        <FloatingCartBar
          itemCount={totalCartCount}
          totalAmount={totalCartAmount}
          onClick={() => handleTabChange('cart')}
        />
      )}

      {/* Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        cartCount={totalCartCount}
      />

      {/* Product Customization Bottom Sheet / Modal */}
      <ProductDetailModal
        item={selectedItemForModal}
        isOpen={!!selectedItemForModal}
        onClose={() => setSelectedItemForModal(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Slide-out Navigation Drawer */}
      <DrawerMenu
        categories={categories}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onNavigateTab={(tab) => handleTabChange(tab)}
        onSelectCategory={(cat) => setSelectedCategory(cat)}
        favoritesCount={favorites.length}
      />

      {/* Order Success Confirmation Modal */}
      <OrderSuccessModal
        order={completedOrder}
        isOpen={!!completedOrder}
        onClose={() => setCompletedOrder(null)}
      />
    </div>
  );
}

