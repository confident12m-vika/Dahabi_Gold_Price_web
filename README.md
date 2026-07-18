# ذهبي · Dahabi — تطبيق الويب (React + Vite)

مشروع React حقيقي (Vite)، **مبني ومُختبر بالفعل بأمر `npm run build`** — صفر أخطاء.

## التشغيل

```bash
npm install
npm run dev       # معاينة محلية (http://localhost:5173)
npm run build     # بناء نسخة الإنتاج → مجلد dist/
npm run preview   # معاينة نسخة الإنتاج المبنية
```

## هيكل المشروع

```
src/
├── main.jsx              نقطة الدخول — يجمّع كل السياقات (Contexts)
├── App.jsx                التوجيه (Routes) والتخطيط العام
├── index.css               التصميم الكامل (بهوية التطبيق: كريمي/ذهبي)
├── contexts/
│   ├── LangContext.jsx        اللغة (4 لغات) + الترجمة
│   ├── AuthContext.jsx        تسجيل الدخول (نفس حساب التطبيق)
│   ├── MarketContext.jsx      الأسعار الحية (من التخزين المركزي)
│   ├── CurrencyContext.jsx    العملة الأساسية المشتركة
│   └── DataContext.jsx        الأزواج والمدخرات (محلي/بعيد تلقائياً)
├── lib/
│   ├── supabase.js             كل اتصالات Supabase (أسعار، مصادقة، بيانات)
│   └── localStore.js           تخزين محلي لوضع الزائر
├── components/                عناصر مشتركة (شريط علوي، قوائم، نافذة منبثقة)
└── pages/                     Home, Pairs, Calculator, Converter, Exchange, Settings, Profile
```

## المزامنة مع تطبيق الجوال

يستخدم **نفس مشروع Supabase ونفس المفتاح**. المستخدم المسجّل بالتطبيق
يسجّل دخول بنفس البريد وكلمة السر بالويب، ويشوف نفس أزواجه ومدخراته
فوراً (جداول `favorites` و`savings` الحقيقية). قبل تسجيل الدخول،
البيانات تُحفظ محلياً بالمتصفح فقط.

## الرفع على GitHub Pages

بما إنه مشروع React (يحتاج بناء)، الرفع مختلف شوي عن الصفحات السابقة:

```bash
npm install --save-dev gh-pages
```

أضف بـ `package.json`:
```json
"homepage": "https://USERNAME.github.io/REPO_NAME",
"scripts": { "deploy": "vite build && gh-pages -d dist" }
```

```bash
npm run deploy
```

أو ببساطة: `npm run build`، وارفع محتوى مجلد `dist/` كملفات ثابتة
لأي استضافة (GitHub Pages، Netlify، Vercel).
