// ═══════════════════════════════════════════════
// اتصال Supabase — نفس مشروع ومفتاح التطبيق بالضبط
// لا حاجة لحزمة supabase-js؛ نستخدم fetch مباشرة (أخف وأبسط)
// ═══════════════════════════════════════════════

export const SUPABASE_URL = 'https://pqwmzrnkrzqucrhyktel.supabase.co';
export const ANON_KEY = 'sb_publishable_ln1OqnzwKqTdcAt1TxXpBw_ECNd14MW';
export const MARKET_CACHE_URL = `${SUPABASE_URL}/functions/v1/market-cache`;

// يتحقق من نجاح أي طلب كتابة (POST/PATCH/DELETE) — يرمي خطأ واضح
// بدل الفشل الصامت (نفس الخطأ اللي اكتشفناه بالأزواج، نطبّق الحل بكل مكان).
async function ensureOk(res, label) {
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`${label} (${res.status}): ${errText}`);
  }
  return res;
}

// ─── الأسعار (نفس تخزين التطبيق المركزي) ───
export async function fetchMarketData() {
  const res = await fetch(MARKET_CACHE_URL, {
    headers: { Authorization: `Bearer ${ANON_KEY}` },
  });
  const body = await res.json();
  const goldUsd = body?.gold?.price ?? null;
  const silverUsd = body?.silver?.price ?? null;
  const rates = body?.rates?.rates ?? {};
  const yemen = body?.yemen ?? null;             // ← كانت مفقودة تماماً (سبب المشكلة)
  const yemenRates = body?.yemen_rates ?? null;   // جدول عملات اليمن الكامل (جديد)
  if (!goldUsd && !silverUsd) throw new Error('no data');
  return { goldUsd, silverUsd, rates, yemen, yemenRates };
}

import { FIAT_CODES } from './currencies';

export function currencyList(rates) {
  const codes = Object.keys(rates).filter((c) => FIAT_CODES.has(c)).sort();
  const preferred = ['SAR', 'USD', 'AED', 'EGP', 'KWD', 'QAR', 'BHD', 'OMR', 'JOD', 'YER', 'EUR', 'GBP', 'TRY'];
  return [...preferred.filter((c) => rates[c]), ...codes.filter((c) => !preferred.includes(c))];
}

// سعر الصرف اليمني (USD → YER) لكل مدينة — مصدر محلي مباشر،
// مختلف عن السعر العالمي العام لـYER (يعكس واقع السوق اليمني).
export function yemenUsdRate(marketData, city) {
  return marketData?.yemen?.[city] ?? null;
}

// سعر جرام الذهب/الفضة بالريال اليمني لمدينة معيّنة: نفس معادلة
// أي عملة بالضبط، لكن سعر الصرف يجي من المصدر اليمني المحلي.
export function yemenGramPrice(marketData, metalUsd, ratio, city) {
  const rate = yemenUsdRate(marketData, city);
  if (!rate || !metalUsd) return null;
  return (metalUsd / 31.1034) * ratio * rate;
}

// سعر الجرام لمعدن معيّن بعملة معيّنة
// سعر الجرام: نمرر نسبة النقاء صراحة (فرصة ذهب = عيار/24، نسبة فضة = نقاوة/1000)
// بدل افتراض قديم كان يفرض 999 على الفضة دائماً بالغلط.
export function gramPrice(marketData, metalUsd, purityRatio, currency) {
  if (!marketData || !metalUsd) return null;
  const rate = marketData.rates?.[currency];
  if (!rate) return null;
  return (metalUsd / 31.1034) * purityRatio * rate;
}
// سعر صرف عملة معيّنة مقابل الريال اليمني بمدينة معيّنة — نفس منطق
// ForexScreen بفلاتر بالضبط: لو العملة مدعومة مباشرة من مصدر اليمن
// نستخدمها كما هي، وإلا نحوّل عبر الدولار.
// ─── الأخبار (عبر نفس دالة السيرفر الوسيطة اللي يستخدمها التطبيق) ───
const NEWS_API_URL = `${SUPABASE_URL}/functions/v1/newsdata-proxy`;

