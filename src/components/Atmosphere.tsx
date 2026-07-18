import { interpolate, useCurrentFrame, random } from 'remotion';
import { COLORS } from '../theme';

// خلفية متدرّجة فخمة مع توهّج ذهبي متحرك
export const LuxuryBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const glow = interpolate(
    Math.sin(frame / 40),
    [-1, 1],
    [0.15, 0.35]
  );
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: COLORS.bg,
        overflow: 'hidden',
      }}
    >
      {/* توهّج ذهبي مركزي يتنفّس */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 1200,
          height: 1200,
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(212,175,55,${glow}) 0%, rgba(212,175,55,0) 65%)`,
          filter: 'blur(40px)',
        }}
      />
    </div>
  );
};

// جسيمات ذهبية طافية
export const GoldParticles: React.FC<{ count?: number }> = ({ count = 24 }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {new Array(count).fill(0).map((_, i) => {
        const seed = i + 1;
        const x = random(`x${seed}`) * 1080;
        const baseY = random(`y${seed}`) * 1920;
        const speed = 0.3 + random(`s${seed}`) * 0.7;
        const size = 2 + random(`sz${seed}`) * 4;
        const y = (baseY - frame * speed) % 1920;
        const opacity = interpolate(
          Math.sin((frame + i * 20) / 30),
          [-1, 1],
          [0.2, 0.7]
        );
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y < 0 ? y + 1920 : y,
              width: size,
              height: size,
              borderRadius: '50%',
              background: COLORS.goldLight,
              opacity,
              boxShadow: `0 0 ${size * 2}px ${COLORS.gold}`,
            }}
          />
        );
      })}
    </div>
  );
};

// خط ذهبي مزخرف
export const GoldDivider: React.FC<{ width?: number; delay?: number }> = ({
  width = 200,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const w = interpolate(frame - delay, [0, 20], [0, width], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <div
      style={{
        width: w,
        height: 3,
        background: `linear-gradient(90deg, transparent, ${COLORS.gold}, transparent)`,
        margin: '20px auto',
      }}
    />
  );
};
