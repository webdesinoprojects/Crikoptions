import { ProfileManager } from "@/features/auth/components/ProfileManager";

export const metadata = {
  title: "Profile | CricOptions",
  description: "View and update your profile and trading settings.",
};

export default function ProfilePage() {
  return (
    <div className="relative flex min-h-full flex-1 flex-col overflow-x-hidden bg-[#020617] select-none lg:h-full lg:overflow-hidden">
      {/* Subtle background glow for the premium theme */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-sky-900/10 to-transparent pointer-events-none"></div>
      
      <div className="relative z-10 flex-1 p-3 sm:p-4 md:p-8 lg:overflow-y-auto">
        <ProfileManager />
      </div>
    </div>
  );
}