const FALLBACK_NEWS = [
  { title: 'الذهب يرتفع وسط تذبذب الدولار العالمي', sourceName: 'أسواق الذهب', publishedAt: new Date(Date.now() - 2 * 3600000).toISOString() },
  { title: 'البنك المركزي اليمني يصدر تعميمًا حول سعر الصرف', sourceName: 'اقتصاد اليوم', publishedAt: new Date(Date.now() - 5 * 3600000).toISOString() },
  { title: 'محللون: تذبذب أسعار الذهب متوقع خلال الأسبوع القادم', sourceName: 'تحليل السوق', publishedAt: new Date(Date.now() - 86400000).toISOString() },
];

export function goldRatio(karat) { return karat / 24; }
export function silverRatio(purity) { return purity / 1000; }

export async function fetchGoldNews() {
  try {
    const url = new URL(NEWS_API_URL);
    url.searchParams.set('q', 'ذهب OR gold OR الذهب');
    url.searchParams.set('language', 'ar');
    url.searchParams.set('category', 'business');
    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${ANON_KEY}`, apikey: ANON_KEY },
    });
    if (!res.ok) throw new Error('bad status');
    const data = await res.json();
    if (data.status !== 'success') throw new Error('bad status field');
    const results = data.results || [];
    if (results.length === 0) return FALLBACK_NEWS;
    return results.map((e) => ({
      title: e.title || '',
      sourceName: e.source_id || e.source_name || 'مصدر غير معروف',
      publishedAt: e.pubDate ? e.pubDate.replace(' ', 'T') : new Date().toISOString(),
      link: e.link || null,
      description: e.description || null,
    }));
  } catch (_) {
    return FALLBACK_NEWS;
  }
}

// سعر صرف عملة معيّنة مقابل الريال اليمني بمدينة معيّنة — نفس منطق
// ForexScreen بفلاتر بالضبط: لو العملة مدعومة مباشرة من مصدر اليمن
// نستخدمها كما هي، وإلا نحوّل عبر الدولار.
export function yemenCurrencyRate(marketData, city, code) {
  const table = marketData?.yemenRates?.[city];
  if (!table) return null;
  if (table[code]) return table[code].buy;
  const usdEntry = table.USD;
  const usdToCode = marketData?.rates?.[code];
  if (!usdEntry || !usdToCode) return null;
  return usdEntry.buy / usdToCode;
}

// ─── المصادقة (Supabase Auth REST) ───
async function authRequest(path, body) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: ANON_KEY },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description || data.msg || data.error || 'Auth error');
  return data;
}

export async function authSignIn(email, password) {
  return authRequest('/token?grant_type=password', { email, password });
}

export async function authSignUp(email, password, name) {
  // redirect_to نتركه كشبكة أمان لو المستخدم ضغط الرابط بدل ما يدخل الكود —
  // لكن الاعتماد الأساسي الآن على كود التحقق (OTP) عبر authVerifyOtp أدناه.
  const redirectTo = window.location.origin + '/';
  return authRequest(`/signup?redirect_to=${encodeURIComponent(redirectTo)}`, {
    email, password, data: { full_name: name },
  });
}

// يتحقق من كود OTP المرسل بالبريد — يشتغل لكل من تأكيد التسجيل (type='signup')
// واسترجاع كلمة المرور (type='recovery'). النجاح يرجّع access_token جاهز للاستخدام.
export async function authVerifyOtp(email, token, type) {
  return authRequest('/verify', { email, token, type });
}

// يرسل بريد استرجاع كلمة المرور (يحتوي على كود OTP بدل رابط، بعد تعديل القالب بلوحة Supabase)
export async function authRecover(email) {
  const redirectTo = window.location.origin + '/';
  return authRequest(`/recover?redirect_to=${encodeURIComponent(redirectTo)}`, { email });
}

// يحدّث كلمة المرور — يُستخدم بجلسة الاسترجاع المؤقتة الناتجة عن authVerifyOtp(type='recovery')
export async function authUpdatePassword(accessToken, password) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', apikey: ANON_KEY, Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description || data.msg || data.error || 'Auth error');
  return data;
}

export async function authSignOut(accessToken) {
  try {
    await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
      method: 'POST',
      headers: { apikey: ANON_KEY, Authorization: `Bearer ${accessToken}` },
    });
  } catch (_) {}
}

export async function authGetUser(accessToken) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: ANON_KEY, Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('expired');
  return res.json();
}

export async function authRefresh(refreshToken) {
  return authRequest('/token?grant_type=refresh_token', { refresh_token: refreshToken });
}

// ─── جدول profiles (id, language, currency) ───
export async function fetchProfile(session) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/profiles?id=eq.${session.user.id}&select=language,currency`,
    { headers: { apikey: ANON_KEY, Authorization: `Bearer ${session.access_token}` } }
  );
  const rows = await res.json();
  return rows?.[0] ?? null;
}

