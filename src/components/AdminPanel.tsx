import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  Lock,
  User,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Upload,
  Database,
  Copy,
  Check,
  RefreshCw,
  Eye,
  EyeOff,
  Flame,
  Search,
  Sparkles,
  ArrowRight,
  LogOut,
  SlidersHorizontal,
  Info,
  Clock,
  Layers,
  Image as ImageIcon,
  Tag,
  AlertCircle
} from 'lucide-react';
import { Category, MenuItem, CustomizationOption } from '../types';
import { formatPrice } from '../utils/formatters';
import { RESTAURANT_INFO } from '../data/menuData';
import {
  fetchCategoriesFromDb,
  fetchDishesFromDb,
  upsertDishToDb,
  deleteDishFromDb,
  toggleDishAvailabilityInDb,
  upsertCategoryToDb,
  deleteCategoryFromDb,
  uploadPhotoToBucket,
} from '../utils/supabaseService';
import { SUPABASE_SQL_SCHEMA_AND_SEED } from '../utils/sqlQueries';

interface AdminPanelProps {
  onBackToStore?: () => void;
  onBackToApp?: () => void;
  onRefreshData?: () => void;
  onDataUpdated?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  onBackToStore,
  onBackToApp,
  onRefreshData,
  onDataUpdated,
}) => {
  const handleBackToStore = () => {
    if (onBackToApp) onBackToApp();
    else if (onBackToStore) onBackToStore();
  };

  const handleNotifyRefresh = () => {
    if (onDataUpdated) onDataUpdated();
    if (onRefreshData) onRefreshData();
  };
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('crispano_admin_auth') === 'true';
  });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Active Admin Tab
  const [adminTab, setAdminTab] = useState<'dishes' | 'categories' | 'sql' | 'upload'>('dishes');

  // DB Data
  const [dishes, setDishes] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');

  // Feedback notifications
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  // Edit/Create Dish Modal
  const [isDishModalOpen, setIsDishModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<MenuItem | null>(null);
  const [dishFormData, setDishFormData] = useState<Partial<MenuItem>>({
    id: '',
    name: '',
    nameEn: '',
    description: '',
    price: 1000,
    category: 'pizza',
    image: '',
    isPopular: false,
    isOffer: false,
    isAvailable: true,
    badge: '',
    prepTimeMinutes: 15,
    ingredients: [],
    options: [],
  });
  const [newIngredientInput, setNewIngredientInput] = useState('');
  const [newOptionName, setNewOptionName] = useState('');
  const [newOptionPrice, setNewOptionPrice] = useState<number>(0);
  const [newOptionType, setNewOptionType] = useState<'extra' | 'exclude'>('extra');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit/Create Category Modal
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryFormData, setCategoryFormData] = useState<Partial<Category>>({
    id: '',
    name: '',
    nameEn: '',
    icon: 'Sparkles',
    sortOrder: 0,
  });

  // Load Data
  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const [catsRes, dishesRes] = await Promise.all([
        fetchCategoriesFromDb(),
        fetchDishesFromDb(),
      ]);
      setCategories(catsRes.data);
      setDishes(dishesRes.data);
      if (catsRes.error || dishesRes.error) {
        showToast('info', 'تم جلب البيانات (تأكد من تطبيق كود SQL في Supabase للربط الكامل)');
      }
    } catch (e) {
      console.error(e);
      showToast('error', 'حدث خطأ أثناء تحميل البيانات من Supabase');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadAdminData();
    }
  }, [isAuthenticated]);

  const showToast = (type: 'success' | 'error' | 'info', text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 5000);
  };

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() === 'crispano123' && password.trim() === 'admin123') {
      sessionStorage.setItem('crispano_admin_auth', 'true');
      setIsAuthenticated(true);
      setAuthError('');
      showToast('success', 'مرحباً بك في لوحة تحكم مطعم كرسبانو');
    } else {
      setAuthError('اسم المستخدم أو كلمة المرور غير صحيحة');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('crispano_admin_auth');
    setIsAuthenticated(false);
  };

  // Toggle dish availability
  const handleToggleAvailability = async (dish: MenuItem) => {
    const newStatus = dish.isAvailable === false ? true : false;
    // Optimistic UI update
    setDishes((prev) =>
      prev.map((d) => (d.id === dish.id ? { ...d, isAvailable: newStatus } : d))
    );

    const res = await toggleDishAvailabilityInDb(dish.id, newStatus);
    if (res.success) {
      showToast(
        'success',
        `تم تغيير حالة "${dish.name}" إلى: ${newStatus ? 'متوفر للزبائن ✅' : 'غير متوفر حالياً ❌'}`
      );
      handleNotifyRefresh();
    } else {
      showToast('error', 'تعذر تحديث الحالة في قاعدة البيانات. يرجى مراجعة إعدادات Supabase');
    }
  };

  // Open Dish Modal for Create
  const handleOpenCreateDish = () => {
    const newId = `dish-${Date.now()}`;
    const defaultCat = categories.length > 0 && categories[0].id !== 'all' ? categories[0].id : 'pizza';
    setEditingDish(null);
    setDishFormData({
      id: newId,
      name: '',
      nameEn: '',
      description: '',
      price: 5000,
      category: defaultCat,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB-0qaS87wO5vBnoXgPw59xtrxVzhIHjhJBUK_6-Eszlim8rG613qVWWNqSHOj37XdCzKjhu_ltCT9q8jDdYeDRrBtTqD0WW191vizwLhS4LYEPDfkKawTJr_CmGSVywcraXYlVfCG_feWLHPwn55Vla8ONLCLHQAVnCf6WWDGwb69SMVrWzcreN_AcFTWwtza3691x8knPN9OXGDY4sHpKpbq1YArhBax1Rhp01LgG6TvpRvr5hbKlwA',
      isPopular: false,
      isOffer: false,
      isAvailable: true,
      badge: '',
      prepTimeMinutes: 15,
      ingredients: ['مكونات طازجة'],
      options: [
        { id: 'extra-cheese', name: 'إضافة جبنة موتزاريلا (+800 ج.س)', price: 800, type: 'extra' },
        { id: 'no-onion', name: 'بدون بصل', price: 0, type: 'exclude' },
      ],
    });
    setIsDishModalOpen(true);
  };

  // Open Dish Modal for Edit
  const handleOpenEditDish = (dish: MenuItem) => {
    setEditingDish(dish);
    setDishFormData({ ...dish });
    setIsDishModalOpen(true);
  };

  // Save Dish
  const handleSaveDish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dishFormData.name || !dishFormData.price || !dishFormData.category) {
      showToast('error', 'يرجى ملء جميع الحقول الأساسية (الاسم، السعر، القسم)');
      return;
    }

    const dishToSave: MenuItem = {
      id: dishFormData.id || `dish-${Date.now()}`,
      name: dishFormData.name || '',
      nameEn: dishFormData.nameEn || dishFormData.name || '',
      description: dishFormData.description || '',
      price: Number(dishFormData.price) || 0,
      category: dishFormData.category || 'pizza',
      image: dishFormData.image || '',
      heroImage: dishFormData.heroImage,
      isPopular: Boolean(dishFormData.isPopular),
      isOffer: Boolean(dishFormData.isOffer),
      isAvailable: dishFormData.isAvailable !== false,
      discountPrice: dishFormData.discountPrice ? Number(dishFormData.discountPrice) : undefined,
      badge: dishFormData.badge || undefined,
      prepTimeMinutes: Number(dishFormData.prepTimeMinutes) || 15,
      ingredients: dishFormData.ingredients || [],
      options: dishFormData.options || [],
    };

    setIsLoading(true);
    const res = await upsertDishToDb(dishToSave);
    setIsLoading(false);

    if (res.success) {
      showToast('success', `تم حفظ الوجبة "${dishToSave.name}" بنجاح في Supabase!`);
      setIsDishModalOpen(false);
      loadAdminData();
      handleNotifyRefresh();
    } else {
      showToast('error', 'فشل الحفظ في Supabase. تأكد من تشغيل كود SQL وإنشاء جدول dishes');
    }
  };

  // Delete Dish
  const handleDeleteDish = async (dish: MenuItem) => {
    if (!window.confirm(`هل أنت متأكد من حذف الوجبة "${dish.name}" نهائياً من قاعدة البيانات؟`)) {
      return;
    }
    setIsLoading(true);
    const res = await deleteDishFromDb(dish.id);
    setIsLoading(false);

    if (res.success) {
      showToast('success', `تم حذف "${dish.name}" بنجاح`);
      loadAdminData();
      handleNotifyRefresh();
    } else {
      showToast('error', 'تعذر حذف الوجبة من Supabase');
    }
  };

  // Image Upload to Supabase Bucket 'photos'
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    showToast('info', 'جاري رفع الصورة إلى Supabase Storage (Bucket: photos)...');

    const { publicUrl, error } = await uploadPhotoToBucket(file, 'dishes');
    setIsUploadingImage(false);

    if (publicUrl) {
      setDishFormData((prev) => ({ ...prev, image: publicUrl }));
      showToast('success', 'تم رفع الصورة بنجاح وتحديث الرابط!');
    } else {
      showToast(
        'error',
        `فشل رفع الصورة: ${error?.message || 'تأكد من إنشاء bucket باسم "photos" بصلاحية عامة Public'}`
      );
    }
  };

  // Ingredient Helpers
  const handleAddIngredient = () => {
    if (!newIngredientInput.trim()) return;
    setDishFormData((prev) => ({
      ...prev,
      ingredients: [...(prev.ingredients || []), newIngredientInput.trim()],
    }));
    setNewIngredientInput('');
  };

  const handleRemoveIngredient = (index: number) => {
    setDishFormData((prev) => ({
      ...prev,
      ingredients: (prev.ingredients || []).filter((_, i) => i !== index),
    }));
  };

  // Option Helpers
  const handleAddOption = () => {
    if (!newOptionName.trim()) return;
    const newOpt: CustomizationOption = {
      id: `opt-${Date.now()}`,
      name: newOptionName.trim(),
      price: Number(newOptionPrice) || 0,
      type: newOptionType,
    };
    setDishFormData((prev) => ({
      ...prev,
      options: [...(prev.options || []), newOpt],
    }));
    setNewOptionName('');
    setNewOptionPrice(0);
  };

  const handleRemoveOption = (optId: string) => {
    setDishFormData((prev) => ({
      ...prev,
      options: (prev.options || []).filter((o) => o.id !== optId),
    }));
  };

  // Category Actions
  const handleOpenCreateCategory = () => {
    setEditingCategory(null);
    setCategoryFormData({
      id: `cat-${Date.now().toString(36)}`,
      name: '',
      nameEn: '',
      icon: 'Sparkles',
      sortOrder: categories.length,
    });
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setCategoryFormData({ ...cat });
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryFormData.name || !categoryFormData.id) {
      showToast('error', 'يرجى كتابة اسم ومعرف القسم');
      return;
    }

    const catToSave: Category = {
      id: categoryFormData.id,
      name: categoryFormData.name,
      nameEn: categoryFormData.nameEn || categoryFormData.name,
      icon: categoryFormData.icon || 'Sparkles',
      sortOrder: Number(categoryFormData.sortOrder) || 0,
    };

    setIsLoading(true);
    const res = await upsertCategoryToDb(catToSave);
    setIsLoading(false);

    if (res.success) {
      showToast('success', `تم حفظ القسم "${catToSave.name}" بنجاح!`);
      setIsCategoryModalOpen(false);
      loadAdminData();
      handleNotifyRefresh();
    } else {
      showToast('error', 'فشل حفظ القسم في Supabase');
    }
  };

  const handleDeleteCategory = async (cat: Category) => {
    if (cat.id === 'all') {
      alert('لا يمكن حذف قسم "الكل" الأساسي');
      return;
    }
    if (!window.confirm(`هل أنت متأكد من حذف القسم "${cat.name}"؟`)) {
      return;
    }
    setIsLoading(true);
    const res = await deleteCategoryFromDb(cat.id);
    setIsLoading(false);

    if (res.success) {
      showToast('success', `تم حذف القسم "${cat.name}" بنجاح`);
      loadAdminData();
      handleNotifyRefresh();
    } else {
      showToast('error', 'تعذر حذف القسم');
    }
  };

  // Copy SQL
  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA_AND_SEED);
    setCopiedSql(true);
    showToast('success', 'تم نسخ كود SQL بالكامل! الصقه في Supabase SQL Editor');
    setTimeout(() => setCopiedSql(false), 3000);
  };

  // Seed guidance / Copy SQL
  const handleOneClickSeed = async () => {
    handleCopySql();
    showToast(
      'info',
      'تم نسخ كود الـ SQL إلى الحافظة! الصقه في Supabase SQL Editor لإنشاء الجداول وإدراج البيانات فوراً.'
    );
  };

  // Filtered dishes
  const filteredDishes = dishes.filter((dish) => {
    const matchesCategory =
      selectedCategoryFilter === 'all' || dish.category === selectedCategoryFilter;
    const matchesSearch =
      dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dish.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dish.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // If Not Authenticated -> Show Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F8F5EF] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#FFFFFF] rounded-[28px] p-7 sm:p-8 shadow-2xl border border-[#E5E2DC] space-y-6 animate-in zoom-in-95">
          {/* Logo & Header */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-[#111111] text-[#F28C18] rounded-2xl mx-auto flex items-center justify-center shadow-lg border border-[#333333]">
              <ShieldCheck className="w-9 h-9" />
            </div>
            <h1 className="text-2xl font-black text-[#1C1C18]">لوحة تحكم كرسبانو</h1>
            <p className="text-xs sm:text-sm text-[#554335]">
              تسجيل الدخول لإدارة الوجبات، الأقسام، الصور وحالة التوفر
            </p>
          </div>

          {/* Error message */}
          {authError && (
            <div className="p-3.5 bg-red-50 text-red-700 text-xs sm:text-sm rounded-xl flex items-center gap-2 border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#1C1C18]">اسم المستخدم (Username)</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[#887363]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="crispano123"
                  className="w-full pr-10 pl-3 py-3 bg-[#F8F5EF] border border-[#E5E2DC] rounded-xl text-sm font-semibold focus:outline-hidden focus:border-[#F28C18] focus:ring-1 focus:ring-[#F28C18]"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#1C1C18]">كلمة المرور (Password)</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[#887363]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pr-10 pl-3 py-3 bg-[#F8F5EF] border border-[#E5E2DC] rounded-xl text-sm font-semibold focus:outline-hidden focus:border-[#F28C18] focus:ring-1 focus:ring-[#F28C18]"
                  required
                />
              </div>
            </div>

            <div className="p-3 bg-[#F8F5EF] rounded-xl border border-[#E5E2DC] text-[11px] text-[#554335] space-y-1">
              <p className="font-bold text-[#1C1C18]">بيانات الدخول المعتمدة:</p>
              <p>المستخدم: <code className="text-[#F28C18] font-bold">crispano123</code></p>
              <p>كلمة المرور: <code className="text-[#F28C18] font-bold">admin123</code></p>
            </div>

            <button
              type="submit"
              className="w-full bg-[#111111] hover:bg-[#252520] text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-[#F28C18]" />
              <span>دخول لوحة التحكم</span>
            </button>
          </form>

          <button
            onClick={handleBackToStore}
            className="w-full text-xs font-bold text-[#887363] hover:text-[#1C1C18] py-1 text-center flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>العودة لمتجر وقائمة كرسبانو</span>
          </button>
        </div>
      </div>
    );
  }

  // Authenticated Admin Dashboard
  return (
    <div className="min-h-screen bg-[#F4F1EA] text-[#1C1C18] pb-24">
      {/* Admin Top Navigation */}
      <header className="bg-[#111111] text-white sticky top-0 z-40 shadow-lg border-b border-[#333333]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#F28C18] text-[#111111] rounded-xl flex items-center justify-center font-black text-xl shadow-inner">
              C
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base text-white tracking-wide">لوحة تحكم كرسبانو</span>
                <span className="bg-[#25D366]/20 text-[#25D366] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#25D366]/30">
                  Supabase Live ⚡
                </span>
              </div>
              <p className="text-[11px] text-[#A89F91]">إدارة الوجبات، الأقسام وقاعدة البيانات</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handleBackToStore}
              className="bg-[#222222] hover:bg-[#333333] text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors border border-[#444444] cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-[#F28C18]" />
              <span className="hidden sm:inline">معاينة كزبون</span>
            </button>

            <button
              onClick={handleLogout}
              className="bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors border border-red-500/20 cursor-pointer"
              title="تسجيل الخروج"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">خروج</span>
            </button>
          </div>
        </div>

        {/* Admin Subtabs Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto gap-2 py-2 border-t border-[#222222] scrollbar-none">
          <button
            onClick={() => setAdminTab('dishes')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
              adminTab === 'dishes'
                ? 'bg-[#F28C18] text-[#111111] shadow-md'
                : 'text-[#E5E2DC] hover:bg-[#222222]'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>الوجبات والأصناف ({dishes.length})</span>
          </button>

          <button
            onClick={() => setAdminTab('categories')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
              adminTab === 'categories'
                ? 'bg-[#F28C18] text-[#111111] shadow-md'
                : 'text-[#E5E2DC] hover:bg-[#222222]'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>أقسام المنيو ({categories.length})</span>
          </button>

          <button
            onClick={() => setAdminTab('sql')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
              adminTab === 'sql'
                ? 'bg-[#F28C18] text-[#111111] shadow-md'
                : 'text-[#E5E2DC] hover:bg-[#222222]'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>كود SQL & ربط Supabase 🚀</span>
          </button>

          <button
            onClick={() => setAdminTab('upload')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
              adminTab === 'upload'
                ? 'bg-[#F28C18] text-[#111111] shadow-md'
                : 'text-[#E5E2DC] hover:bg-[#222222]'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>مركز رفع الصور (Bucket: photos)</span>
          </button>
        </div>
      </header>

      {/* Floating Status Toast */}
      {statusMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div
            className={`px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs sm:text-sm font-bold border ${
              statusMessage.type === 'success'
                ? 'bg-[#111111] text-[#25D366] border-[#25D366]/40'
                : statusMessage.type === 'error'
                ? 'bg-red-900 text-white border-red-700'
                : 'bg-[#111111] text-[#F28C18] border-[#F28C18]/40'
            }`}
          >
            {statusMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-[#25D366]" />}
            {statusMessage.type === 'error' && <AlertCircle className="w-4 h-4 text-red-400" />}
            {statusMessage.type === 'info' && <Info className="w-4 h-4 text-[#F28C18]" />}
            <span>{statusMessage.text}</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* ========================================================================= */}
        {/* TAB 1: DISHES MANAGEMENT */}
        {/* ========================================================================= */}
        {adminTab === 'dishes' && (
          <div className="space-y-6">
            {/* Action Bar & Stats */}
            <div className="bg-[#FFFFFF] p-4 sm:p-5 rounded-2xl border border-[#E5E2DC] shadow-xs flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
              <div>
                <h2 className="text-xl font-black text-[#1C1C18] flex items-center gap-2">
                  <span>إدارة الوجبات والأصناف</span>
                  <span className="text-xs bg-[#F8F5EF] text-[#554335] px-2.5 py-0.5 rounded-full border border-[#E5E2DC]">
                    {dishes.length} وجبة
                  </span>
                </h2>
                <p className="text-xs text-[#554335] mt-0.5">
                  تحكم في أسعار الوجبات، الصور، التوفر للزبائن، وتفاصيل المكونات والإضافات
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={loadAdminData}
                  disabled={isLoading}
                  className="p-2.5 bg-[#F8F5EF] hover:bg-[#EAE6DE] text-[#1C1C18] rounded-xl border border-[#E5E2DC] transition-colors cursor-pointer"
                  title="تحديث البيانات من Supabase"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#F28C18]' : ''}`} />
                </button>

                <button
                  onClick={handleOpenCreateDish}
                  className="bg-[#F28C18] hover:bg-[#d97706] text-[#111111] px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-all active:scale-98 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة وجبة جديدة</span>
                </button>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[#887363]">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="بحث عن وجبة بالاسم أو الوصف..."
                  className="w-full pr-10 pl-4 py-2.5 bg-[#FFFFFF] border border-[#E5E2DC] rounded-xl text-xs sm:text-sm font-semibold focus:outline-hidden focus:border-[#F28C18]"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                <button
                  onClick={() => setSelectedCategoryFilter('all')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    selectedCategoryFilter === 'all'
                      ? 'bg-[#111111] text-white'
                      : 'bg-[#FFFFFF] text-[#554335] border border-[#E5E2DC]'
                  }`}
                >
                  الكل ({dishes.length})
                </button>
                {categories
                  .filter((c) => c.id !== 'all')
                  .map((cat) => {
                    const count = dishes.filter((d) => d.category === cat.id).length;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategoryFilter(cat.id)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                          selectedCategoryFilter === cat.id
                            ? 'bg-[#111111] text-white'
                            : 'bg-[#FFFFFF] text-[#554335] border border-[#E5E2DC]'
                        }`}
                      >
                        {cat.name} ({count})
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* Dish Cards Grid */}
            {filteredDishes.length === 0 ? (
              <div className="bg-[#FFFFFF] rounded-2xl p-12 text-center border border-[#E5E2DC] space-y-3">
                <div className="w-14 h-14 bg-[#F8F5EF] rounded-full mx-auto flex items-center justify-center text-[#887363]">
                  <Sparkles className="w-7 h-7" />
                </div>
                <h3 className="text-base font-black text-[#1C1C18]">لا توجد وجبات تطابق البحث</h3>
                <p className="text-xs text-[#554335]">
                  يمكنك إضافة وجبة جديدة أو تصفير فلتر البحث
                </p>
                <button
                  onClick={handleOpenCreateDish}
                  className="bg-[#111111] text-white px-4 py-2 rounded-xl font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-[#F28C18]" />
                  <span>إضافة وجبة الآن</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDishes.map((dish) => {
                  const isAvailable = dish.isAvailable !== false;
                  const categoryName =
                    categories.find((c) => c.id === dish.category)?.name || dish.category;

                  return (
                    <div
                      key={dish.id}
                      className={`bg-[#FFFFFF] rounded-2xl border transition-all overflow-hidden flex flex-col justify-between ${
                        isAvailable
                          ? 'border-[#E5E2DC] hover:border-[#F28C18]/40 shadow-xs'
                          : 'border-red-200 bg-red-50/20 opacity-80'
                      }`}
                    >
                      {/* Card Header & Image */}
                      <div>
                        <div className="relative h-44 bg-[#F0EEE8] overflow-hidden group">
                          <img
                            src={dish.image}
                            alt={dish.name}
                            className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                              !isAvailable ? 'grayscale' : ''
                            }`}
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.target as HTMLElement).setAttribute(
                                'src',
                                'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600'
                              );
                            }}
                          />

                          {/* Category Badge */}
                          <div className="absolute top-3 right-3 bg-[#111111]/85 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
                            {categoryName}
                          </div>

                          {/* Popular / Promo Badge */}
                          {dish.badge && (
                            <div className="absolute top-3 left-3 bg-[#F28C18] text-[#111111] text-[10px] font-black px-2 py-1 rounded-full shadow-xs">
                              {dish.badge}
                            </div>
                          )}

                          {/* Availability Overlay Banner */}
                          {!isAvailable && (
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
                              <span className="bg-red-600 text-white font-black text-xs px-3.5 py-1.5 rounded-full shadow-lg">
                                🚫 غير متوفر حالياً للزبائن
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="p-4 space-y-2">
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <h3 className="font-black text-base text-[#1C1C18] leading-tight">
                                {dish.name}
                              </h3>
                              <p className="text-[11px] text-[#887363] font-semibold">{dish.nameEn}</p>
                            </div>
                            <div className="text-left shrink-0">
                              <div className="font-black text-[#F28C18] text-base">
                                {formatPrice(dish.price)}
                              </div>
                              {dish.discountPrice && (
                                <div className="text-[11px] line-through text-[#887363]">
                                  {formatPrice(dish.discountPrice)}
                                </div>
                              )}
                            </div>
                          </div>

                          <p className="text-xs text-[#554335] line-clamp-2 leading-relaxed">
                            {dish.description}
                          </p>

                          {/* Options Count & Prep Time */}
                          <div className="flex items-center gap-3 pt-2 text-[11px] text-[#887363] border-t border-[#F0EEE8]">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-[#F28C18]" />
                              <span>{dish.prepTimeMinutes || 15} دقيقة</span>
                            </span>
                            <span>•</span>
                            <span>{dish.options?.length || 0} خيارات إضافية</span>
                          </div>
                        </div>
                      </div>

                      {/* Card Footer: Quick Actions */}
                      <div className="p-3 bg-[#F8F5EF] border-t border-[#E5E2DC] flex items-center justify-between gap-2">
                        {/* Toggle Availability Switch */}
                        <button
                          onClick={() => handleToggleAvailability(dish)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isAvailable
                              ? 'bg-[#25D366]/15 text-[#1b8c45] hover:bg-[#25D366]/25'
                              : 'bg-red-100 text-red-700 hover:bg-red-200'
                          }`}
                          title="تبديل توفر الوجبة للزبائن"
                        >
                          {isAvailable ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#25D366]" />
                              <span>متوفر</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5 text-red-600" />
                              <span>غير متوفر</span>
                            </>
                          )}
                        </button>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenEditDish(dish)}
                            className="p-2 bg-[#FFFFFF] hover:bg-[#EAE6DE] text-[#1C1C18] rounded-xl border border-[#E5E2DC] transition-colors cursor-pointer"
                            title="تعديل الوجبة والصورة"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteDish(dish)}
                            className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl border border-red-200 transition-colors cursor-pointer"
                            title="حذف الوجبة"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: CATEGORIES MANAGEMENT */}
        {/* ========================================================================= */}
        {adminTab === 'categories' && (
          <div className="space-y-6">
            <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E5E2DC] shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl font-black text-[#1C1C18]">إدارة أقسام المنيو</h2>
                <p className="text-xs text-[#554335] mt-0.5">
                  إضافة وتعديل وترتيب الأقسام الرئيسية في قائمة الطعام
                </p>
              </div>

              <button
                onClick={handleOpenCreateCategory}
                className="bg-[#F28C18] hover:bg-[#d97706] text-[#111111] px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة قسم جديد</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {categories.map((cat) => {
                const dishCount = dishes.filter((d) => d.category === cat.id).length;
                return (
                  <div
                    key={cat.id}
                    className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E5E2DC] shadow-xs flex items-center justify-between hover:border-[#F28C18]/50 transition-all"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 bg-[#F8F5EF] text-[#F28C18] rounded-xl flex items-center justify-center font-bold border border-[#E5E2DC]">
                        <Tag className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-black text-sm text-[#1C1C18]">{cat.name}</h4>
                        <p className="text-xs text-[#887363]">{cat.nameEn} • معرّف: {cat.id}</p>
                        <span className="inline-block mt-1 text-[11px] bg-[#F8F5EF] text-[#554335] px-2 py-0.5 rounded-md font-semibold border border-[#E5E2DC]">
                          {dishCount} وجبات مرتبطة
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditCategory(cat)}
                        className="p-2 bg-[#F8F5EF] hover:bg-[#EAE6DE] text-[#1C1C18] rounded-xl border border-[#E5E2DC] cursor-pointer"
                        title="تعديل القسم"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {cat.id !== 'all' && (
                        <button
                          onClick={() => handleDeleteCategory(cat)}
                          className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl border border-red-200 cursor-pointer"
                          title="حذف القسم"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: SQL SCHEMA & SUPABASE INITIALIZATION */}
        {/* ========================================================================= */}
        {adminTab === 'sql' && (
          <div className="space-y-6">
            {/* Supabase Connection Overview Banner */}
            <div className="bg-[#111111] text-white p-6 rounded-[24px] shadow-xl border border-[#333333] space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-[#25D366] text-[#111111] text-xs font-black px-2.5 py-0.5 rounded-full">
                      CONNECTED
                    </span>
                    <h3 className="text-xl font-black text-white">إعداد وربط قاعدة بيانات Supabase</h3>
                  </div>
                  <p className="text-xs text-[#A89F91] mt-1">
                    عنوان المشروع: <code className="text-[#F28C18]">https://wpyothnfnfupzxdshhme.supabase.co</code>
                  </p>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  <button
                    onClick={handleOneClickSeed}
                    disabled={isSeeding}
                    className="bg-[#25D366] hover:bg-[#20bd5a] text-[#111111] px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all active:scale-98 cursor-pointer"
                  >
                    <RefreshCw className={`w-4 h-4 ${isSeeding ? 'animate-spin' : ''}`} />
                    <span>{isSeeding ? 'جاري المزامنة...' : 'زر المزامنة التلقائية لـ Supabase ⚡'}</span>
                  </button>

                  <button
                    onClick={handleCopySql}
                    className="bg-[#F28C18] hover:bg-[#d97706] text-[#111111] px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all active:scale-98 cursor-pointer"
                  >
                    {copiedSql ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedSql ? 'تم النسخ بنجاح!' : 'نسخ كود SQL بالكامل'}</span>
                  </button>
                </div>
              </div>

              {/* Instructions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs text-[#E5E2DC]">
                <div className="bg-[#1C1C18] p-3.5 rounded-xl border border-[#333333] space-y-1">
                  <div className="font-bold text-[#F28C18]">1. افتح Supabase SQL Editor</div>
                  <p className="text-[11px] text-[#A89F91]">
                    ادخل على لوحة تحكم Supabase الخاصة بك وافتح تبويب SQL Editor.
                  </p>
                </div>
                <div className="bg-[#1C1C18] p-3.5 rounded-xl border border-[#333333] space-y-1">
                  <div className="font-bold text-[#F28C18]">2. الصق الكود واضغط Run</div>
                  <p className="text-[11px] text-[#A89F91]">
                    سيتم إنشاء جداول categories و dishes و offers و bucket الصور photos مع كافة الصلاحيات.
                  </p>
                </div>
                <div className="bg-[#1C1C18] p-3.5 rounded-xl border border-[#333333] space-y-1">
                  <div className="font-bold text-[#F28C18]">3. كل التعديلات تصبح ديناميكية</div>
                  <p className="text-[11px] text-[#A89F91]">
                    أي تعديل أو صورة أو وجبة تضيفها من هنا ستُحفظ في Supabase فوراً.
                  </p>
                </div>
              </div>
            </div>

            {/* Raw SQL Display Box */}
            <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E2DC] p-5 shadow-xs space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-[#F28C18]" />
                  <span className="font-bold text-sm text-[#1C1C18]">كود الـ SQL الكامل (PostgreSQL DDL & Seed)</span>
                </div>
                <button
                  onClick={handleCopySql}
                  className="text-xs font-bold text-[#F28C18] hover:text-[#d97706] flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>نسخ الكود</span>
                </button>
              </div>

              <div className="relative">
                <pre className="bg-[#1C1C18] text-[#25D366] p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-96 leading-relaxed select-all">
                  {SUPABASE_SQL_SCHEMA_AND_SEED}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: PHOTOS STORAGE UPLOAD MANAGER */}
        {/* ========================================================================= */}
        {adminTab === 'upload' && (
          <div className="space-y-6">
            <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#E5E2DC] shadow-xs space-y-4">
              <div className="space-y-1">
                <h2 className="text-xl font-black text-[#1C1C18]">مركز رفع الصور (Supabase Storage: photos)</h2>
                <p className="text-xs text-[#554335]">
                  ارفع صور الوجبات والأطباق مباشرة إلى باكت التخزين <code className="bg-[#F8F5EF] px-2 py-0.5 rounded-sm font-bold text-[#F28C18]">photos</code> للحصول على روابط مباشرة دائمة
                </p>
              </div>

              {/* Upload Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#F28C18]/60 hover:border-[#F28C18] bg-[#F8F5EF] rounded-2xl p-8 text-center cursor-pointer transition-all hover:bg-[#F28C18]/5 space-y-3"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="w-16 h-16 bg-[#FFFFFF] text-[#F28C18] rounded-full mx-auto flex items-center justify-center shadow-xs border border-[#E5E2DC]">
                  <Upload className="w-8 h-8" />
                </div>
                <div>
                  <p className="font-bold text-sm text-[#1C1C18]">انقر هنا لاختيار صورة من جهازك</p>
                  <p className="text-xs text-[#887363] mt-1">
                    يدعم JPG, PNG, WEBP. سيتم رفعها مباشرة لباكت photos في Supabase
                  </p>
                </div>
                {isUploadingImage && (
                  <div className="text-xs font-bold text-[#F28C18] flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>جاري الرفع إلى Supabase...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Gallery of Dish Photos */}
            <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E5E2DC] shadow-xs space-y-3">
              <h3 className="font-black text-sm text-[#1C1C18]">صور الوجبات الحالية</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {dishes.map((dish) => (
                  <div
                    key={dish.id}
                    className="group relative bg-[#F8F5EF] rounded-xl overflow-hidden border border-[#E5E2DC] aspect-square"
                  >
                    <img
                      src={dish.image}
                      alt={dish.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 text-center text-white">
                      <p className="text-[11px] font-bold truncate w-full">{dish.name}</p>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(dish.image);
                          showToast('success', 'تم نسخ رابط الصورة');
                        }}
                        className="mt-1 text-[10px] bg-[#F28C18] text-[#111111] px-2 py-0.5 rounded-full font-black"
                      >
                        نسخ الرابط
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT DISH */}
      {/* ========================================================================= */}
      {isDishModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            onClick={() => setIsDishModalOpen(false)}
          />

          <div className="relative w-full max-w-2xl bg-[#FFFFFF] rounded-[28px] p-6 sm:p-7 shadow-2xl z-50 max-h-[90vh] overflow-y-auto border border-[#E5E2DC] space-y-5 animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-[#E5E2DC] pb-4">
              <h3 className="text-xl font-black text-[#1C1C18]">
                {editingDish ? `تعديل وجبة: ${editingDish.name}` : 'إضافة وجبة جديدة'}
              </h3>
              <button
                onClick={() => setIsDishModalOpen(false)}
                className="p-1.5 rounded-full text-[#887363] hover:bg-[#F0EEE8] cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDish} className="space-y-4">
              {/* Image Preview & Upload */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#1C1C18]">صورة الوجبة</label>
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <div className="w-28 h-28 rounded-2xl bg-[#F0EEE8] overflow-hidden border border-[#E5E2DC] shrink-0 relative">
                    {dishFormData.image ? (
                      <img
                        src={dishFormData.image}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#887363]">
                        <ImageIcon className="w-8 h-8" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 flex-grow w-full">
                    <input
                      type="url"
                      value={dishFormData.image || ''}
                      onChange={(e) => setDishFormData({ ...dishFormData, image: e.target.value })}
                      placeholder="رابط الصورة المباشر أو اضغط رفع أدناه..."
                      className="w-full px-3 py-2 bg-[#F8F5EF] border border-[#E5E2DC] rounded-xl text-xs font-semibold focus:outline-hidden focus:border-[#F28C18]"
                      required
                    />

                    <label className="inline-flex items-center gap-2 bg-[#111111] hover:bg-[#252520] text-white px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all">
                      <Upload className="w-3.5 h-3.5 text-[#F28C18]" />
                      <span>{isUploadingImage ? 'جاري الرفع لـ Supabase...' : 'رفع صورة جديدة إلى باكت photos'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#1C1C18]">الاسم بالعربي *</label>
                  <input
                    type="text"
                    value={dishFormData.name || ''}
                    onChange={(e) => setDishFormData({ ...dishFormData, name: e.target.value })}
                    placeholder="مثال: بيتزا كرسبيانو سوبريم"
                    className="w-full px-3 py-2 bg-[#F8F5EF] border border-[#E5E2DC] rounded-xl text-xs font-semibold focus:outline-hidden focus:border-[#F28C18]"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#1C1C18]">الاسم بالإنجليزي (Name En)</label>
                  <input
                    type="text"
                    value={dishFormData.nameEn || ''}
                    onChange={(e) => setDishFormData({ ...dishFormData, nameEn: e.target.value })}
                    placeholder="Crispano Supreme Pizza"
                    className="w-full px-3 py-2 bg-[#F8F5EF] border border-[#E5E2DC] rounded-xl text-xs font-semibold focus:outline-hidden focus:border-[#F28C18]"
                  />
                </div>
              </div>

              {/* Price & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#1C1C18]">السعر الأساسي (ج.س) *</label>
                  <input
                    type="number"
                    value={dishFormData.price || ''}
                    onChange={(e) => setDishFormData({ ...dishFormData, price: Number(e.target.value) })}
                    placeholder="8500"
                    className="w-full px-3 py-2 bg-[#F8F5EF] border border-[#E5E2DC] rounded-xl text-xs font-semibold focus:outline-hidden focus:border-[#F28C18]"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#1C1C18]">سعر العرض / الخصم (اختياري)</label>
                  <input
                    type="number"
                    value={dishFormData.discountPrice || ''}
                    onChange={(e) =>
                      setDishFormData({
                        ...dishFormData,
                        discountPrice: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    placeholder="7500"
                    className="w-full px-3 py-2 bg-[#F8F5EF] border border-[#E5E2DC] rounded-xl text-xs font-semibold focus:outline-hidden focus:border-[#F28C18]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#1C1C18]">القسم التابع له *</label>
                  <select
                    value={dishFormData.category || 'pizza'}
                    onChange={(e) => setDishFormData({ ...dishFormData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F8F5EF] border border-[#E5E2DC] rounded-xl text-xs font-semibold focus:outline-hidden focus:border-[#F28C18]"
                  >
                    {categories
                      .filter((c) => c.id !== 'all')
                      .map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name} ({cat.nameEn})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#1C1C18]">الوصف وتفاصيل الوجبة</label>
                <textarea
                  rows={2}
                  value={dishFormData.description || ''}
                  onChange={(e) => setDishFormData({ ...dishFormData, description: e.target.value })}
                  placeholder="قطع فراخ + جبنة موتزاريلا + صوص رانش..."
                  className="w-full px-3 py-2 bg-[#F8F5EF] border border-[#E5E2DC] rounded-xl text-xs font-semibold focus:outline-hidden focus:border-[#F28C18]"
                />
              </div>

              {/* Badges & Flags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#1C1C18]">شارة مميزة (Badge)</label>
                  <input
                    type="text"
                    value={dishFormData.badge || ''}
                    onChange={(e) => setDishFormData({ ...dishFormData, badge: e.target.value })}
                    placeholder="الأكثر مبيعاً / مميز / توفير"
                    className="w-full px-3 py-2 bg-[#F8F5EF] border border-[#E5E2DC] rounded-xl text-xs font-semibold focus:outline-hidden focus:border-[#F28C18]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#1C1C18]">وقت التجهيز المتوقع (دقيقة)</label>
                  <input
                    type="number"
                    value={dishFormData.prepTimeMinutes || 15}
                    onChange={(e) =>
                      setDishFormData({ ...dishFormData, prepTimeMinutes: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-[#F8F5EF] border border-[#E5E2DC] rounded-xl text-xs font-semibold focus:outline-hidden focus:border-[#F28C18]"
                  />
                </div>
              </div>

              {/* Availability & Toggles */}
              <div className="bg-[#F8F5EF] p-3.5 rounded-xl border border-[#E5E2DC] flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#1C1C18]">
                  <input
                    type="checkbox"
                    checked={dishFormData.isAvailable !== false}
                    onChange={(e) =>
                      setDishFormData({ ...dishFormData, isAvailable: e.target.checked })
                    }
                    className="w-4 h-4 text-[#F28C18] rounded-sm accent-[#F28C18]"
                  />
                  <span>متوفر للطلب للزبائن الآن</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#1C1C18]">
                  <input
                    type="checkbox"
                    checked={Boolean(dishFormData.isPopular)}
                    onChange={(e) =>
                      setDishFormData({ ...dishFormData, isPopular: e.target.checked })
                    }
                    className="w-4 h-4 text-[#F28C18] rounded-sm accent-[#F28C18]"
                  />
                  <span>عرض في قسم (الأكثر طلباً 🔥)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#1C1C18]">
                  <input
                    type="checkbox"
                    checked={Boolean(dishFormData.isOffer)}
                    onChange={(e) =>
                      setDishFormData({ ...dishFormData, isOffer: e.target.checked })
                    }
                    className="w-4 h-4 text-[#F28C18] rounded-sm accent-[#F28C18]"
                  />
                  <span>عرض خاص (Offer)</span>
                </label>
              </div>

              {/* Ingredients Builder */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#1C1C18]">المكونات الرئيسية</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newIngredientInput}
                    onChange={(e) => setNewIngredientInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddIngredient();
                      }
                    }}
                    placeholder="أضف مكون (مثال: جبنة شيدر، صوص رانش)..."
                    className="flex-grow px-3 py-2 bg-[#F8F5EF] border border-[#E5E2DC] rounded-xl text-xs font-semibold focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleAddIngredient}
                    className="bg-[#111111] text-white px-3 py-2 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    إضافة
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                  {dishFormData.ingredients?.map((ing, idx) => (
                    <span
                      key={idx}
                      className="bg-[#F0EEE8] text-[#1C1C18] text-xs font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1 border border-[#E5E2DC]"
                    >
                      <span>{ing}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveIngredient(idx)}
                        className="text-red-500 hover:text-red-700 font-bold ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Customization Options Builder */}
              <div className="space-y-2 border-t border-[#E5E2DC] pt-3">
                <label className="block text-xs font-bold text-[#1C1C18]">خيارات التخصيص والإضافات (للزبون)</label>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <input
                    type="text"
                    value={newOptionName}
                    onChange={(e) => setNewOptionName(e.target.value)}
                    placeholder="اسم الخيار (مثال: جبنة إضافية)"
                    className="sm:col-span-2 px-3 py-2 bg-[#F8F5EF] border border-[#E5E2DC] rounded-xl text-xs font-semibold"
                  />
                  <input
                    type="number"
                    value={newOptionPrice}
                    onChange={(e) => setNewOptionPrice(Number(e.target.value))}
                    placeholder="السعر (0 للاستبعاد)"
                    className="px-3 py-2 bg-[#F8F5EF] border border-[#E5E2DC] rounded-xl text-xs font-semibold"
                  />
                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="bg-[#F28C18] text-[#111111] px-3 py-2 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    + إضافة خيار
                  </button>
                </div>

                <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
                  {dishFormData.options?.map((opt) => (
                    <div
                      key={opt.id}
                      className="flex justify-between items-center bg-[#F8F5EF] p-2 rounded-lg text-xs border border-[#E5E2DC]"
                    >
                      <span className="font-semibold">{opt.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#F28C18]">
                          {opt.price > 0 ? `+${formatPrice(opt.price)}` : 'مجاناً'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(opt.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-3 border-t border-[#E5E2DC]">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-grow bg-[#111111] hover:bg-[#252520] text-white py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#25D366]" />
                  <span>{isLoading ? 'جاري الحفظ في Supabase...' : 'حفظ الوجبة في قاعدة البيانات'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsDishModalOpen(false)}
                  className="px-5 py-3 bg-[#F0EEE8] hover:bg-[#EAE6DE] text-[#1C1C18] rounded-xl text-xs font-bold cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT CATEGORY */}
      {/* ========================================================================= */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            onClick={() => setIsCategoryModalOpen(false)}
          />

          <div className="relative w-full max-w-md bg-[#FFFFFF] rounded-[28px] p-6 shadow-2xl z-50 border border-[#E5E2DC] space-y-4 animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-[#E5E2DC] pb-3">
              <h3 className="text-lg font-black text-[#1C1C18]">
                {editingCategory ? `تعديل القسم: ${editingCategory.name}` : 'إضافة قسم جديد'}
              </h3>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-1 rounded-full text-[#887363] hover:bg-[#F0EEE8] cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#1C1C18]">معرف القسم (ID بالإنجليزية) *</label>
                <input
                  type="text"
                  value={categoryFormData.id || ''}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, id: e.target.value })}
                  placeholder="مثال: grills أو desserts"
                  className="w-full px-3 py-2 bg-[#F8F5EF] border border-[#E5E2DC] rounded-xl text-xs font-semibold"
                  required
                  disabled={!!editingCategory}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#1C1C18]">اسم القسم بالعربي *</label>
                <input
                  type="text"
                  value={categoryFormData.name || ''}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                  placeholder="مثال: المشويات"
                  className="w-full px-3 py-2 bg-[#F8F5EF] border border-[#E5E2DC] rounded-xl text-xs font-semibold"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#1C1C18]">الاسم بالإنجليزي</label>
                <input
                  type="text"
                  value={categoryFormData.nameEn || ''}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, nameEn: e.target.value })}
                  placeholder="Grills"
                  className="w-full px-3 py-2 bg-[#F8F5EF] border border-[#E5E2DC] rounded-xl text-xs font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#1C1C18]">ترتيب الظهور (Sort Order)</label>
                <input
                  type="number"
                  value={categoryFormData.sortOrder || 0}
                  onChange={(e) =>
                    setCategoryFormData({ ...categoryFormData, sortOrder: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 bg-[#F8F5EF] border border-[#E5E2DC] rounded-xl text-xs font-semibold"
                />
              </div>

              <div className="flex gap-2 pt-3 border-t border-[#E5E2DC]">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-grow bg-[#111111] hover:bg-[#252520] text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#25D366]" />
                  <span>حفظ القسم</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2.5 bg-[#F0EEE8] text-[#1C1C18] rounded-xl text-xs font-bold cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
