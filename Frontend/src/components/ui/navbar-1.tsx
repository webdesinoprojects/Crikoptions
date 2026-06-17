"use client" 

import * as React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, User } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/features/auth/hooks/useAuth"

const Navbar1 = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { user, isAuthenticated } = useAuthStore()

  const toggleMenu = () => setIsOpen(!isOpen)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="fixed top-0 z-50 flex justify-center w-full py-4 px-4 transition-all duration-300">
      <div className={cn(
        "flex items-center justify-between px-6 py-3 rounded-full w-full max-w-6xl relative z-10 transition-all duration-300 border",
        isScrolled 
          ? "bg-[#000d1a]/85 backdrop-blur-xl shadow-2xl border-white/10" 
          : "bg-transparent border-transparent shadow-none"
      )}>
        <div className="flex items-center">
          <motion.div
            className="h-10 w-auto mr-6"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl font-extrabold tracking-tight text-white uppercase font-display">CricOptions</span>
            </Link>
          </motion.div>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {["Features", "Terminal", "Pricing", "Docs"].map((item) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.05 }}
            >
              <Link href={`#${item.toLowerCase()}`} className="text-sm text-zinc-300 hover:text-white transition-colors font-medium">
                {item}
              </Link>
            </motion.div>
          ))}
        </nav>
 
        {/* Desktop CTA Button or Profile Icon */}
        <motion.div
          className="hidden md:flex items-center gap-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          {isAuthenticated && user ? (
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-sm font-bold text-zinc-300 hover:text-white transition-colors">
                Workspace
              </Link>
              <Link href="/profile" className="flex items-center gap-2 group cursor-pointer">
                <div className="w-9 h-9 rounded-full bg-[#3131f5]/20 flex items-center justify-center border border-[#3131f5]/30 group-hover:border-[#3131f5]/65 transition-colors">
                  <span className="text-[#3131f5] text-sm font-bold font-mono">
                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </span>
                </div>
                <span className="text-sm font-bold text-white group-hover:text-[#3131f5] transition-colors">
                  {user.name}
                </span>
              </Link>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-zinc-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-5 py-2 text-sm text-white bg-[#3131f5] font-bold rounded-full hover:bg-[#4d4dff] transition-colors shadow-[0_0_15px_rgba(49,49,245,0.3)]"
              >
                Get Started
              </Link>
            </>
          )}
        </motion.div>
 
        {/* Mobile Menu Button */}
        <motion.button className="md:hidden flex items-center" onClick={toggleMenu} whileTap={{ scale: 0.9 }}>
          <Menu className="h-6 w-6 text-white" />
        </motion.button>
      </div>
 
      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-[#0f172a]/95 backdrop-blur-xl z-50 pt-24 px-6 md:hidden border-b border-[#1e3a8a]/50 shadow-2xl"
            initial={{ opacity: 0, y: "-100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <motion.button
              className="absolute top-6 right-6 p-2 bg-white/10 rounded-full"
              onClick={toggleMenu}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <X className="h-6 w-6 text-white" />
            </motion.button>
            <div className="flex flex-col space-y-6">
              {["Features", "Terminal", "Pricing", "Docs"].map((item, i) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 + 0.1 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <Link href={`#${item.toLowerCase()}`} className="text-xl text-white font-display font-medium" onClick={toggleMenu}>
                    {item}
                  </Link>
                </motion.div>
              ))}
 
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                exit={{ opacity: 0, y: 20 }}
                className="pt-8 flex flex-col gap-4 border-t border-white/10"
              >
                {isAuthenticated && user ? (
                  <>
                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/10">
                      <div className="w-10 h-10 rounded-full bg-[#3131f5]/20 flex items-center justify-center border border-[#3131f5]/30">
                        <span className="text-[#3131f5] text-sm font-bold font-mono">
                          {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{user.name}</p>
                        <p className="text-xs text-zinc-400">{user.email}</p>
                      </div>
                    </div>
                    <Link
                      href="/profile"
                      className="inline-flex items-center justify-center w-full px-5 py-3 text-base text-white font-bold bg-[#3131f5] rounded-full hover:bg-[#4d4dff] transition-colors"
                      onClick={toggleMenu}
                    >
                      Customize Profile
                    </Link>
                    <Link
                      href="/dashboard"
                      className="inline-flex items-center justify-center w-full px-5 py-3 text-base text-white bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                      onClick={toggleMenu}
                    >
                      Go to Workspace
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="inline-flex items-center justify-center w-full px-5 py-3 text-base text-white bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                      onClick={toggleMenu}
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/register"
                      className="inline-flex items-center justify-center w-full px-5 py-3 text-base text-white font-bold bg-[#3131f5] rounded-full hover:bg-[#4d4dff] transition-colors"
                      onClick={toggleMenu}
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
 
export { Navbar1 }
