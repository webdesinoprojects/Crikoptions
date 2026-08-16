import React from 'react';
import { Lock, MoreHorizontal } from 'lucide-react';
import { cn } from "@/lib/utils";
import { AcademyBadge } from "@/features/challenges/components/AcademyBadge";
import { getAcademyBadge } from "@/features/challenges/data/academy-badges";

// Define the type for the card data
export interface CardData {
  id: string;
  colorClass: string;
  date: string;
  title: string;
  description: string;
  progressPercent: string;
  progressValue: string;
  imgSrc1?: string;
  imgAlt1?: string;
  imgSrc2?: string;
  imgAlt2?: string;
  countdownText: string;
  isLocked?: boolean;
  badgeUnlocked?: boolean;
  badgeAcademyId?: string;
}

// Define the props for the Card component
interface CardProps {
  data: CardData;
  onClick?: () => void;
}

const CourseDesignCard: React.FC<CardProps> = ({ data, onClick }) => {
  const {
    colorClass,
    date,
    title,
    description,
    progressPercent,
    progressValue,
    imgSrc1,
    imgAlt1,
    imgSrc2,
    imgAlt2,
    countdownText,
    isLocked,
    badgeUnlocked,
    badgeAcademyId,
  } = data;
  const academyBadge = badgeAcademyId ? getAcademyBadge(badgeAcademyId) : undefined;

  // Map requested color classes to actual hex values to support opacity appending (e.g. `#10b98115`)
  const colorMap: Record<string, string> = {
    'green': '#10b981', // emerald-500
    'orange': '#f59e0b', // amber-500
    'red': '#f43f5e', // rose-500
    'blue': '#3b82f6', // blue-500
    'gold': '#d4af37',
    'cyan': '#06b6d4',
    'violet': '#8b5cf6',
  };

  const themeColor = colorMap[colorClass] || colorClass;

  return (
    <div 
      className={cn(
        "group relative rounded-[32px] p-6 transition-all duration-500 overflow-hidden cursor-pointer flex flex-col justify-between min-h-[300px] border border-white/5",
        isLocked ? "opacity-80" : "hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]"
      )}
      style={{ backgroundColor: "var(--bg-dark)" }}
      onClick={onClick}
    >
      {/* Locked overlay */}
      {isLocked && (
        <div className="absolute inset-0 bg-[#151419]/60 backdrop-blur-[2px] z-20 flex items-center justify-center transition-all group-hover:bg-[#151419]/50">
          <div className="flex flex-col items-center gap-3 scale-90 group-hover:scale-100 transition-transform">
            <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center backdrop-blur-md border border-white/10 shadow-xl">
              <Lock className="w-6 h-6 text-white/70" />
            </div>
            <span className="text-white/60 font-black uppercase tracking-widest text-[11px] bg-black/40 px-3 py-1 rounded-full border border-white/5">
              Locked Academy
            </span>
          </div>
        </div>
      )}

      {/* Background Accent Gradient */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none transition-opacity duration-700 group-hover:opacity-30" 
        style={{ background: `radial-gradient(circle at top right, ${themeColor}, transparent 65%)` }} 
      />

      <div className="relative z-10 flex flex-col h-full gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <span 
            className="px-3.5 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest"
            style={{ backgroundColor: `${themeColor}15`, color: themeColor }}
          >
            {date}
          </span>
          {badgeUnlocked && academyBadge ? (
            <span className="text-[11px] font-medium text-white/50">
              {academyBadge.rank}
            </span>
          ) : (
            <MoreHorizontal className="w-6 h-6 text-white/30 hover:text-white transition-colors" />
          )}
        </div>

        {/* Body */}
        <div className="flex-1 mt-4">
          <h3 className="text-2xl font-black text-white capitalize tracking-wide mb-2.5 line-clamp-2 drop-shadow-md">
            {title}
          </h3>
          <p className="text-sm text-white/50 line-clamp-2 leading-relaxed">
            {description}
          </p>

          <div className="mt-6">
            <div className="flex justify-between items-center text-[11px] font-bold text-white/70 mb-2.5 tracking-wider uppercase">
              <span>Progress</span>
              <span>{progressValue}</span>
            </div>
            <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden shadow-inner">
              <div 
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{ width: progressPercent, backgroundColor: themeColor }}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-5 border-t border-white/10 mt-auto">
          {academyBadge ? (
            <div className="flex items-center gap-2.5 min-w-0">
              <AcademyBadge badge={academyBadge} unlocked={Boolean(badgeUnlocked)} size="sm" />
              <div className="min-w-0">
                <p className={cn("truncate text-[12px] font-medium", badgeUnlocked ? "text-white/85" : "text-white/35")}>
                  {academyBadge.title}
                </p>
                <p className="text-[11px] text-white/35">
                  {badgeUnlocked ? "Earned" : "Locked"}
                </p>
              </div>
            </div>
          ) : <span />}
          <span 
            className="px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap tracking-wide"
            style={{ backgroundColor: `${themeColor}20`, color: themeColor, border: `1px solid ${themeColor}40` }}
          >
            {countdownText}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CourseDesignCard;
