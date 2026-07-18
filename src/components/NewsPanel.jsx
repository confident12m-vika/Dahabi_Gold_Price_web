import { useState, useEffect } from 'react';
import { useLang } from '../contexts/LangContext';
import { fetchGoldNews } from '../lib/supabase';

// نفس مصدر الأخبار بالضبط اللي يستخدمه تطبيق الجوال (newsdata-proxy)
export default function NewsPanel() {
  const { t } = useLang();
  const [articles, setArticles] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchGoldNews().then((res) => { if (!cancelled) setArticles(res); });
    return () => { cancelled = true; };
  }, []);

  function timeAgo(iso) {
    const diffMs = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 60) return `${t('time_ago_prefix')} ${mins} ${t('time_ago_min')}`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${t('time_ago_prefix')} ${hours} ${t('time_ago_hour')}`;
    const days = Math.floor(hours / 24);
    return `${t('time_ago_prefix')} ${days} ${t('time_ago_day')}`;
  }

  if (articles === null) return <p className="empty-hint">{t('status_loading')}</p>;

  return (
    <div className="news-list">
      {articles.map((a, i) => (
        a.link ? (
          <a key={i} className="news-row" href={a.link} target="_blank" rel="noreferrer">
            <div className="news-title">{a.title}</div>
            <div className="news-meta">{a.sourceName} · {timeAgo(a.publishedAt)}</div>
          </a>
        ) : (
          <div key={i} className="news-row">
            <div className="news-title">{a.title}</div>
            <div className="news-meta">{a.sourceName} · {timeAgo(a.publishedAt)}</div>
          </div>
        )
      ))}
    </div>
  );
}
