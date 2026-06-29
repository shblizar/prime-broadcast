      {/* SECTION 1: HERO SECTION - Reference Layout */}
      <section className="relative min-h-screen flex flex-col justify-between pt-28 pb-16 px-6 sm:px-10 lg:px-16 bg-black overflow-hidden">
        
        {/* Background radial glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/4 -translate-y-1/2 w-[700px] h-[700px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(160,20,60,0.13) 0%, rgba(80,10,150,0.07) 45%, transparent 70%)' }}
          />
        </div>

        {/* Top label */}
        <div className="relative z-10">
          <span className="text-[10px] font-mono tracking-[0.25em] text-zinc-500 uppercase">We Bring Your Moment</span>
        </div>

        {/* Main content: LEFT text + RIGHT logo */}
        <div className="flex-grow flex items-center relative z-10">
          <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-6 items-center">
            
            {/* LEFT: Text block */}
            <div className="flex flex-col gap-6 lg:gap-8">
              <h1 className="font-sans font-light text-5xl sm:text-6xl lg:text-7xl tracking-tighter leading-[1.02] text-white">
                TO MILLIONS<br />
                <span className="font-semibold">OF SCREENS</span>
              </h1>

              <p className="text-zinc-400 text-xs sm:text-sm max-w-xs leading-relaxed font-light">
                Professional live streaming, multi-camera production, and broadcast solution for events that matter.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => onViewChange('pricing')}
                  className="flex items-center gap-2 text-white border border-zinc-700 hover:border-zinc-400 px-6 py-3 rounded-full transition-all text-[10px] tracking-[0.2em] uppercase font-medium hover:bg-white/5 w-fit"
                >
                  <span>Explore Our Work</span>
                  <span className="w-6 h-6 rounded-full border border-zinc-600 flex items-center justify-center">
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </button>
              </div>

              {/* Section numbers — bottom left */}
              <div className="flex flex-col gap-2 pt-8 lg:pt-16">
                {['01', '02', '03', '04'].map((n, i) => (
                  <div key={n} className="flex items-center gap-3">
                    <span className={`font-mono text-[11px] ${i === 0 ? 'text-zinc-300' : 'text-zinc-600'}`}>{n}</span>
                    {i === 0 && <div className="w-8 h-px bg-zinc-600" />}
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT: Logo */}
            <div className="flex items-center justify-center lg:justify-end relative">
              <ThreeCameraHero />
            </div>

          </div>
        </div>

        {/* Bottom: WHO WE ARE strip */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-6 pt-8 border-t border-zinc-900">
          <div>
            <span className="text-[9px] font-mono tracking-[0.25em] text-zinc-500 uppercase block mb-2">Who We Are</span>
            <h2 className="text-xl sm:text-2xl font-light text-white tracking-tight">
              A Broadcast Partner<br />
              <span className="font-semibold">You Can Trust</span>
            </h2>
          </div>
          <div className="flex items-end justify-between gap-6">
            <p className="text-zinc-500 text-[11px] leading-relaxed max-w-xs">
              Prime Broadcast adalah production house dan live streaming company berbasis di Indonesia. Kami menghadirkan produksi berkualitas tinggi dengan teknologi andal dan tim berpengalaman.
            </p>
            <button
              onClick={() => onViewChange('pricing')}
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-[9px] font-mono tracking-widest uppercase shrink-0"
            >
              <Play className="w-8 h-8 rounded-full border border-zinc-700 p-2 hover:border-zinc-400 transition-colors" />
              <div className="text-left">
                <div className="text-white text-[9px] font-semibold tracking-wider">SHOWREEL</div>
                <div>Play Video</div>
              </div>
            </button>
          </div>
        </div>

        {/* SCROLL indicator — right side vertical */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2 pointer-events-none select-none hidden lg:flex">
          <div className="w-px h-16 bg-zinc-800" />
          <span className="font-mono text-[9px] tracking-[0.3em] text-zinc-600 uppercase"
            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
            Scroll
          </span>
        </div>

      </section>
