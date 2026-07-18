import { interpolate, useCurrentFrame, spring, useVideoConfig } from 'remotion';
import { COLORS } from '../theme';

// ═══════════════════════════════════════════════
// محاكاة واجهة تطبيق ذهبي الحقيقية (بأسعار افتراضية)
// مطابقة لتصميم الشاشة الرئيسية: بطاقتان + شبكة أزرار + شريط سفلي
// ═══════════════════════════════════════════════

// رقم يعدّ تصاعدياً (لإحساس الأسعار الحية)
const useCountUp = (target: number, delay: number, dur = 40) => {
  const frame = useCurrentFrame();
  const v = interpolate(frame - delay, [0, dur], [target * 0.985, target], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return v;
};

export const AppMockup: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({ frame, fps, config: { damping: 200 } });
  const scale = interpolate(enter, [0, 1], [0.9, 1]);
  const opacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });

  const goldPrice = useCountUp(423.9013, 10);
  const silverPrice = useCountUp(7.0002, 10);

  return (
    <div
      style={{
        width: 460,
        height: 940,
        borderRadius: 46,
        background: '#FDFBF7',
        border: `4px solid ${COLORS.gold}`,
        boxShadow: `0 0 70px rgba(212,175,55,0.45)`,
        overflow: 'hidden',
        transform: `scale(${scale})`,
        opacity,
        fontFamily: '"Cairo", sans-serif',
        display: 'flex',
        flexDirection: 'column',
        direction: 'rtl',
      }}
    >
      {/* الهيدر */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '24px 22px 12px',
        }}
      >
        <span style={{ color: COLORS.goldDark, fontSize: 20, fontWeight: 700 }}>
          ر.س ▾
        </span>
        <span style={{ fontSize: 30, fontWeight: 800, color: '#222' }}>ذهبي</span>
      </div>

      {/* البطاقتان */}
      <div style={{ display: 'flex', gap: 12, padding: '8px 18px' }}>
        {/* الفضة (رمادي) */}
        <PriceCard
          bg="linear-gradient(135deg, #BDBDBD, #9E9E9E)"
          price={silverPrice.toFixed(4)}
          unit="جرام · ر.س"
          badge="‰999"
          star={false}
        />
        {/* الذهب (ذهبي) */}
        <PriceCard
          bg={`linear-gradient(135deg, ${COLORS.goldLight}, ${COLORS.goldDark})`}
          price={goldPrice.toFixed(4)}
          unit="جرام · ر.س"
          badge="21"
          star
        />
      </div>

      {/* شريط التبويبات */}
      <div style={{ display: 'flex', gap: 8, padding: '10px 18px', overflow: 'hidden' }}>
        <Tab label="المزيد" active />
        <Tab label="الأخبار" />
        <Tab label="الأونصة" />
      </div>

      {/* شبكة الأزرار */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
          padding: '10px 18px',
          flex: 1,
        }}
      >
        <GridCard bg="#E8F0F5" icon="⇄" color="#3A7CA5" title="أسعار الصرف" sub="تحويل العملات لحظياً" delay={20} />
        <GridCard bg="#FBEEDC" icon="🔔" color="#E8912D" title="التنبيهات" sub="نبّهني عند وصول السعر" delay={28} />
        <GridCard bg="#F3E8F3" icon="⇆" color="#9C4DA0" title="محول العملات" sub="حوّل بين أي عملتين" delay={36} />
        <GridCard bg="#E6F2EA" icon="▣" color="#3AA55D" title="مدخراتي" sub="ينقلك مباشرة لمدخراتك" delay={44} />
      </div>

      {/* الشريط السفلي */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          padding: '14px 8px 18px',
          borderTop: '1px solid #EEE',
          background: '#FFF',
        }}
      >
        {['حسابي', 'الإعدادات', 'المحول', 'الحاسبات', 'الأزواج'].map((x) => (
          <NavItem key={x} label={x} />
        ))}
        <NavItem label="الرئيسية" active />
      </div>
    </div>
  );
};

const PriceCard: React.FC<{
  bg: string;
  price: string;
  unit: string;
  badge: string;
  star: boolean;
}> = ({ bg, price, unit, badge, star }) => (
  <div
    style={{
      flex: 1,
      background: bg,
      borderRadius: 22,
      padding: '18px 16px',
      color: '#fff',
      minHeight: 170,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
      <span style={{ fontSize: 18 }}>{star ? '★' : '●'}</span>
    </div>
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: 0.5 }}>{price}</div>
      <div style={{ fontSize: 14, opacity: 0.9, marginTop: 4 }}>{unit}</div>
    </div>
    <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
      <span style={{ background: 'rgba(0,0,0,0.18)', borderRadius: 10, padding: '4px 12px', fontSize: 14 }}>
        {badge} ▾
      </span>
    </div>
  </div>
);

const Tab: React.FC<{ label: string; active?: boolean }> = ({ label, active }) => (
  <div
    style={{
      background: active ? COLORS.gold : '#FFF',
      color: active ? '#fff' : '#B08D2E',
      border: `1px solid ${COLORS.gold}`,
      borderRadius: 16,
      padding: '8px 18px',
      fontSize: 16,
      fontWeight: 700,
      whiteSpace: 'nowrap',
    }}
  >
    {label}
  </div>
);

const GridCard: React.FC<{
  bg: string;
  icon: string;
  color: string;
  title: string;
  sub: string;
  delay: number;
}> = ({ bg, icon, color, title, sub, delay }) => {
  const frame = useCurrentFrame();
  const op = interpolate(frame - delay, [0, 12], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const y = interpolate(frame - delay, [0, 12], [20, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <div
      style={{
        background: bg,
        borderRadius: 20,
        padding: '20px 16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        opacity: op,
        transform: `translateY(${y}px)`,
      }}
    >
      <div style={{ fontSize: 34, color }}>{icon}</div>
      <div style={{ fontSize: 20, fontWeight: 700, color }}>{title}</div>
      <div style={{ fontSize: 13, color: '#999', textAlign: 'center' }}>{sub}</div>
    </div>
  );
};

const NavItem: React.FC<{ label: string; active?: boolean }> = ({ label, active }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
    <div
      style={{
        width: 22,
        height: 22,
        borderRadius: 6,
        background: active ? COLORS.gold : '#CCC',
      }}
    />
    <span style={{ fontSize: 11, color: active ? COLORS.goldDark : '#999' }}>{label}</span>
  </div>
);
