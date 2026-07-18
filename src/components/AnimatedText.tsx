import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { COLORS } from '../theme';

interface TextProps {
  children: React.ReactNode;
  delay?: number;
  font?: string;
  size?: number;
  color?: string;
  weight?: number;
  dir?: 'rtl' | 'ltr';
  glow?: boolean;
}

// نص يظهر بحركة صعود + تلاشٍ للداخل
export const FadeUpText: React.FC<TextProps> = ({
  children,
  delay = 0,
  font,
  size = 48,
  color = COLORS.white,
  weight = 600,
  dir = 'rtl',
  glow = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 200 },
  });

  const opacity = interpolate(frame - delay, [0, 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const translateY = interpolate(progress, [0, 1], [40, 0]);

  return (
    <div
      dir={dir}
      style={{
        fontFamily: font,
        fontSize: size,
        color,
        fontWeight: weight,
        opacity,
        transform: `translateY(${translateY}px)`,
        textAlign: 'center',
        lineHeight: 1.3,
        textShadow: glow ? `0 0 30px ${COLORS.gold}` : 'none',
        padding: '0 60px',
      }}
    >
      {children}
    </div>
  );
};

// عنوان ذهبي كبير بلمعة
export const GoldTitle: React.FC<TextProps> = ({
  children,
  delay = 0,
  font,
  size = 130,
  dir = 'rtl',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame: frame - delay,
    fps,
    config: { damping: 12, mass: 0.8 },
  });
  const opacity = interpolate(frame - delay, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // لمعة تمر على النص
  const shimmer = interpolate(
    (frame - delay) % 90,
    [0, 45, 90],
    [-100, 100, 100]
  );

  return (
    <div
      dir={dir}
      style={{
        fontFamily: font,
        fontSize: size,
        fontWeight: 800,
        opacity,
        transform: `scale(${scale})`,
        textAlign: 'center',
        background: `linear-gradient(${90 + shimmer}deg, ${COLORS.goldDark}, ${COLORS.goldLight}, ${COLORS.gold})`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        letterSpacing: 2,
        filter: `drop-shadow(0 0 40px rgba(212,175,55,0.5))`,
      }}
    >
      {children}
    </div>
  );
};

// عنصر ميزة (أيقونة + نص) يدخل من الجانب
export const FeatureRow: React.FC<{
  text: string;
  index: number;
  baseDelay: number;
  font?: string;
  dir?: 'rtl' | 'ltr';
}> = ({ text, index, baseDelay, font, dir = 'rtl' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const delay = baseDelay + index * 12;

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 200 },
  });
  const opacity = interpolate(frame - delay, [0, 12], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const offset = dir === 'rtl' ? 60 : -60;
  const translateX = interpolate(progress, [0, 1], [offset, 0]);

  return (
    <div
      dir={dir}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 24,
        opacity,
        transform: `translateX(${translateX}px)`,
        margin: '28px 0',
        justifyContent: dir === 'rtl' ? 'flex-end' : 'flex-start',
        flexDirection: dir === 'rtl' ? 'row' : 'row',
      }}
    >
      {/* نقطة ذهبية */}
      <div
        style={{
          minWidth: 16,
          width: 16,
          height: 16,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${COLORS.goldLight}, ${COLORS.goldDark})`,
          boxShadow: `0 0 20px ${COLORS.gold}`,
          order: dir === 'rtl' ? 2 : 0,
        }}
      />
      <span
        style={{
          fontFamily: font,
          fontSize: 46,
          color: COLORS.white,
          fontWeight: 500,
        }}
      >
        {text}
      </span>
    </div>
  );
};
