import { useEffect, useRef } from 'react';

export default function LogoHero() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frameId: number;
    let t = 0;
    const mouse = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };

    const logo = containerRef.current?.querySelector('.logo-3d') as HTMLElement;
    const onMouse = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMouse);

    const tick = () => {
      t += 0.016;
      current.x += (mouse.x - current.x) * 0.06;
      current.y += (mouse.y - current.y) * 0.06;

      const floatY = Math.sin(t * 1.1) * 10;
      const rotX = -current.y * 12;
      const rotY = current.x * 14;

      if (logo) {
        logo.style.transform = `
          translateY(${floatY}px)
          rotateX(${rotX}deg)
          rotateY(${rotY}deg)
        `;
      }
      frameId = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('mousemove', onMouse);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[380px] sm:h-[450px] lg:h-[600px] flex items-center justify-center overflow-hidden"
      style={{ perspective: '900px' }}
    >
      {/* Radial background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 55% at 55% 50%, rgba(180,20,60,0.18) 0%, rgba(100,10,180,0.10) 50%, transparent 75%)',
        }}
      />

      {/* Orbit ring 1 */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 480, height: 480,
          border: '1px solid rgba(200,30,80,0.30)',
          borderRadius: '50%',
          transform: 'rotateX(72deg) rotateZ(20deg)',
          animation: 'orbitSpin1 18s linear infinite',
        }}
      />

      {/* Orbit ring 2 */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 560, height: 560,
          border: '1px solid rgba(120,20,200,0.22)',
          borderRadius: '50%',
          transform: 'rotateX(55deg) rotateZ(-30deg)',
          animation: 'orbitSpin2 26s linear infinite reverse',
        }}
      />

      {/* Particles */}
      {Array.from({ length: 18 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: i % 3 === 0 ? 4 : 2,
            height: i % 3 === 0 ? 4 : 2,
            background: i % 2 === 0 ? 'rgba(220,40,100,0.7)' : 'rgba(130,30,220,0.6)',
            left: `${10 + (i * 53) % 80}%`,
            top: `${8 + (i * 37) % 84}%`,
            animation: `particleDrift ${4 + (i % 5)}s ease-in-out ${i * 0.4}s infinite alternate`,
          }}
        />
      ))}

      {/* Logo — the actual 3D-feeling element */}
      <div
        className="logo-3d relative z-10 pointer-events-none select-none"
        style={{
          willChange: 'transform',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.05s linear',
        }}
      >
        {/* Shadow layer for depth */}
        <img
          src="/src/assets/images/logo-prime.png"
          alt=""
          aria-hidden
          style={{
            width: 340,
            height: 340,
            objectFit: 'contain',
            position: 'absolute',
            top: 18,
            left: 12,
            filter: 'blur(28px) brightness(0.5) saturate(2)',
            opacity: 0.55,
            transform: 'translateZ(-30px) scale(0.95)',
          }}
        />

        {/* Main logo */}
        <img
          src="/src/assets/images/logo-prime.png"
          alt="Prime Broadcast"
          style={{
            width: 340,
            height: 340,
            objectFit: 'contain',
            position: 'relative',
            filter:
              'drop-shadow(0 0 32px rgba(210,30,80,0.65)) drop-shadow(0 0 70px rgba(100,20,200,0.40)) drop-shadow(0 8px 24px rgba(0,0,0,0.6))',
          }}
        />
      </div>

      {/* Corner brackets */}
      <div className="absolute inset-10 pointer-events-none opacity-25">
        <div className="absolute top-0 left-0 w-5 h-5 border-l border-t border-pink-500" />
        <div className="absolute top-0 right-0 w-5 h-5 border-r border-t border-pink-500" />
        <div className="absolute bottom-0 left-0 w-5 h-5 border-l border-b border-pink-500" />
        <div className="absolute bottom-0 right-0 w-5 h-5 border-r border-b border-pink-500" />
      </div>

      {/* CSS keyframes */}
      <style>{`
        @keyframes orbitSpin1 { to { transform: rotateX(72deg) rotateZ(380deg); } }
        @keyframes orbitSpin2 { to { transform: rotateX(55deg) rotateZ(-390deg); } }
        @keyframes particleDrift {
          from { transform: translateY(0px) scale(1); opacity: 0.4; }
          to   { transform: translateY(-18px) scale(1.4); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
