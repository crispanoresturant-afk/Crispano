// Full SQL queries to initialize Supabase Database, Storage bucket, RLS policies, and Seed Data for CRISPANO

export const SUPABASE_SQL_SCHEMA_AND_SEED = `-- ==============================================================================
-- CRISPANO RESTAURANT - SUPABASE DATABASE INITIALIZATION SCRIPT
-- Run this in Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. Create Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    name_en TEXT,
    icon TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Create Dishes (Menu Items) Table
CREATE TABLE IF NOT EXISTS public.dishes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    name_en TEXT,
    description TEXT DEFAULT '',
    price NUMERIC NOT NULL,
    category TEXT NOT NULL,
    image TEXT NOT NULL,
    hero_image TEXT,
    is_popular BOOLEAN DEFAULT false,
    is_offer BOOLEAN DEFAULT false,
    is_available BOOLEAN DEFAULT true,
    discount_price NUMERIC,
    ingredients JSONB DEFAULT '[]'::jsonb,
    options JSONB DEFAULT '[]'::jsonb,
    prep_time_minutes INTEGER DEFAULT 15,
    badge TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Create Offers Table
CREATE TABLE IF NOT EXISTS public.offers (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    title_en TEXT,
    description TEXT,
    image TEXT NOT NULL,
    badge TEXT,
    discount_percentage NUMERIC DEFAULT 0,
    active BOOLEAN DEFAULT true,
    linked_dish_id TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

-- 5. Create Public Access Policies for Categories
DROP POLICY IF EXISTS "Public can view categories" ON public.categories;
CREATE POLICY "Public can view categories" ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can insert categories" ON public.categories;
CREATE POLICY "Public can insert categories" ON public.categories FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can update categories" ON public.categories;
CREATE POLICY "Public can update categories" ON public.categories FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public can delete categories" ON public.categories;
CREATE POLICY "Public can delete categories" ON public.categories FOR DELETE USING (true);

-- 6. Create Public Access Policies for Dishes
DROP POLICY IF EXISTS "Public can view dishes" ON public.dishes;
CREATE POLICY "Public can view dishes" ON public.dishes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can insert dishes" ON public.dishes;
CREATE POLICY "Public can insert dishes" ON public.dishes FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can update dishes" ON public.dishes;
CREATE POLICY "Public can update dishes" ON public.dishes FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public can delete dishes" ON public.dishes;
CREATE POLICY "Public can delete dishes" ON public.dishes FOR DELETE USING (true);

-- 7. Create Public Access Policies for Offers
DROP POLICY IF EXISTS "Public can view offers" ON public.offers;
CREATE POLICY "Public can view offers" ON public.offers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can insert offers" ON public.offers;
CREATE POLICY "Public can insert offers" ON public.offers FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can update offers" ON public.offers;
CREATE POLICY "Public can update offers" ON public.offers FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public can delete offers" ON public.offers;
CREATE POLICY "Public can delete offers" ON public.offers FOR DELETE USING (true);

-- 8. Create Storage Bucket 'photos' & Policies
INSERT INTO storage.buckets (id, name, public) 
VALUES ('photos', 'photos', true) 
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public Access for photos" ON storage.objects;
CREATE POLICY "Public Access for photos" ON storage.objects FOR SELECT USING (bucket_id = 'photos');

DROP POLICY IF EXISTS "Public Upload for photos" ON storage.objects;
CREATE POLICY "Public Upload for photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'photos');

DROP POLICY IF EXISTS "Public Update for photos" ON storage.objects;
CREATE POLICY "Public Update for photos" ON storage.objects FOR UPDATE USING (bucket_id = 'photos');

DROP POLICY IF EXISTS "Public Delete for photos" ON storage.objects;
CREATE POLICY "Public Delete for photos" ON storage.objects FOR DELETE USING (bucket_id = 'photos');

-- ==============================================================================
-- SEED DATA: Insert Default Categories
-- ==============================================================================
INSERT INTO public.categories (id, name, name_en, icon, sort_order) VALUES
('all', 'الكل', 'All', 'Flame', 0),
('pizza', 'البيتزا', 'Pizza', 'Pizza', 1),
('broast', 'البروست', 'Broast', 'Drumstick', 2),
('sandwiches', 'السندوتشات', 'Sandwiches', 'Sandwich', 3),
('shawarma', 'شاورما', 'Shawarma', 'UtensilsCrossed', 4),
('rolls', 'Rolls', 'Rolls', 'Sparkles', 5),
('crispy_rice', 'Crispy Rice', 'Crispy Rice', 'Bowl', 6),
('drinks', 'مشروبات', 'Drinks', 'CupSoda', 7),
('sides', 'إضافات وصوصات', 'Sides & Sauces', 'Sparkles', 8)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    name_en = EXCLUDED.name_en,
    icon = EXCLUDED.icon,
    sort_order = EXCLUDED.sort_order;

-- ==============================================================================
-- SEED DATA: Insert Dishes / Menu Items
-- ==============================================================================
INSERT INTO public.dishes (
    id, name, name_en, description, price, category, image, hero_image, 
    is_popular, is_offer, is_available, discount_price, ingredients, options, 
    prep_time_minutes, badge, sort_order
) VALUES
(
    'pizza-crispano',
    'بيتزا كرسبيانو',
    'Crispano Pizza',
    'فراخ + هوت دوج + بسطرمة + صوص الرانش المميز وفلفل ألوان وجبنة موتزاريلا غنية',
    8500,
    'pizza',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuB-0qaS87wO5vBnoXgPw59xtrxVzhIHjhJBUK_6-Eszlim8rG613qVWWNqSHOj37XdCzKjhu_ltCT9q8jDdYeDRrBtTqD0WW191vizwLhS4LYEPDfkKawTJr_CmGSVywcraXYlVfCG_feWLHPwn55Vla8ONLCLHQAVnCf6WWDGwb69SMVrWzcreN_AcFTWwtza3691x8knPN9OXGDY4sHpKpbq1YArhBax1Rhp01LgG6TvpRvr5hbKlwA',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAfMCt135uk-AUpNHIk9xNIMeO6sgJVPfaasW6KUJQUU8H7U7Vbn7OsBAB7SZ_VC8nBmxFcl0sM44tKF9JEFwVbCH2_WCiErx0xgIuYG1Lc2y6MRSqAbTom_xiQ5JvxJL60n8ykAM37XCPueAZqgId0ooPgpk_Dv3Xrt2LAyZ2XakOt11X7ldGnV3D28PK8KQQSBfVK7Jy-5Gj4qKl7WZp9EcSDqd06bmp5jge9QCMgZd7F7qdLLhverg',
    true, false, true, NULL,
    '["عجينة إيطالية طازجة", "قطع فراخ متبلة", "هوت دوج", "بسطرمة", "صوص رانش", "جبنة موتزاريلا"]'::jsonb,
    '[
        {"id": "no-onion", "name": "بدون بصل", "price": 0, "type": "exclude"},
        {"id": "extra-spicy", "name": "شطة زيادة", "price": 0, "type": "extra"},
        {"id": "no-pepper", "name": "بدون فلفل", "price": 0, "type": "exclude"},
        {"id": "extra-cheese", "name": "جبنة موتزاريلا إضافية (+800 ج.س)", "price": 800, "type": "extra"},
        {"id": "stuffed-crust", "name": "أطراف محشوة جبنة (+1,200 ج.س)", "price": 1200, "type": "extra"},
        {"id": "extra-ranch", "name": "صوص رانش إضافي (+400 ج.س)", "price": 400, "type": "extra"}
    ]'::jsonb,
    20, 'الأكثر مبيعاً', 1
),
(
    'burger-double-cheese',
    'برجر دبل تشيز',
    'Double Cheese Burger',
    'شريحتين لحم بقري صافي + جبنة شيدر سائلة + صوص كرسبيانو السري + خس وطماطم طازجة',
    12000,
    'sandwiches',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBUSrubnScf4UXDuYaFPcwcBFGLKxMleNFYvwxHfZL9bBsEo-wR2LIf-2r3XKDF9EN_1lT8MKedU-r6QDChQt6gq5SnulEcfdHC0VQBOnlJOqmxicVZO369xOUNd65IUe4fLVY5gojxd4REvHLC2Mt-bi2r1bShLAu25GvtWbxQijYE2HUelfrINK-H5eARXMJ26i0pM_qDLiopJs_2tyKA6Vsfjlg1n7lJDm_oAOU3EGKhzUOtY2euKA',
    NULL,
    true, false, true, NULL,
    '["لحم بقري بلدي", "جبنة شيدر", "صوص كرسبيانو", "خس وطماطم", "خبز بريوش"]'::jsonb,
    '[
        {"id": "no-pickle", "name": "بدون خيار مخلل", "price": 0, "type": "exclude"},
        {"id": "no-onion", "name": "بدون بصل", "price": 0, "type": "exclude"},
        {"id": "extra-cheese-slice", "name": "شريحة جبنة إضافية (+600 ج.س)", "price": 600, "type": "extra"},
        {"id": "extra-crispano-sauce", "name": "صوص كرسبيانو زيادة (+300 ج.س)", "price": 300, "type": "extra"},
        {"id": "add-bacon", "name": "بيكون لحم مقرمش (+900 ج.س)", "price": 900, "type": "extra"}
    ]'::jsonb,
    15, 'مميز', 2
),
(
    'crispy-strips-meal',
    'وجبة كرسبي ستريبس',
    'Crispy Strips Meal',
    '4 قطع دجاج تندر مقرمش ذهبي + بطاطس مقلية مقرمشة + خبز طازج + صوص الثوم المميز والكولسلو',
    9500,
    'broast',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDioacQ1yP-7EhjVr2TOXZJOxeZaVjx6iuNYC_e1OLvmuVntM0zaQjewSM-rBxeJWVkiaudQPR7McDMIYexohX6HauClVkpUGwb08mjdltpZQABsDs-vS6t4PGQFJIKHGoTMQ3WuNiIBAxQozLAWPBrIXnm8Q_AIexHcspOoxSHf_tmYXuCrVLtTRNvxz509XWd-eaOkSb37aN17dTl1sRzXpIa3ev5gEh1GbRmCrVguE4uqA-G8ISofA',
    NULL,
    true, false, true, NULL,
    '["دجاج كرسبي 4 قطع", "بطاطس مقلية", "خبز طازج", "كولسلو", "ثومية"]'::jsonb,
    '[
        {"id": "spicy", "name": "حار (سبايسي)", "price": 0, "type": "extra"},
        {"id": "extra-garlic", "name": "ثومية إضافية (+300 ج.س)", "price": 300, "type": "extra"},
        {"id": "extra-fries", "name": "بطاطس مقلية زيادة (+700 ج.س)", "price": 700, "type": "extra"},
        {"id": "extra-bread", "name": "عيش إضافي (+200 ج.س)", "price": 200, "type": "extra"}
    ]'::jsonb,
    15, 'قرمشة لا تقاوم', 3
),
(
    'crispy-meal-3pcs',
    'وجبة كرسبي 3 قطع',
    'Crispy Meal 3 Pcs',
    '3 قطع دجاج مقرمشة مع البطاطس المقلية المقرمشة وصوص الثوم المميز والكولسلو اللذيذ',
    4500,
    'broast',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBpQHhh1apNT7nZeHEgaBcxpLrgPSazwQKJDQVWoHQ2xP_slpYPcdqvUyaGqk1UT_X-PqIbSWQ6PPj-yLkv3XMQ9N7jP4hieEG7esdm8qwwPGXHuKP-8xYrMdjf9Yz4i45gdDlhxdUqSTD7bKqcB4UQympachgMV1kwS2ZiTT6wjR3yhoqGsMA7ruc83CIytBor43pyzIia4NrvAee5FRgFCOEtSszzKgWp3jhYzyN1X73fxHsuKFQivA',
    NULL,
    true, false, true, NULL,
    '["دجاج مقرمش 3 قطع", "بطاطس", "كولسلو", "ثومية"]'::jsonb,
    '[
        {"id": "regular", "name": "عادي (غير حار)", "price": 0, "type": "extra"},
        {"id": "spicy", "name": "حار (سبايسي)", "price": 0, "type": "extra"},
        {"id": "extra-sauce", "name": "صوص إضافي (+300 ج.س)", "price": 300, "type": "extra"}
    ]'::jsonb,
    15, NULL, 4
),
(
    'zinger-sandwich',
    'ساندوتش زنجر سوبريم',
    'Zinger Supreme Sandwich',
    'صدر دجاج مقرمش حار مع خس طازج، جبنة شيدر وصوص المايونيز الحار في خبز السمسم الطري',
    3800,
    'sandwiches',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBgZ0-FpACr6TFz8zIhM17tZz0xdJoGyGZwZJD0SCH4ZRxYH8MFJY9y9n9gTPCanAevthJabNJbRf-JJFZOCg5DfbdNyocVpylB8_5PvPUFakMmQT2QSBMCi5VXEQ-c5uG3Cv-jzEUhF6zjnmUSgdjk0pnsTMmL5zjP_rNyQHzig_doJjEQNXFHd6OcB4Fz1j8MwtD8HofnKvNQywp2oud1WAnxPD0mmAd5VgUCQu3JfdYT75ohJYpQqw',
    NULL,
    true, false, true, NULL,
    '["صدر دجاج سبايسي", "شيدر", "مايونيز حار", "خس", "خبز سمسم"]'::jsonb,
    '[
        {"id": "no-tomato", "name": "بدون طماطم", "price": 0, "type": "exclude"},
        {"id": "no-mayo", "name": "بدون مايونيز", "price": 0, "type": "exclude"},
        {"id": "extra-cheese", "name": "شريحة جبنة (+400 ج.س)", "price": 400, "type": "extra"}
    ]'::jsonb,
    12, NULL, 5
),
(
    'duo-box-combo',
    'ديو بوكس كرسبيانو',
    'Crispano Duo Box',
    'برجر لحم كلاسيك + قطعتين كريسبي مقرمش + بطاطس حجم كبير + صوص + مشروب غازي منعش',
    8500,
    'sandwiches',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDPcG6M2pKQJS2LZ32hEq3elQoiDmcGBNg5VyS1pnHPDRMjoGpRT_IbnvArfT0IAOrpdb0W63gLztfsPawWHoexqCs2y9cQL_9lwQMfyvH0fAC1ShEtNY9-nQqCvKczhO55Nqu0sDDYUq7Sp-NOyqbc4pHiNuw3Pjol3yu-SwhMULJ_B313563LXLcZIYDAWTBSJ61fQ-nHpcuZGc0PkhdpKJucBZCrv6Sm3N9Z28wFrhNqD5SmMsq0Gg',
    NULL,
    true, true, true, 7800,
    '["برجر لحم", "2 قطعة كرسبي", "بطاطس كبير", "صوص", "مشروب"]'::jsonb,
    '[
        {"id": "drink-pepsi", "name": "مشروب بيبسي", "price": 0, "type": "extra"},
        {"id": "drink-7up", "name": "مشروب سفن آب", "price": 0, "type": "extra"},
        {"id": "drink-mirinda", "name": "مشروب ميريندا برتقال", "price": 0, "type": "extra"},
        {"id": "extra-sauce", "name": "صوص إضافي (+300 ج.س)", "price": 300, "type": "extra"}
    ]'::jsonb,
    18, 'توفير', 6
),
(
    'pizza-pepperoni',
    'بيتزا سوبر سوبريم بيبروني',
    'Pepperoni Supreme Pizza',
    'شرائح البيبروني الفاخرة مع صلصة الطماطم الإيطالية، فطر طازج، وجبنة الموتزاريلا الذائبة',
    7800,
    'pizza',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDdckZ-VfQmu47M0RSGchMPyDxIIKqImRipFue5326KzwoxrBBLY5EsY8wTerTk27URcptYYqrG6uxWlYNvKrySKb6vEeSVZPhwesMbJO-U5SfsQ5rZBAIZIr4q2pzwOBwn3oGAvmWNGpyv7O36Z-4bI0s0PgcIk8i9sRkjKp-SNq3tLhlbUq63gvObUtN5oIq-BM0KN7CVYIe8_BsQHlA76isRyMhaDa_XNY-FlubaqCd0GstgrF-9iA',
    NULL,
    false, false, true, NULL,
    '["بيبروني بقري", "صلصة إيطالية", "فطر طازج", "موتزاريلا"]'::jsonb,
    '[
        {"id": "no-mushroom", "name": "بدون فطر", "price": 0, "type": "exclude"},
        {"id": "extra-cheese", "name": "جبنة إضافية (+800 ج.س)", "price": 800, "type": "extra"},
        {"id": "spicy", "name": "هالبينو حار (+400 ج.س)", "price": 400, "type": "extra"}
    ]'::jsonb,
    20, NULL, 7
),
(
    'shawarma-arabi',
    'شاورما عربي دجاج كرسبيانو',
    'Arabic Chicken Shawarma',
    'قطع شاورما الدجاج المتبلة بالبهارات الخاصة ملفوفة ومقطعة، تقدم مع بطاطس وثومية ومخلل',
    5500,
    'shawarma',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDy3DBFuhP_ydE9CGcMdpJy20ns21INcrtliiHTOWPgWnpvo-XGS612JRHe7eGKygBhjL5T3PfZUI3oz62jup5g7CPrMdryEft-gNOA1Z4IRkQ1_z1zrUuhuSQCZJjgAinqdUV4fSHRRj2BokVJUWIHTAYwJ_152l7vYo6coAUVBiQg6ziNV84uMsDPPLh9HR_0Gw4c3BQx9StPIT-_G6aKLwTXGcy0C_HuBzF40JSB1NIw-KAHljrk7A',
    NULL,
    true, false, true, NULL,
    '["شاورما دجاج متبلة", "خبز صاج", "ثومية", "بطاطس", "مخلل"]'::jsonb,
    '[
        {"id": "extra-garlic", "name": "ثومية إضافية (+300 ج.س)", "price": 300, "type": "extra"},
        {"id": "spicy-shatta", "name": "شطة حارة", "price": 0, "type": "extra"},
        {"id": "add-cheese", "name": "إضافة جبنة موتزاريلا (+600 ج.س)", "price": 600, "type": "extra"}
    ]'::jsonb,
    15, NULL, 8
),
(
    'crispy-rice-bowl',
    'طبق أرز كرسبي رايس',
    'Crispy Rice Bowl',
    'أرز بسمتي مبهر بخلطة كرسبانو مع قطع الدجاج المقرمشة وصوص الباربكيو والرانش اللذيذ',
    4800,
    'crispy_rice',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDioacQ1yP-7EhjVr2TOXZJOxeZaVjx6iuNYC_e1OLvmuVntM0zaQjewSM-rBxeJWVkiaudQPR7McDMIYexohX6HauClVkpUGwb08mjdltpZQABsDs-vS6t4PGQFJIKHGoTMQ3WuNiIBAxQozLAWPBrIXnm8Q_AIexHcspOoxSHf_tmYXuCrVLtTRNvxz509XWd-eaOkSb37aN17dTl1sRzXpIa3ev5gEh1GbRmCrVguE4uqA-G8ISofA',
    NULL,
    false, false, true, NULL,
    '["أرز بسمتي مبهر", "قطع كرسبي مقرمشة", "صوص باربكيو", "صوص رانش"]'::jsonb,
    '[
        {"id": "extra-sauce", "name": "صوص باربكيو زيادة (+300 ج.س)", "price": 300, "type": "extra"},
        {"id": "extra-chicken", "name": "قطع كرسبي إضافية (+1,500 ج.س)", "price": 1500, "type": "extra"}
    ]'::jsonb,
    12, NULL, 9
),
(
    'crispano-rolls',
    'رول كرسبيانو تشيزي',
    'Crispano Cheesy Roll',
    'ساندوتش رول مقرمش محشو بقطع الدجاج والجبنة السائلة مع خضار وصوص خاص',
    3900,
    'rolls',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBgZ0-FpACr6TFz8zIhM17tZz0xdJoGyGZwZJD0SCH4ZRxYH8MFJY9y9n9gTPCanAevthJabNJbRf-JJFZOCg5DfbdNyocVpylB8_5PvPUFakMmQT2QSBMCi5VXEQ-c5uG3Cv-jzEUhF6zjnmUSgdjk0pnsTMmL5zjP_rNyQHzig_doJjEQNXFHd6OcB4Fz1j8MwtD8HofnKvNQywp2oud1WAnxPD0mmAd5VgUCQu3JfdYT75ohJYpQqw',
    NULL,
    false, false, true, NULL,
    '["رول مقرمش", "دجاج", "جبنة شيدر", "خضار طازج"]'::jsonb,
    '[
        {"id": "spicy", "name": "حار سبايسي", "price": 0, "type": "extra"},
        {"id": "extra-cheese", "name": "جبنة شيدر سائلة (+400 ج.س)", "price": 400, "type": "extra"}
    ]'::jsonb,
    10, NULL, 10
),
(
    'fresh-mango-juice',
    'عصير مانجو فريش طبيعي',
    'Fresh Natural Mango Juice',
    'عصير مانجو طازج 100% بدون أي إضافات صناعية، مثلج ومنعش',
    1800,
    'drinks',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBUSrubnScf4UXDuYaFPcwcBFGLKxMleNFYvwxHfZL9bBsEo-wR2LIf-2r3XKDF9EN_1lT8MKedU-r6QDChQt6gq5SnulEcfdHC0VQBOnlJOqmxicVZO369xOUNd65IUe4fLVY5gojxd4REvHLC2Mt-bi2r1bShLAu25GvtWbxQijYE2HUelfrINK-H5eARXMJ26i0pM_qDLiopJs_2tyKA6Vsfjlg1n7lJDm_oAOU3EGKhzUOtY2euKA',
    NULL,
    true, false, true, NULL,
    '["مانجو طبيعي 100%", "ثلج منعش"]'::jsonb,
    '[
        {"id": "sugar-less", "name": "سكر قليل", "price": 0, "type": "exclude"},
        {"id": "no-sugar", "name": "بدون سكر", "price": 0, "type": "exclude"}
    ]'::jsonb,
    5, NULL, 11
),
(
    'mojito-passion',
    'موهيتو باشن فروت منعش',
    'Passion Fruit Mojito',
    'مزيج الليمون والنعناع الفريش مع نكهة الباشن فروت والمياه الغازية وقطع الثلج',
    2000,
    'drinks',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuB-0qaS87wO5vBnoXgPw59xtrxVzhIHjhJBUK_6-Eszlim8rG613qVWWNqSHOj37XdCzKjhu_ltCT9q8jDdYeDRrBtTqD0WW191vizwLhS4LYEPDfkKawTJr_CmGSVywcraXYlVfCG_feWLHPwn55Vla8ONLCLHQAVnCf6WWDGwb69SMVrWzcreN_AcFTWwtza3691x8knPN9OXGDY4sHpKpbq1YArhBax1Rhp01LgG6TvpRvr5hbKlwA',
    NULL,
    false, false, true, NULL,
    '["باشن فروت", "ليمون", "نعناع فريش", "مياه غازية", "ثلج"]'::jsonb,
    '[]'::jsonb,
    5, NULL, 12
),
(
    'sauce-crispano-special',
    'صوص كرسبيانو الخاص',
    'Crispano Signature Sauce',
    'الخلطة السرية الخاصة بمطعم كرسبيانو بنكهة غنية ومميزة',
    400,
    'sides',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAfMCt135uk-AUpNHIk9xNIMeO6sgJVPfaasW6KUJQUU8H7U7Vbn7OsBAB7SZ_VC8nBmxFcl0sM44tKF9JEFwVbCH2_WCiErx0xgIuYG1Lc2y6MRSqAbTom_xiQ5JvxJL60n8ykAM37XCPueAZqgId0ooPgpk_Dv3Xrt2LAyZ2XakOt11X7ldGnV3D28PK8KQQSBfVK7Jy-5Gj4qKl7WZp9EcSDqd06bmp5jge9QCMgZd7F7qdLLhverg',
    NULL,
    false, false, true, NULL,
    '["خلطة كرسبيانو السرية"]'::jsonb,
    '[]'::jsonb,
    1, NULL, 13
),
(
    'side-garlic-sauce',
    'ثومية كرسبيانو كريمية',
    'Creamy Garlic Sauce',
    'ثومية ناعمة وغنية بالنكهة الأصلية المحبوبة',
    350,
    'sides',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDioacQ1yP-7EhjVr2TOXZJOxeZaVjx6iuNYC_e1OLvmuVntM0zaQjewSM-rBxeJWVkiaudQPR7McDMIYexohX6HauClVkpUGwb08mjdltpZQABsDs-vS6t4PGQFJIKHGoTMQ3WuNiIBAxQozLAWPBrIXnm8Q_AIexHcspOoxSHf_tmYXuCrVLtTRNvxz509XWd-eaOkSb37aN17dTl1sRzXpIa3ev5gEh1GbRmCrVguE4uqA-G8ISofA',
    NULL,
    false, false, true, NULL,
    '["ثوم طبيعي", "زيت زيتون", "خلطة كريمية"]'::jsonb,
    '[]'::jsonb,
    1, NULL, 14
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    name_en = EXCLUDED.name_en,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    category = EXCLUDED.category,
    image = EXCLUDED.image,
    hero_image = EXCLUDED.hero_image,
    is_popular = EXCLUDED.is_popular,
    is_offer = EXCLUDED.is_offer,
    is_available = EXCLUDED.is_available,
    discount_price = EXCLUDED.discount_price,
    ingredients = EXCLUDED.ingredients,
    options = EXCLUDED.options,
    prep_time_minutes = EXCLUDED.prep_time_minutes,
    badge = EXCLUDED.badge,
    sort_order = EXCLUDED.sort_order;

-- ==============================================================================
-- SEED DATA: Insert Offers
-- ==============================================================================
INSERT INTO public.offers (id, title, title_en, description, image, badge, discount_percentage, active, linked_dish_id) VALUES
(
    'offer-duo-box',
    'عرض ديو بوكس التوفير',
    'Duo Box Saver Offer',
    'برجر دبل + 2 قطعة كريسبي + بطاطس كبير + مشروب غازي بخصم حصري!',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDPcG6M2pKQJS2LZ32hEq3elQoiDmcGBNg5VyS1pnHPDRMjoGpRT_IbnvArfT0IAOrpdb0W63gLztfsPawWHoexqCs2y9cQL_9lwQMfyvH0fAC1ShEtNY9-nQqCvKczhO55Nqu0sDDYUq7Sp-NOyqbc4pHiNuw3Pjol3yu-SwhMULJ_B313563LXLcZIYDAWTBSJ61fQ-nHpcuZGc0PkhdpKJucBZCrv6Sm3N9Z28wFrhNqD5SmMsq0Gg',
    'وفر 700 ج.س',
    10,
    true,
    'duo-box-combo'
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    title_en = EXCLUDED.title_en,
    description = EXCLUDED.description,
    image = EXCLUDED.image,
    badge = EXCLUDED.badge,
    discount_percentage = EXCLUDED.discount_percentage,
    active = EXCLUDED.active,
    linked_dish_id = EXCLUDED.linked_dish_id;
`;