export async function updateProfile(session, { language, currency }) {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${session.user.id}`, {
      method: 'PATCH',
      headers: {
        apikey: ANON_KEY, Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json', Prefer: 'return=minimal',
      },
      body: JSON.stringify({ language, currency }),
    });
  } catch (_) {}
}

// يستدعي Edge Function "delete-account" — يحذف الحساب حذفاً حقيقياً نهائياً
// من auth.users بالإضافة لكل بياناته. accessToken هنا لازم يكون ناتج تحقق
// كود OTP الأخير (إثبات ملكية حديث)، مو أي جلسة قديمة.
export async function deleteAccountEdgeFunction(accessToken) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/delete-account`, {
    method: 'POST',
    headers: { apikey: ANON_KEY, Authorization: `Bearer ${accessToken}` },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'delete failed');
  return data;
}

// ─── جدول favorites (id, user_id, metal, karat, currency) ───
export async function fetchFavorites(session) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/favorites?user_id=eq.${session.user.id}&select=*&order=created_at.asc`,
    { headers: { apikey: ANON_KEY, Authorization: `Bearer ${session.access_token}` } }
  );
  const rows = await res.json();
  // label = 'favorite' يعني مفضّل، أي قيمة ثانية (أو فاضية) يعني زوج عادي —
  // نفس منطق فلاتر بالضبط (favorites_provider.dart)
  return (rows || []).map((r) => ({
    id: r.id, metal: r.metal, karat: r.karat, currency: r.currency,
    isFavorite: r.label === 'favorite',
  }));
}

export async function addFavorite(session, { metal, karat, currency, isFavorite }) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/favorites`, {
    method: 'POST',
    headers: {
      apikey: ANON_KEY, Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json', Prefer: 'return=minimal',
    },
    body: JSON.stringify({
      user_id: session.user.id, metal, karat, currency,
      label: isFavorite ? 'favorite' : 'pair',
    }),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`فشل حفظ الزوج (${res.status}): ${errText}`);
  }
}

export async function removeFavorite(session, id) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/favorites?id=eq.${id}`, {
    method: 'DELETE',
    headers: { apikey: ANON_KEY, Authorization: `Bearer ${session.access_token}` },
  });
  await ensureOk(res, 'فشل حذف الزوج');
}

export async function toggleFavoriteFlag(session, id, isFavorite) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/favorites?id=eq.${id}`, {
    method: 'PATCH',
    headers: {
      apikey: ANON_KEY, Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json', Prefer: 'return=minimal',
    },
    body: JSON.stringify({ label: isFavorite ? 'favorite' : 'pair' }),
  });
  await ensureOk(res, 'فشل تحديث المفضلة');
}

