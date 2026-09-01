import { supabase } from './supabase';
import { Category, MenuItem, Offer } from '../types';

// Map database row to Category
export function mapDbCategory(row: any): Category {
  return {
    id: row.id,
    name: row.name || '',
    nameEn: row.name_en || row.name || '',
    icon: row.icon || 'Sparkles',
    sortOrder: row.sort_order ?? 0,
  };
}

// Map Category to database row
export function mapCategoryToDb(cat: Category) {
  return {
    id: cat.id,
    name: cat.name,
    name_en: cat.nameEn || cat.name,
    icon: cat.icon || 'Sparkles',
    sort_order: cat.sortOrder ?? 0,
  };
}

// Map database row to MenuItem
export function mapDbDish(row: any): MenuItem {
  return {
    id: row.id,
    name: row.name || '',
    nameEn: row.name_en || row.name || '',
    description: row.description || '',
    price: Number(row.price) || 0,
    category: row.category || '',
    image: row.image || '',
    heroImage: row.hero_image || undefined,
    isPopular: Boolean(row.is_popular),
    isOffer: Boolean(row.is_offer),
    isAvailable: row.is_available !== undefined ? Boolean(row.is_available) : true,
    discountPrice: row.discount_price ? Number(row.discount_price) : undefined,
    ingredients: Array.isArray(row.ingredients) ? row.ingredients : [],
    options: Array.isArray(row.options) ? row.options : [],
    prepTimeMinutes: row.prep_time_minutes ? Number(row.prep_time_minutes) : 15,
    badge: row.badge || undefined,
    sortOrder: row.sort_order ?? 0,
  };
}

// Map MenuItem to database row
export function mapDishToDb(item: MenuItem) {
  return {
    id: item.id,
    name: item.name,
    name_en: item.nameEn,
    description: item.description,
    price: item.price,
    category: item.category,
    image: item.image,
    hero_image: item.heroImage || null,
    is_popular: Boolean(item.isPopular),
    is_offer: Boolean(item.isOffer),
    is_available: item.isAvailable !== false,
    discount_price: item.discountPrice || null,
    ingredients: item.ingredients || [],
    options: item.options || [],
    prep_time_minutes: item.prepTimeMinutes || 15,
    badge: item.badge || null,
    sort_order: item.sortOrder ?? 0,
  };
}

// Map database row to Offer
export function mapDbOffer(row: any): Offer {
  return {
    id: row.id,
    title: row.title || '',
    titleEn: row.title_en || '',
    description: row.description || '',
    image: row.image || '',
    badge: row.badge || undefined,
    discountPercentage: row.discount_percentage ? Number(row.discount_percentage) : undefined,
    active: row.active !== false,
    linkedDishId: row.linked_dish_id || undefined,
  };
}

// ==========================================
// SUPABASE DATABASE OPERATIONS (STRICT DB ONLY)
// ==========================================

export async function fetchCategoriesFromDb(): Promise<{ data: Category[]; error: any }> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      console.warn('Supabase fetchCategories error:', error.message);
      return { data: [], error };
    }

    if (!data || data.length === 0) {
      return { data: [], error: null };
    }

    const mapped = data.map(mapDbCategory);
    return { data: mapped, error: null };
  } catch (err: any) {
    console.error('Failed to fetch categories:', err);
    return { data: [], error: err };
  }
}

export async function fetchDishesFromDb(): Promise<{ data: MenuItem[]; error: any }> {
  try {
    const { data, error } = await supabase
      .from('dishes')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      console.warn('Supabase fetchDishes error:', error.message);
      return { data: [], error };
    }

    if (!data || data.length === 0) {
      return { data: [], error: null };
    }

    const mapped = data.map(mapDbDish);
    return { data: mapped, error: null };
  } catch (err: any) {
    console.error('Failed to fetch dishes:', err);
    return { data: [], error: err };
  }
}

export async function fetchOffersFromDb(): Promise<{ data: Offer[]; error: any }> {
  try {
    const { data, error } = await supabase
      .from('offers')
      .select('*')
      .eq('active', true);

    if (error) {
      return { data: [], error };
    }

    return { data: (data || []).map(mapDbOffer), error: null };
  } catch (err: any) {
    return { data: [], error: err };
  }
}

// Upsert Category
export async function upsertCategoryToDb(category: Category): Promise<{ success: boolean; error: any }> {
  try {
    const row = mapCategoryToDb(category);
    const { error } = await supabase.from('categories').upsert(row, { onConflict: 'id' });
    if (error) throw error;
    return { success: true, error: null };
  } catch (err: any) {
    console.error('Upsert category error:', err);
    return { success: false, error: err };
  }
}

// Delete Category
export async function deleteCategoryFromDb(categoryId: string): Promise<{ success: boolean; error: any }> {
  try {
    const { error } = await supabase.from('categories').delete().eq('id', categoryId);
    if (error) throw error;
    return { success: true, error: null };
  } catch (err: any) {
    console.error('Delete category error:', err);
    return { success: false, error: err };
  }
}

// Upsert Dish
export async function upsertDishToDb(dish: MenuItem): Promise<{ success: boolean; error: any }> {
  try {
    const row = mapDishToDb(dish);
    const { error } = await supabase.from('dishes').upsert(row, { onConflict: 'id' });
    if (error) throw error;
    return { success: true, error: null };
  } catch (err: any) {
    console.error('Upsert dish error:', err);
    return { success: false, error: err };
  }
}

// Delete Dish
export async function deleteDishFromDb(dishId: string): Promise<{ success: boolean; error: any }> {
  try {
    const { error } = await supabase.from('dishes').delete().eq('id', dishId);
    if (error) throw error;
    return { success: true, error: null };
  } catch (err: any) {
    console.error('Delete dish error:', err);
    return { success: false, error: err };
  }
}

// Toggle Availability
export async function toggleDishAvailabilityInDb(
  dishId: string,
  isAvailable: boolean
): Promise<{ success: boolean; error: any }> {
  try {
    const { error } = await supabase
      .from('dishes')
      .update({ is_available: isAvailable })
      .eq('id', dishId);
    if (error) throw error;
    return { success: true, error: null };
  } catch (err: any) {
    console.error('Toggle dish availability error:', err);
    return { success: false, error: err };
  }
}

// ==========================================
// SUPABASE STORAGE: Bucket 'photos'
// ==========================================

export async function uploadPhotoToBucket(
  file: File,
  folder: string = 'dishes'
): Promise<{ publicUrl: string | null; error: any }> {
  try {
    const fileExt = file.name.split('.').pop() || 'jpg';
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 20);
    const fileName = `${folder}/${Date.now()}-${cleanFileName}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('photos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw uploadError;
    }

    const { data } = supabase.storage.from('photos').getPublicUrl(fileName);
    return { publicUrl: data.publicUrl, error: null };
  } catch (err: any) {
    console.error('Upload photo to bucket error:', err);
    return { publicUrl: null, error: err };
  }
}
