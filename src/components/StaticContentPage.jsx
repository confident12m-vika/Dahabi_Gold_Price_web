import { useLang } from '../contexts/LangContext';

// يعرض محتوى HTML ثابت (نصوص طويلة جاهزة) باللغة الحالية —
// يُستخدم لصفحات الخصوصية/من نحن/بريميوم بعد تحويلها لأجزاء من التطبيق.
export default function StaticContentPage({ content }) {
  const { lang } = useLang();
  return (
    <div className="view-inner">
      <div className="static-content" dangerouslySetInnerHTML={{ __html: content[lang] || content.ar }} />
    </div>
  );
}
