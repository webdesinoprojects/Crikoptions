"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  Bell,
  ChevronDown,
  Compass,
  History,
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
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const { data: tickers } = useLiveTicker();
  const { data: matches } = useHomeMatches();

  const primaryMarketHref = tickers?.[0]?.id ? `/trading/${tickers[0].id}` : "/dashboard";
  const primaryInsightHref = matches?.[0]?.id ? `/insights/${matches[0].id}` : "/dashboard";

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
    { name: "Trading Terminal", href: primaryMarketHref, icon: <TrendingUp className="w-4 h-4" /> },
    { name: "Portfolio Hub", href: "/portfolio", icon: <Activity className="w-4 h-4" /> },
    { name: "Intelligence HQ", href: primaryInsightHref, icon: <Compass className="w-4 h-4" /> },
    ...(user?.role === "admin"
      ? [{ name: "Admin Wallets", href: "/admin/wallets", icon: <Wallet className="w-4 h-4" /> }]
      : []),
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href.split("/").slice(0, 2).join("/"));
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b border-border/10 bg-background/95 px-6 shadow-[0_12px_48px_rgba(0,0,0,0.25)] backdrop-blur-xl select-none">
      <div className="flex items-center gap-8">
        <Link href="/dashboard" className="font-headline-md flex items-center gap-3 text-lg font-black uppercase tracking-wide text-white transition-opacity hover:opacity-95">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-[12px] font-extrabold tracking-normal text-black shadow-[0_0_28px_rgba(14,165,233,0.28)]">
            CO
          </span>
          CricOptions
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

      <div className="flex items-center gap-4">
        <WalletBalancePill enabled={isAuthenticated} />

        <div className="hidden sm:flex items-center gap-3 border-r border-border/15 pr-4">
          <button className="rounded-md p-2 text-muted-foreground transition-all hover:bg-muted/40 hover:text-foreground cursor-pointer">
            <Bell className="w-4 h-4" />
          </button>
          <button className="rounded-md p-2 text-muted-foreground transition-all hover:bg-muted/40 hover:text-foreground cursor-pointer">
            <History className="w-4 h-4" />
          </button>
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
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8 rounded bg-transparent border-border/15 hover:bg-muted/40">
                <Menu className="w-4 h-4 text-foreground" />
              </Button>
            </SheetTrigger>
            <SheetContent className="overflow-y-auto bg-background border-l border-border/10 text-foreground w-72">
              <SheetHeader className="text-left">
                <SheetTitle>
                  <Link href="/dashboard" className="font-bold text-base text-white tracking-wider flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-primary flex items-center justify-center text-[10px] text-black font-extrabold">
                      CO
                    </span>
                    CricOptions
                  </Link>
                </SheetTitle>
              </SheetHeader>

              <div className="my-8 flex flex-col gap-5">
                <nav className="flex flex-col gap-2">
                  {navItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
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
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
