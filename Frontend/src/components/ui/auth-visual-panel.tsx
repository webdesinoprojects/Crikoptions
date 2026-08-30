"use client";

const AUTH_BANNER_SRC = "/Gemini_Generated_Image_d2gjynd2gjynd2gj-clean.png";

export function AuthVisualPanel() {
  return (
    <div className="relative hidden h-full min-w-0 flex-[1.1] overflow-hidden bg-[#020617] md:block">
      <img
        src={AUTH_BANNER_SRC}
        alt="CricOptions — live matchday game with CricCoins, trading terminal, challenges, and leaderboard"
        className="block h-full w-full object-contain object-center select-none"
        draggable={false}
      />
    </div>
  );
}
