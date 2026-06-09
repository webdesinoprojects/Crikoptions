import { ProfileManager } from "@/features/auth/components/ProfileManager";

export const metadata = {
  title: "Profile Settings | PitchSide Pro Terminal",
  description: "Update your personal credentials and contact settings.",
};

export default function ProfilePage() {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden select-none p-6 bg-background">
      <div className="mb-6">
        <h1 className="text-sm font-bold text-white uppercase tracking-wider font-display">
          User Settings
        </h1>
        <p className="text-[9px] text-on-surface-variant">
          Configure profile settings, phone numbers, and security tokens.
        </p>
      </div>
      <div className="flex-1 overflow-y-auto">
        <ProfileManager />
      </div>
    </div>
  );
}
