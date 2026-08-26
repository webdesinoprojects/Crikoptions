"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  ChevronDown,
  Compass,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  TrendingUp,
  User,
  Wallet,
} from "lucide-react";
import { useAuthStore } from "@/features/auth/hooks/useAuth";
import { useHomeMatches, useLiveTicker } from "@/features/dashboard/hooks";
import { WalletBalancePill } from "@/features/wallet/components";
import { GlobalChat } from "@/features/chat/GlobalChat";
import { GlobalLeaderboard } from "@/features/leaderboard/GlobalLeaderboard";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export default function TopNavBar() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const isSimulatorRoute = pathname === "/simulator" || pathname.startsWith("/simulator/");
  const shouldLoadAccountShellData = !isSimulatorRoute;
  const { data: tickers } = useLiveTicker(shouldLoadAccountShellData);
  const { data: matches } = useHomeMatches(shouldLoadAccountShellData);

  const primaryMarketHref = tickers?.[0]?.id ? `/trading/${tickers[0].id}` : "/trading";
  const primaryInsightHref = matches?.[0]?.id ? `/insights/${matches[0].id}` : "/dashboard";

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    router.push("/login");
  };

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
    { name: "Trading Terminal", href: primaryMarketHref, icon: <TrendingUp className="w-4 h-4" /> },
    { name: "Simulator", href: "/simulator", icon: <Activity className="w-4 h-4" /> },
    { name: "Portfolio Hub", href: "/portfolio", icon: <Wallet className="w-4 h-4" /> },

    ...(user?.role === "admin"
      ? [{ name: "Admin", href: "/admin", icon: <Settings className="w-4 h-4" /> }]
      : []),
  ];
  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href.split("/").slice(0, 2).join("/"));
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center justify-between border-b border-border/10 bg-background/95 px-3 shadow-[0_12px_48px_rgba(0,0,0,0.25)] backdrop-blur-xl select-none sm:px-4 lg:h-16 lg:px-6">
      <div className="flex min-w-0 items-center gap-3 lg:gap-8">
        <Link href="/dashboard" className="font-headline-md flex min-w-0 items-center gap-0 lg:gap-1 text-sm font-black uppercase tracking-wide text-white transition-opacity hover:opacity-95 sm:text-base lg:text-lg">
          <img src="/cricoptions_logo.jpg" alt="CricOptions Logo" className="h-8 w-8 shrink-0 rounded-lg object-cover lg:h-9 lg:w-9 shadow-[0_0_28px_rgba(14,165,233,0.28)]" />
          <img src="/cricoptions.png" alt="CricOptions" className="h-9 sm:h-10 lg:h-11 w-auto object-contain" />
        </Link>
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`rounded-md px-4 py-2 text-sm font-semibold tracking-normal transition-all ${
                isActive(item.href)
                  ? "bg-primary/15 text-primary shadow-[inset_0_-2px_0_rgba(14,165,233,0.85),0_10px_28px_rgba(14,165,233,0.12)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex min-w-0 items-center gap-2 sm:gap-3 lg:gap-4">
        <div className="hidden md:block">
          <WalletBalancePill enabled={isAuthenticated && shouldLoadAccountShellData} />
        </div>

        <GlobalLeaderboard />
        <GlobalChat />

        <div className="hidden sm:flex items-center gap-3 border-r border-border/15 pr-4">
          <Link href="/profile" className="block rounded-md p-2 text-muted-foreground transition-all hover:bg-muted/40 hover:text-foreground">
            <Settings className="w-4 h-4" />
          </Link>
        </div>

        <div className="flex items-center">
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 cursor-pointer hover:opacity-90 select-none outline-none bg-transparent border-0 p-0 text-left">
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] text-foreground font-semibold leading-none mb-0.5 truncate max-w-[90px]">
                    {user.name}
                  </p>
                  <p className="text-[8px] text-primary font-bold leading-none tracking-wider">{user.tier || "STANDARD"}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#d4af37]/20 flex items-center justify-center border border-[#d4af37]/30">
                  <span className="text-[#d4af37] text-xs font-bold font-mono">
                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </span>
                </div>
                <ChevronDown className="w-3 h-3 text-muted-foreground hidden sm:block" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-surface border border-border/15 text-foreground">
                <DropdownMenuLabel className="text-[9px] uppercase text-muted-foreground font-bold tracking-wider px-2 py-1.5">
                  Account Console
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/profile")} className="text-xs cursor-pointer hover:bg-muted/50 py-1.5 px-2.5 rounded">
                  <User className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/portfolio")} className="text-xs cursor-pointer hover:bg-muted/50 py-1.5 px-2.5 rounded">
                  <Activity className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                  Portfolio Hub
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-xs text-destructive focus:text-destructive cursor-pointer hover:bg-destructive/10 py-1.5 px-2.5 rounded">
                  <LogOut className="w-3.5 h-3.5 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden sm:flex gap-2">
              <Button asChild variant="outline" size="sm" className="h-8 rounded-full text-xs font-bold px-4 hover:bg-muted/50 border-primary/20">
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild size="sm" className="h-8 rounded-full text-xs font-bold px-4 bg-primary hover:bg-primary/95 text-black">
                <Link href="/register">Sign up</Link>
              </Button>
            </div>
          )}
        </div>

        <div className="block lg:hidden">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8 rounded bg-transparent border-border/15 hover:bg-muted/40">
                <Menu className="w-4 h-4 text-foreground" />
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[min(21rem,calc(100vw-2rem))] overflow-y-auto border-l border-border/10 bg-background pb-[calc(1.5rem+env(safe-area-inset-bottom))] text-foreground">
              <SheetHeader className="text-left">
                <SheetTitle>
                  <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="font-bold text-base text-white tracking-wider flex items-center gap-0 transition-opacity hover:opacity-95">
                    <img src="/cricoptions_logo.jpg" alt="CricOptions Logo" className="h-6 w-6 rounded object-cover" />
                    <img src="/cricoptions.png" alt="CricOptions" className="h-8 sm:h-9 w-auto object-contain" />
                  </Link>
                </SheetTitle>
              </SheetHeader>

              <div className="my-8 flex flex-col gap-5">
                <nav className="flex flex-col gap-2">
                  {navItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        isActive(item.href)
                          ? "bg-primary/10 text-primary border-l-2 border-primary pl-2.5"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                      }`}
                    >
                      {item.icon}
                      {item.name}
                    </Link>
                  ))}
                </nav>
                <div className="rounded-lg border border-white/10 bg-white/5 p-3 md:hidden">
                  <WalletBalancePill enabled={isAuthenticated && shouldLoadAccountShellData} />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
