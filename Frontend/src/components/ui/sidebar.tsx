"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, Transition } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  UserCircle,
  TrendingUp,
  Wallet,
  Activity,
  BrainCircuit,
  Dna,
  Newspaper,
  Rocket
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { useHomeMatches, useLiveTicker } from "@/features/dashboard/hooks";

const sidebarVariants = {
  open: {
    width: "16rem",
  },
  closed: {
    width: "3.5rem",
  },
};

const contentVariants = {
  open: { display: "block", opacity: 1 },
  closed: { display: "block", opacity: 1 },
};

const variants = {
  open: {
    x: 0,
    opacity: 1,
    transition: {
      x: { stiffness: 1000, velocity: -100 },
    },
  },
  closed: {
    x: -20,
    opacity: 0,
    transition: {
      x: { stiffness: 100 },
    },
  },
};

const transitionProps: Transition = {
  type: "tween",
  ease: "easeOut",
  duration: 0.2,
  staggerChildren: 0.1,
};

const staggerVariants = {
  open: {
    transition: { staggerChildren: 0.03, delayChildren: 0.02 },
  },
};

export function SessionNavBar() {
  const [isHovered, setIsHovered] = useState(false);
  const isCollapsed = !isHovered;
  const pathname = usePathname();
  const { data: tickers } = useLiveTicker();
  const { data: matches } = useHomeMatches();
  const primaryMarketHref = tickers?.[0]?.id ? `/trading/${tickers[0].id}` : "/dashboard";
  const primaryInsightHref = matches?.[0]?.id ? `/insights/${matches[0].id}` : "/dashboard";

  return (
    <motion.div
      className={cn(
        "sidebar z-40 shrink-0 border-r border-outline/10 relative",
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={isCollapsed ? "closed" : "open"}
      animate={isCollapsed ? "closed" : "open"}
      variants={sidebarVariants}
      transition={transitionProps}
      style={{ height: "calc(100vh - 64px)" }}
    >
      <motion.div
        className={`relative z-40 flex text-muted-foreground h-full shrink-0 flex-col bg-surface transition-all overflow-hidden`}
        variants={contentVariants}
      >
        <motion.ul variants={staggerVariants} className="flex h-full flex-col">
          <div className="flex grow flex-col items-center">
            <div className={cn("flex h-20 w-full shrink-0 items-center", isCollapsed ? "justify-center px-0" : "px-5")}>
              <Link href="/" className={cn("flex items-center gap-2", isCollapsed ? "justify-center" : "w-full")}>
                {!isCollapsed ? (
                  <span className="text-2xl font-extrabold tracking-tight text-on-surface">CricOptions</span>
                ) : (
                  <span className="text-2xl font-extrabold tracking-tight text-on-surface">C</span>
                )}
              </Link>
            </div>

            <div className="flex h-full w-full flex-col">
              <div className="flex grow flex-col gap-4">
                <ScrollArea className="h-16 grow px-2 pb-2">
                  <div className={cn("flex w-full flex-col gap-1")}>
                    
                    {!isCollapsed && (
                        <p className="px-2 py-1 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest whitespace-nowrap">
                          Main Workspace
                        </p>
                    )}

                    <Link
                      href="/dashboard"
                      className={cn(
                        "flex h-11 w-full flex-row items-center rounded-md px-3 py-2 transition hover:bg-surface-bright hover:text-on-surface text-on-surface-variant",
                        isCollapsed && "justify-center px-0",
                        pathname === "/dashboard" && "bg-primary/15 text-primary font-bold shadow-[inset_3px_0_0_rgba(14,165,233,0.9)] hover:bg-primary/20 hover:text-primary",
                      )}
                    >
                      <LayoutDashboard className="h-5 w-5 shrink-0" />
                      <motion.li variants={variants}>
                        {!isCollapsed && <p className="ml-3 text-sm whitespace-nowrap">Dashboard</p>}
                      </motion.li>
                    </Link>

                    <Link
                      href={primaryMarketHref}
                      className={cn(
                        "flex h-11 w-full flex-row items-center rounded-md px-3 py-2 transition hover:bg-surface-bright hover:text-on-surface text-on-surface-variant",
                        isCollapsed && "justify-center px-0",
                        pathname?.includes("/trading") && "bg-primary/15 text-primary font-bold shadow-[inset_3px_0_0_rgba(14,165,233,0.9)] hover:bg-primary/20 hover:text-primary",
                      )}
                    >
                      <TrendingUp className="h-5 w-5 shrink-0" />
                      <motion.li variants={variants}>
                        {!isCollapsed && <p className="ml-3 text-sm whitespace-nowrap">Trading Terminal</p>}
                      </motion.li>
                    </Link>

                    <Link
                      href="/portfolio"
                      className={cn(
                        "flex h-11 w-full flex-row items-center rounded-md px-3 py-2 transition hover:bg-surface-bright hover:text-on-surface text-on-surface-variant",
                        isCollapsed && "justify-center px-0",
                        pathname?.includes("/portfolio") && "bg-primary/15 text-primary font-bold shadow-[inset_3px_0_0_rgba(14,165,233,0.9)] hover:bg-primary/20 hover:text-primary",
                      )}
                    >
                      <Wallet className="h-5 w-5 shrink-0" />
                      <motion.li variants={variants}>
                        {!isCollapsed && <p className="ml-3 text-sm whitespace-nowrap">Portfolio Hub</p>}
                      </motion.li>
                    </Link>
                    
                    <Link
                      href="#"
                      className={cn(
                        "flex h-11 w-full flex-row items-center rounded-md px-3 py-2 transition hover:bg-surface-bright hover:text-on-surface text-on-surface-variant",
                        isCollapsed && "justify-center px-0",
                      )}
                    >
                      <Activity className="h-5 w-5 shrink-0" />
                      <motion.li variants={variants}>
                        {!isCollapsed && <p className="ml-3 text-sm whitespace-nowrap">Market Scanner</p>}
                      </motion.li>
                    </Link>

                    <Separator className="w-full my-2 bg-outline/10" />

                    {!isCollapsed && (
                        <p className="px-2 py-1 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest whitespace-nowrap">
                          Intelligence HQ
                        </p>
                    )}

                    <Link
                      href={primaryInsightHref}
                      className={cn(
                        "flex h-11 w-full flex-row items-center rounded-md px-3 py-2 transition hover:bg-surface-bright hover:text-on-surface text-on-surface-variant",
                        isCollapsed && "justify-center px-0",
                        pathname?.includes("/insights") && "bg-primary/15 text-primary font-bold shadow-[inset_3px_0_0_rgba(14,165,233,0.9)] hover:bg-primary/20 hover:text-primary",
                      )}
                    >
                      <BrainCircuit className="h-5 w-5 shrink-0" />
                      <motion.li variants={variants}>
                        {!isCollapsed && (
                          <div className="ml-3 flex items-center gap-2 whitespace-nowrap">
                            <p className="text-sm">Intelligence HQ</p>
                            <Badge className="h-fit w-fit items-center gap-1.5 rounded border-none bg-primary/20 px-1.5 text-primary text-[10px]" variant="outline">
                              BETA
                            </Badge>
                          </div>
                        )}
                      </motion.li>
                    </Link>

                    <Link
                      href={primaryInsightHref}
                      className={cn(
                        "flex h-11 w-full flex-row items-center rounded-md px-3 py-2 transition hover:bg-surface-bright hover:text-on-surface text-on-surface-variant",
                        isCollapsed && "justify-center px-0",
                      )}
                    >
                      <Dna className="h-5 w-5 shrink-0" />
                      <motion.li variants={variants}>
                        {!isCollapsed && <p className="ml-3 text-sm whitespace-nowrap">DNA Engine</p>}
                      </motion.li>
                    </Link>
                    
                    <Link
                      href="#"
                      className={cn(
                        "flex h-11 w-full flex-row items-center rounded-md px-3 py-2 transition hover:bg-surface-bright hover:text-on-surface text-on-surface-variant",
                        isCollapsed && "justify-center px-0",
                      )}
                    >
                      <Newspaper className="h-5 w-5 shrink-0" />
                      <motion.li variants={variants}>
                        {!isCollapsed && <p className="ml-3 text-sm whitespace-nowrap">News Terminal</p>}
                      </motion.li>
                    </Link>

                  </div>
                </ScrollArea>
              </div>
              
              <div className="flex flex-col p-2 border-t border-outline/10">
                <Link
                  href="/profile"
                  className={cn(
                    "mt-auto flex h-9 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-surface-bright hover:text-on-surface text-on-surface-variant",
                    isCollapsed && "justify-center px-0"
                  )}
                >
                  <UserCircle className="h-5 w-5 shrink-0" />
                  <motion.li variants={variants}>
                    {!isCollapsed && <p className="ml-3 text-sm whitespace-nowrap">My Profile</p>}
                  </motion.li>
                </Link>
                
                <div className="mt-2">
                  <Link
                    href={primaryMarketHref}
                    className="w-full bg-primary text-on-primary font-bold h-9 rounded flex items-center justify-center gap-1.5 hover:brightness-110 active:scale-[0.98] transition-all text-[11px] uppercase tracking-wider overflow-hidden"
                  >
                    <Rocket className="h-4 w-4 shrink-0" />
                    <motion.li variants={variants}>
                      {!isCollapsed && <span className="whitespace-nowrap">Execute Trade</span>}
                    </motion.li>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.ul>
      </motion.div>
    </motion.div>
  );
}
