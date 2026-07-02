      {/* SECTION 1: HERO SECTION - APPLE STYLE (REVISED: 2-COLUMN, TEXT LEFT / 3D RIGHT ON DESKTOP) */}
      <section className="relative min-h-[105vh] flex flex-col justify-between pt-32 pb-24 px-4 sm:px-6 lg:px-8 bg-black">

        {/* Soft elegant top ambient light */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[400px] bg-gradient-to-b from-zinc-800/20 via-transparent to-transparent pointer-events-none rounded-full blur-[120px] opacity-20" />

        {/* Grid wrapper: 1 column (stacked) on mobile, 2 columns (text | 3D) from lg breakpoint up */}
        <div className="max-w-7xl mx-auto w-full flex-grow grid grid-cols-1 lg:grid-cols-2 items-center gap-10 lg:gap-16 relative z-10 pt-6">

          {/* LEFT COLUMN: Headline, description, CTA buttons */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left gap-6 order-1">
            <h1 className="font-sans font-light text-4xl sm:text-6xl lg:text-6xl xl:text-7xl tracking-tighter leading-[1.05] text-white max-w-xl">
              Sinyal Tanpa Jeda.<br />
              <span className="font-semibold bg-gradient-to-b from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
                Visual Tanpa Batas.
              </span>
            </h1>

            <p className="text-zinc-400 text-xs sm:text-sm max-w-lg leading-relaxed font-sans font-light">
              Solusi penyiaran langsung kelas korporat tercanggih di Indonesia. Menghilangkan segala batasan operasional penyiaran dengan jaminan redundansi internet ganda dan perangkat tercanggih.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-center lg:justify-start w-full sm:w-auto">
              <button
                onClick={() => onViewChange('pricing')}
                className="flex items-center justify-center gap-2 bg-white hover:bg-zinc-200 text-zinc-950 font-medium px-8 py-3.5 rounded-lg transition-all text-xs tracking-wider uppercase cursor-pointer shadow-lg shadow-white/5 hover:scale-[1.01] active:scale-95 duration-200"
              >
                <span>Konfigurasi Jasa</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onViewChange('policies')}
                className="flex items-center justify-center gap-2 bg-zinc-950 hover:bg-zinc-900 text-zinc-300 border border-zinc-800 px-8 py-3.5 rounded-lg font-medium transition-all text-xs tracking-wider uppercase cursor-pointer hover:border-zinc-700 hover:scale-[1.01] active:scale-95 duration-200"
              >
                <span>Regulasi Kerja</span>
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: 3D Interactive Camera Canvas */}
          <div className="w-full order-2 relative">
            <ThreeCameraHero />
          </div>

        </div>

        {/* Arrow pointer down */}
        <div className="w-full flex justify-center pt-8 animate-bounce opacity-40">
          <div className="text-[10px] tracking-widest text-zinc-500 uppercase font-mono">
            Scroll Ke Bawah Untuk Portfolio
          </div>
        </div>

      </section>
