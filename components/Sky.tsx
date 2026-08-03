"use client";

function Cloud({
  top,
  scale,
  duration,
  delay,
  opacity,
}: {
  top: string;
  scale: number;
  duration: number;
  delay: number;
  opacity: number;
}) {
  return (
    <div
      className="absolute animate-drift"
      style={{
        top,
        left: 0,
        animationDuration: `${duration}s`,
        animationDelay: `${delay}s`,
        opacity,
        transform: `scale(${scale})`,
      }}
    >
      <svg width="220" height="90" viewBox="0 0 220 90" fill="none">
        <ellipse cx="60" cy="55" rx="60" ry="32" fill="white" />
        <ellipse cx="120" cy="40" rx="50" ry="40" fill="white" />
        <ellipse cx="165" cy="58" rx="45" ry="26" fill="white" />
        <ellipse cx="95" cy="65" rx="70" ry="24" fill="white" />
      </svg>
    </div>
  );
}

function Star({ top, left, delay }: { top: string; left: string; delay: number }) {
  return (
    <div
      className="absolute h-1 w-1 rounded-full bg-white animate-twinkle"
      style={{ top, left, animationDelay: `${delay}s` }}
    />
  );
}

export default function Sky() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-gradient-to-b from-skynight via-skydeep to-skymid">
      {/* stars, visible mostly in upper/darker part */}
      <div className="absolute inset-0">
        {Array.from({ length: 40 }).map((_, i) => (
          <Star
            key={i}
            top={`${Math.random() * 55}%`}
            left={`${Math.random() * 100}%`}
            delay={Math.random() * 3}
          />
        ))}
      </div>

      {/* soft glow near bottom, like dawn light */}
      <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-skyhigh/40 via-transparent to-transparent" />

      {/* drifting clouds */}
      <Cloud top="8%" scale={0.9} duration={70} delay={0} opacity={0.18} />
      <Cloud top="20%" scale={1.3} duration={95} delay={-30} opacity={0.14} />
      <Cloud top="38%" scale={0.7} duration={60} delay={-10} opacity={0.22} />
      <Cloud top="55%" scale={1.1} duration={85} delay={-50} opacity={0.16} />
      <Cloud top="70%" scale={0.85} duration={75} delay={-20} opacity={0.2} />
      <Cloud top="85%" scale={1.4} duration={100} delay={-60} opacity={0.12} />
    </div>
  );
}
