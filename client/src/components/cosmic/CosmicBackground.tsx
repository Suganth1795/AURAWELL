import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  radius: number;
  baseAlpha: number;
  twinkleSpeed: number;
  twinklePhase: number;
  color: string;
}

export function CosmicBackground({ showBeam = true }: { showBeam?: boolean }): React.JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.3, targetX: 0.5, targetY: 0.3 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initStars();
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = e.clientX / window.innerWidth;
      mouseRef.current.targetY = e.clientY / window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Generate stars with soft cosmic hues
    const starColors = ['#ffffff', '#e0e7ff', '#c7d2fe', '#bae6fd', '#ddd6fe'];
    let stars: Star[] = [];

    const initStars = () => {
      const count = Math.min(Math.floor((width * height) / 9000), 130);
      stars = [];
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 1.3 + 0.4,
          baseAlpha: Math.random() * 0.6 + 0.2,
          twinkleSpeed: Math.random() * 0.02 + 0.008,
          twinklePhase: Math.random() * Math.PI * 2,
          color: starColors[Math.floor(Math.random() * starColors.length)],
        });
      }
    };

    initStars();

    const render = () => {
      // Mouse smooth interpolation
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      ctx.clearRect(0, 0, width, height);

      // Render ambient mouse nebula glow
      const mx = mouseRef.current.x * width;
      const my = mouseRef.current.y * height;
      const mouseGrad = ctx.createRadialGradient(mx, my, 0, mx, my, Math.min(width, height) * 0.45);
      mouseGrad.addColorStop(0, 'rgba(99, 102, 241, 0.12)');
      mouseGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.05)');
      mouseGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = mouseGrad;
      ctx.fillRect(0, 0, width, height);

      // Render gentle fixed nebula clouds
      const cloud1 = ctx.createRadialGradient(width * 0.8, height * 0.15, 0, width * 0.8, height * 0.15, width * 0.4);
      cloud1.addColorStop(0, 'rgba(139, 92, 246, 0.08)');
      cloud1.addColorStop(1, 'transparent');
      ctx.fillStyle = cloud1;
      ctx.fillRect(0, 0, width, height);

      // Render stars
      for (const star of stars) {
        star.twinklePhase += star.twinkleSpeed;
        const alpha = star.baseAlpha + Math.sin(star.twinklePhase) * 0.25;
        const currentAlpha = Math.max(0.05, Math.min(1, alpha));

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.globalAlpha = currentAlpha;
        ctx.fill();

        // Extra soft glow for larger stars
        if (star.radius > 1.2) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.radius * 2.2, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(165, 180, 252, 0.18)';
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1.0;

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden select-none" aria-hidden="true">
      {/* Dynamic Starfield & Nebula Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full opacity-35 dark:opacity-90 transition-opacity duration-300" />

      {/* Cosmic Aurora Light Beam from top-left (mirroring the radiant theme from Image 1) */}
      {showBeam && (
        <div
          className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full blur-[120px] opacity-60 dark:opacity-100 transition-opacity duration-1000"
          style={{
            background:
              'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, rgba(56, 189, 248, 0.18) 40%, rgba(139, 92, 246, 0.05) 70%, transparent 85%)',
          }}
        />
      )}

      {/* Subtle bottom-right cosmic glow */}
      <div
        className="absolute -bottom-32 -right-32 h-[500px] w-[500px] rounded-full blur-[140px] opacity-50 dark:opacity-100 transition-opacity duration-1000"
        style={{
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.16) 0%, rgba(59, 130, 246, 0.08) 50%, transparent 80%)',
        }}
      />
    </div>
  );
}
