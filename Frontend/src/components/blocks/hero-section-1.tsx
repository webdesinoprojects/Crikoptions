"use client";
import React from 'react'
import Link from 'next/link'
import { ArrowRight, ChevronRight, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AnimatedGroup } from '@/components/ui/animated-group'
import { cn } from '@/lib/utils'
import { Variants } from 'framer-motion'
import { Navbar1 } from '@/components/ui/navbar-1'

const transitionVariants: { container?: Variants; item?: Variants } = {
    item: {
        hidden: {
            opacity: 0,
            filter: 'blur(12px)',
            y: 12,
        },
        visible: {
            opacity: 1,
            filter: 'blur(0px)',
            y: 0,
            transition: {
                type: 'spring',
                bounce: 0.3,
                duration: 1.5,
            },
        },
    },
}

export function HeroSection() {
    return (
        <>
            <Navbar1 />
            <main className="min-h-[100dvh] overflow-hidden">
                <div
                    aria-hidden
                    className="z-[2] absolute inset-0 pointer-events-none isolate opacity-50 contain-strict hidden lg:block">
                    <div className="w-[35rem] h-[80rem] -translate-y-[350px] absolute left-0 top-0 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,rgba(30,58,138,0.15)_0,rgba(212,175,55,0.05)_50%,transparent_80%)]" />
                    <div className="h-[80rem] absolute left-0 top-0 w-56 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,rgba(30,58,138,0.1)_0,rgba(212,175,55,0.02)_80%,transparent_100%)] [translate:5%_-50%]" />
                    <div className="h-[80rem] -translate-y-[350px] absolute left-0 top-0 w-56 -rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,rgba(212,175,55,0.08)_0,rgba(30,58,138,0.02)_80%,transparent_100%)]" />
                </div>
                <section>
                    <div className="relative pt-24 md:pt-36">
                        <AnimatedGroup
                            variants={{
                                container: {
                                    visible: {
                                        transition: {
                                            delayChildren: 1,
                                        },
                                    },
                                },
                                item: {
                                    hidden: {
                                        opacity: 0,
                                        y: 20,
                                    },
                                    visible: {
                                        opacity: 1,
                                        y: 0,
                                        transition: {
                                            type: 'spring',
                                            bounce: 0.3,
                                            duration: 2,
                                        },
                                    },
                                },
                            }}
                            className="absolute inset-0 -z-20">
                            <img
                                src="https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop"
                                alt="background"
                                className="absolute inset-x-0 top-56 -z-20 hidden lg:top-32 dark:block opacity-20 object-cover w-full h-[800px] blur-sm"
                                width="3276"
                                height="4095"
                            />
                        </AnimatedGroup>
                        <div aria-hidden className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--background)_75%)]" />
                        <div className="mx-auto max-w-7xl px-6">
                            <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">
                                <AnimatedGroup variants={transitionVariants}>
                                    <Link
                                        href="/login"
                                        className="hover:bg-[#0f172a]/50 bg-[#0f172a] group mx-auto flex w-fit items-center gap-4 rounded-full border border-[#1e3a8a]/50 p-1 pl-4 shadow-lg shadow-[#1e3a8a]/20 transition-all duration-300">
                                        <span className="text-[#d4af37] text-sm font-mono tracking-wider font-bold">CRICOPTIONS TERMINAL</span>
                                        <span className="block h-4 w-0.5 border-l border-[#1e3a8a]"></span>

                                        <div className="bg-[#1e3a8a] group-hover:bg-[#2563eb] size-6 overflow-hidden rounded-full duration-500">
                                            <div className="flex w-12 -translate-x-1/2 duration-500 ease-in-out group-hover:translate-x-0">
                                                <span className="flex size-6">
                                                    <ArrowRight className="m-auto size-3 text-white" />
                                                </span>
                                                <span className="flex size-6">
                                                    <ArrowRight className="m-auto size-3 text-white" />
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                        
                                    <h1
                                        className="mt-8 max-w-4xl mx-auto text-balance text-6xl md:text-7xl lg:mt-16 xl:text-[5.25rem] font-mono tracking-tighter uppercase font-black drop-shadow-md">
                                        Institutional Options Trading Terminal
                                    </h1>
                                    <p
                                        className="mx-auto mt-8 max-w-2xl text-balance text-lg text-on-surface-variant font-mono">
                                        Advanced predictive algorithms, gapless execution, and real-time event telemetry. Built for mechanical efficiency.
                                    </p>
                                </AnimatedGroup>

                                <AnimatedGroup
                                    variants={{
                                        container: {
                                            visible: {
                                                transition: {
                                                    staggerChildren: 0.05,
                                                    delayChildren: 0.75,
                                                },
                                            },
                                        },
                                        ...transitionVariants,
                                    }}
                                    className="mt-12 flex flex-col items-center justify-center gap-4 md:flex-row">
                                    <div
                                        key={1}
                                        className="bg-primary/20 rounded-xl border border-primary/50 p-0.5 group">
                                        <Button
                                            asChild
                                            size="lg"
                                            className="rounded-lg px-8 text-base bg-[#d4af37] text-[#0f172a] font-black uppercase tracking-widest hover:bg-[#ebd171] transition-all shadow-[0_0_20px_rgba(212,175,55,0.4)]">
                                            <Link href="/insights/1">
                                                <span className="text-nowrap">Enter Terminal</span>
                                            </Link>
                                        </Button>
                                    </div>
                                    <Button
                                        key={2}
                                        asChild
                                        size="lg"
                                        variant="outline"
                                        className="rounded-lg px-8 uppercase tracking-widest font-bold border-white/20 hover:bg-white/10 text-white">
                                        <Link href="/register">
                                            <span className="text-nowrap">Request Access</span>
                                        </Link>
                                    </Button>
                                </AnimatedGroup>
                            </div>
                        </div>

                        <AnimatedGroup
                            variants={{
                                container: {
                                    visible: {
                                        transition: {
                                            staggerChildren: 0.05,
                                            delayChildren: 0.75,
                                        },
                                    },
                                },
                                ...transitionVariants,
                            }}>
                            <div className="relative mt-16 overflow-hidden px-2 md:mt-24 w-full flex justify-center pb-20">
                                <div
                                    aria-hidden
                                    className="bg-gradient-to-b to-background absolute inset-0 z-10 from-transparent from-35%"
                                />
                                <div className="relative mx-auto w-full max-w-5xl overflow-hidden rounded-none border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] p-2 bg-black/60 backdrop-blur-sm">
                                    <img
                                        className="w-full relative rounded-none dark:block border border-white/5 opacity-80 mix-blend-screen"
                                        src="https://images.unsplash.com/photo-1642790106117-e829e14a795f?q=80&w=2000&auto=format&fit=crop"
                                        alt="app screen"
                                        width="2700"
                                        height="1440"
                                    />
                                </div>
                            </div>
                        </AnimatedGroup>
                    </div>
                </section>
                
            </main>
        </>
    )
}



const Logo = ({ className }: { className?: string }) => {
    return (
        <img src="/logo.png" alt="CricOptions Logo" className={cn('h-16 w-auto object-contain', className)} />
    )
}
