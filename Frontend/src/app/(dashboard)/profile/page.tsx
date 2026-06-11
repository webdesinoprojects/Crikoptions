import { ProfileManager } from "@/features/auth/components/ProfileManager";

export const metadata = {
  title: "Profile Settings | PitchSide Pro Terminal",
  description: "Update your personal credentials and contact settings.",
};

export default function ProfilePage() {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden select-none p-4 md:p-8 bg-background relative">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
      
      <div className="mb-8 relative z-10">
        <h1 className="text-xl font-black text-white uppercase tracking-widest font-mono drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
          [ SYSTEM CONFIGURATION ]
        </h1>
        <p className="text-[10px] text-on-surface-variant font-mono uppercase tracking-wider mt-1">
          Access control, risk limits, and terminal preferences.
        </p>
      </div>
      <div className="flex-1 overflow-y-auto relative z-10 pb-10">
        <ProfileManager />
      </div>
    </div>
  );
}
