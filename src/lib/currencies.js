// ═══════════════════════════════════════════════
// عملات حقيقية فقط (نستثني الرموز الرقمية/كريبتو
// اللي يرجعها مزوّد الأسعار ضمن نفس القائمة)
// ═══════════════════════════════════════════════

// قائمة رموز ISO 4217 الحقيقية (عملات دول فعلية)
export const FIAT_CODES = new Set([
  'AED','AFN','ALL','AMD','ANG','AOA','ARS','AUD','AWG','AZN',
  'BAM','BBD','BDT','BGN','BHD','BIF','BMD','BND','BOB','BRL','BSD','BTN','BWP','BYN','BZD',
  'CAD','CDF','CHF','CLP','CNY','COP','CRC','CUC','CUP','CVE','CZK',
  'DJF','DKK','DOP','DZD',
  'EGP','ERN','ETB','EUR',
  'FJD','FKP',
  'GBP','GEL','GHS','GIP','GMD','GNF','GTQ','GYD',
  'HKD','HNL','HRK','HTG','HUF',
  'IDR','ILS','INR','IQD','IRR','ISK',
  'JEP','JMD','JOD','JPY',
  'KES','KGS','KHR','KMF','KPW','KRW','KWD','KYD','KZT',
  'LAK','LBP','LKR','LRD','LSL','LYD',
  'MAD','MDL','MGA','MKD','MMK','MNT','MOP','MRU','MUR','MVR','MWK','MXN','MYR','MZN',
  'NAD','NGN','NIO','NOK','NPR','NZD',
  'OMR',
  'PAB','PEN','PGK','PHP','PKR','PLN','PYG',
  'QAR',
  'RON','RSD','RUB','RWF',
  'SAR','SBD','SCR','SDG','SEK','SGD','SHP','SLE','SLL','SOS','SRD','SSP','STN','SYP','SZL',
  'THB','TJS','TMT','TND','TOP','TRY','TTD','TWD','TZS',
  'UAH','UGX','USD','UYU','UZS',
  'VES','VND','VUV',
  'WST',
  'XAF','XCD','XOF','XPF',
  'YER',
  'ZAR','ZMW','ZWL',
]);

// أسماء العملات الأكثر استخداماً (مترجمة) — الباقي يعرض الرمز فقط
export const CURRENCY_NAMES = {
  SAR: { ar: 'ريال سعودي', en: 'Saudi Riyal', es: 'Riyal Saudí', ru: 'Саудовский риял' },
  USD: { ar: 'دولار أمريكي', en: 'US Dollar', es: 'Dólar Estadounidense', ru: 'Доллар США' },
  EUR: { ar: 'يورو', en: 'Euro', es: 'Euro', ru: 'Евро' },
  AED: { ar: 'درهم إماراتي', en: 'UAE Dirham', es: 'Dírham de EAU', ru: 'Дирхам ОАЭ' },
  EGP: { ar: 'جنيه مصري', en: 'Egyptian Pound', es: 'Libra Egipcia', ru: 'Египетский фунт' },
  KWD: { ar: 'دينار كويتي', en: 'Kuwaiti Dinar', es: 'Dinar Kuwaití', ru: 'Кувейтский динар' },
  QAR: { ar: 'ريال قطري', en: 'Qatari Riyal', es: 'Riyal Catarí', ru: 'Катарский риял' },
  BHD: { ar: 'دينار بحريني', en: 'Bahraini Dinar', es: 'Dinar Bareiní', ru: 'Бахрейнский динар' },
  OMR: { ar: 'ريال عماني', en: 'Omani Rial', es: 'Rial Omaní', ru: 'Оманский риал' },
  JOD: { ar: 'دينار أردني', en: 'Jordanian Dinar', es: 'Dinar Jordano', ru: 'Иорданский динар' },
  YER: { ar: 'ريال يمني', en: 'Yemeni Rial', es: 'Rial Yemení', ru: 'Йеменский риал' },
  GBP: { ar: 'جنيه إسترليني', en: 'British Pound', es: 'Libra Esterlina', ru: 'Фунт стерлингов' },
  TRY: { ar: 'ليرة تركية', en: 'Turkish Lira', es: 'Lira Turca', ru: 'Турецкая лира' },
  IQD: { ar: 'دينار عراقي', en: 'Iraqi Dinar', es: 'Dinar Iraquí', ru: 'Иракский динар' },
  JPY: { ar: 'ين ياباني', en: 'Japanese Yen', es: 'Yen Japonés', ru: 'Японская иена' },
  CNY: { ar: 'يوان صيني', en: 'Chinese Yuan', es: 'Yuan Chino', ru: 'Китайский юань' },
  INR: { ar: 'روبية هندية', en: 'Indian Rupee', es: 'Rupia India', ru: 'Индийская рупия' },
  PKR: { ar: 'روبية باكستانية', en: 'Pakistani Rupee', es: 'Rupia Pakistaní', ru: 'Пакистанская рупия' },
  MAD: { ar: 'درهم مغربي', en: 'Moroccan Dirham', es: 'Dírham Marroquí', ru: 'Марокканский дирхам' },
  DZD: { ar: 'دينار جزائري', en: 'Algerian Dinar', es: 'Dinar Argelino', ru: 'Алжирский динар' },
  TND: { ar: 'دينار تونسي', en: 'Tunisian Dinar', es: 'Dinar Tunecino', ru: 'Тунисский динар' },
  LYD: { ar: 'دينار ليبي', en: 'Libyan Dinar', es: 'Dinar Libio', ru: 'Ливийский динар' },
  SDG: { ar: 'جنيه سوداني', en: 'Sudanese Pound', es: 'Libra Sudanesa', ru: 'Суданский фунт' },
  SYP: { ar: 'ليرة سورية', en: 'Syrian Pound', es: 'Libra Siria', ru: 'Сирийский фунт' },
  LBP: { ar: 'ليرة لبنانية', en: 'Lebanese Pound', es: 'Libra Libanesa', ru: 'Ливанский фунт' },
  RUB: { ar: 'روبل روسي', en: 'Russian Ruble', es: 'Rublo Ruso', ru: 'Российский рубль' },
  CAD: { ar: 'دولار كندي', en: 'Canadian Dollar', es: 'Dólar Canadiense', ru: 'Канадский доллар' },
  AUD: { ar: 'دولار أسترالي', en: 'Australian Dollar', es: 'Dólar Australiano', ru: 'Австралийский доллар' },
  CHF: { ar: 'فرنك سويسري', en: 'Swiss Franc', es: 'Franco Suizo', ru: 'Швейцарский франк' },
};

export function currencyName(code, lang) {
  return CURRENCY_NAMES[code]?.[lang] || code;
}
