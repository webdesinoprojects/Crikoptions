import { ProfileManager } from "@/features/auth/components/ProfileManager";

export const metadata = {
  title: "Profile | CricOptions",
  description: "View and update your profile and trading settings.",
};

export default function ProfilePage() {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden select-none bg-[#020617] relative">
      {/* Subtle background glow for the premium theme */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-sky-900/10 to-transparent pointer-events-none"></div>
      
      <div className="flex-1 overflow-y-auto relative z-10 p-4 md:p-8">
        <ProfileManager />
      </div>
    </div>
  );
}
