"use client";

import React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { 
  Menu, 
  User, 
  LogOut, 
  Bell, 
  History, 
  Settings, 
  ChevronDown, 
  Compass, 
  LayoutDashboard, 
  TrendingUp, 
  Activity 
} from "lucide-react";
import { useAuthStore } from "@/features/auth/hooks/useAuth";
import { LiveMarketTicker } from "@/features/dashboard/components/LiveMarketTicker";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function TopNavBar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const navItems = [
    { name: "Dashboard", href: "/", icon: <LayoutDashboard className="w-4 h-4" /> },
    { name: "Trading Terminal", href: "/trading/market-1", icon: <TrendingUp className="w-4 h-4" /> },
    { name: "Portfolio Hub", href: "/portfolio", icon: <Activity className="w-4 h-4" /> },
    { name: "Intelligence HQ", href: "/insights/csk-vs-mi", icon: <Compass className="w-4 h-4" /> },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href.split("/").slice(0, 2).join("/"));
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-14 bg-background border-b border-border/10 select-none">
      {/* Brand logo & desktop navigation */}
      <div className="flex items-center gap-8">
        <Link href="/" className="font-headline-md text-base font-bold text-white uppercase tracking-wider flex items-center gap-2 hover:opacity-95 transition-opacity">
          <span className="w-5 h-5 rounded bg-primary flex items-center justify-center text-[10px] text-black font-extrabold tracking-normal">
            CO
          </span>
          CrikOptions
        </Link>
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-1 rounded text-xs font-semibold tracking-wide transition-all ${
                isActive(item.href)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* Live Market Ticker center rail */}
      <div className="hidden md:flex items-center gap-4 flex-1 max-w-xl xl:max-w-2xl px-8">
        <div className="w-full">
          <LiveMarketTicker />
        </div>
      </div>

      {/* Right control menu (desktop) */}
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-3 border-r border-border/15 pr-4">
          <button className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all cursor-pointer">
            <Bell className="w-4 h-4" />
          </button>
          <button className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all cursor-pointer">
            <History className="w-4 h-4" />
          </button>
          <Link href="/profile" className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all block">
            <Settings className="w-4 h-4" />
          </Link>
        </div>

        {/* User state dropdown / Auth CTA */}
        <div className="hidden sm:flex items-center">
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 cursor-pointer hover:opacity-90 select-none outline-none bg-transparent border-0 p-0 text-left">
                <div className="text-right">
                  <p className="text-[10px] text-foreground font-semibold leading-none mb-0.5 truncate max-w-[90px]">
                    {user.name}
                  </p>
                  <p className="text-[8px] text-primary font-bold leading-none tracking-wider">PRO MEMBER</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                  <span className="text-primary text-xs font-bold font-mono">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
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
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-xs text-destructive focus:text-destructive cursor-pointer hover:bg-destructive/10 py-1.5 px-2.5 rounded"
                >
                  <LogOut className="w-3.5 h-3.5 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm" className="h-8 rounded-full text-xs font-bold px-4 hover:bg-muted/50 border-primary/20">
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild size="sm" className="h-8 rounded-full text-xs font-bold px-4 bg-primary hover:bg-primary/95 text-black">
                <Link href="/register">Sign up</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile menu trigger sheet drawer */}
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
                  <Link href="/" className="font-bold text-base text-white tracking-wider flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-primary flex items-center justify-center text-[10px] text-black font-extrabold">
                      CO
                    </span>
                    CrikOptions
                  </Link>
                </SheetTitle>
              </SheetHeader>

              {/* Navigation Items (mobile) */}
              <div className="my-8 flex flex-col gap-5">
                <nav className="flex flex-col gap-2">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
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

                <div className="border-t border-border/10 pt-5 mt-2 flex flex-col gap-3">
                  {isAuthenticated && user ? (
                    <>
                      <div className="flex items-center gap-3 p-2 bg-muted/20 rounded-lg border border-border/5">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                          <span className="text-primary text-sm font-bold">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-foreground">{user.name}</p>
                          <p className="text-[10px] text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <Button asChild variant="outline" className="w-full justify-start rounded-full text-xs h-9">
                        <Link href="/profile">
                          <Settings className="w-3.5 h-3.5 mr-2" />
                          Profile Settings
                        </Link>
                      </Button>
                      <Button asChild variant="outline" className="w-full justify-start rounded-full text-xs h-9">
                        <Link href="/portfolio">
                          <Activity className="w-3.5 h-3.5 mr-2" />
                          Portfolio Hub
                        </Link>
                      </Button>
                      <Button onClick={handleLogout} variant="destructive" className="w-full justify-start rounded-full text-xs h-9">
                        <LogOut className="w-3.5 h-3.5 mr-2" />
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button asChild variant="outline" className="w-full rounded-full text-xs h-9 border-primary/25">
                        <Link href="/login">Log in</Link>
                      </Button>
                      <Button asChild className="w-full rounded-full text-xs h-9 bg-primary hover:bg-primary/95 text-black">
                        <Link href="/register">Sign up</Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}