// ─── جدول savings (id, user_id, grams, karat, buy_price_per_gram, currency, note, date) ───
// ملاحظة: مدينة اليمن (صنعاء/عدن) تُخزَّن داخل عمود note الموجود أصلاً
// (بصيغة "yemen_city:sanaa") — لتفادي أي تعديل بهيكل الجدول الحقيقي.
export async function fetchSavings(session) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/savings?user_id=eq.${session.user.id}&select=*&order=created_at.asc`,
    { headers: { apikey: ANON_KEY, Authorization: `Bearer ${session.access_token}` } }
  );
  const rows = await res.json();
  return (rows || []).map((r) => {
    // الصيغة الحقيقية بتطبيق فلاتر: note = "المدينة|ملاحظة" (مفصولة بخط عمودي)
    // نفكّها بنفس الطريقة تماماً لضمان توافق كامل مع أي مدخرة أنشأها التطبيق.
    const raw = r.note || '';
    const pipeIndex = raw.indexOf('|');
    const city = pipeIndex > -1 ? raw.slice(0, pipeIndex) : '';
    return {
      id: r.id, karat: r.karat, weight: r.grams, buyPrice: r.buy_price_per_gram, currency: r.currency,
      ...(city ? { city } : {}),
    };
  });
}

export async function addSaving(session, { karat, weight, buyPrice, currency, city }) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/savings`, {
    method: 'POST',
    headers: {
      apikey: ANON_KEY, Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json', Prefer: 'return=minimal',
    },
    body: JSON.stringify({
      user_id: session.user.id, karat, grams: weight,
      buy_price_per_gram: buyPrice, currency, date: new Date().toISOString(),
      // نفس صيغة تطبيق الجوال بالضبط: "المدينة|ملاحظة" — حتى لو مدينة فاضية
      note: `${city || ''}|`,
    }),
  });
  await ensureOk(res, 'فشل حفظ المدخرة');
}

export async function removeSaving(session, id) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/savings?id=eq.${id}`, {
    method: 'DELETE',
    headers: { apikey: ANON_KEY, Authorization: `Bearer ${session.access_token}` },
  });
  await ensureOk(res, 'فشل حذف المدخرة');
}

// ─── جدول alerts (id, user_id, metal, karat, currency, target_price, direction, is_active, city) ───
export async function fetchAlerts(session) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/alerts?user_id=eq.${session.user.id}&select=*&order=created_at.asc`,
    { headers: { apikey: ANON_KEY, Authorization: `Bearer ${session.access_token}` } }
  );
  const rows = await res.json();
  return (rows || []).map((r) => ({
    id: r.id, metal: r.metal, karat: r.karat, currency: r.currency,
    targetPrice: r.target_price, direction: r.direction, isActive: r.is_active, city: r.city,
  }));
}

export async function addAlert(session, { metal, karat, currency, targetPrice, direction, city }) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/alerts`, {
    method: 'POST',
    headers: {
      apikey: ANON_KEY, Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json', Prefer: 'return=minimal',
    },
    body: JSON.stringify({
      user_id: session.user.id, metal, karat, currency,
      target_price: targetPrice, direction, is_active: true, city: city || null,
    }),
  });
  await ensureOk(res, 'فشل حفظ التنبيه');
}

export async function removeAlert(session, id) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/alerts?id=eq.${id}`, {
    method: 'DELETE',
    headers: { apikey: ANON_KEY, Authorization: `Bearer ${session.access_token}` },
  });
  await ensureOk(res, 'فشل حذف التنبيه');
}

export async function toggleAlert(session, id, isActive) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/alerts?id=eq.${id}`, {
    method: 'PATCH',
    headers: {
      apikey: ANON_KEY, Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json', Prefer: 'return=minimal',
    },
    body: JSON.stringify({ is_active: isActive }),
  });
  await ensureOk(res, 'فشل تحديث التنبيه');
}
