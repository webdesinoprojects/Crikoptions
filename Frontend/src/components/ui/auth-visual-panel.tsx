"use client";

const AUTH_BANNER_SRC = "/signup-stadium-bg.jpg";

export function AuthVisualPanel() {
  return (
    <div className="relative hidden h-full min-w-0 flex-[1.1] overflow-hidden bg-[#020617] md:block">
      <img
        src={AUTH_BANNER_SRC}
        alt="CricOptions Stadium"
        className="block h-full w-full object-cover object-center select-none transition-transform duration-700 hover:scale-105"
        draggable={false}
      />
      {/* Dark gradient overlay for visual depth */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#030814]/30 to-[#030814]/90 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#030814]/60 via-transparent to-transparent pointer-events-none" />
      
      {/* Overlay Content */}
      <div className="absolute inset-0 z-10 flex flex-col justify-start pt-16 md:pt-20 lg:pt-24 px-8 md:px-12 lg:px-20 pointer-events-none">
        <div className="max-w-fit rounded-3xl bg-white/[0.02] backdrop-blur-lg border border-white/10 p-6 md:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-medium tracking-tight text-white leading-[1.05]">
            Dopamine,<br />
            <span className="italic text-emerald-400">Delivered Ball by Ball.</span>
          </h1>
          
          <p className="mt-5 text-lg md:text-xl font-medium text-white/90">
            Every Innings Feels Like Expiry.
          </p>
        </div>
      </div>
    </div>
  );
}

