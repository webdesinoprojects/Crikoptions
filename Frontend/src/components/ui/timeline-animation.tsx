"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type TimelineAnimationState = {
  y?: number | string;
  opacity?: number;
  filter?: string;
  transition?: {
    duration?: number;
    delay?: number;
  };
};

type TimelineVariants = {
  hidden?: TimelineAnimationState;
  visible?: TimelineAnimationState | ((index: number) => TimelineAnimationState);
};

interface TimelineContentProps {
  animationNum?: number;
  timelineRef?: React.RefObject<HTMLDivElement | null>;
  customVariants?: TimelineVariants;
  className?: string;
  children: React.ReactNode;
  as?: string;
}

export function TimelineContent({
  animationNum = 0,
  timelineRef,
  customVariants,
  className,
  children,
  as = "div",
}: TimelineContentProps) {
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    // Default animation variables
    let fromVars: gsap.TweenVars = { y: 30, opacity: 0, filter: "blur(4px)" };
    let toVars: gsap.TweenVars = {
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      duration: 0.8,
      ease: "power3.out",
      delay: animationNum * 0.15,
      scrollTrigger: {
        trigger: timelineRef?.current || el,
        start: "top 85%",
        toggleActions: "play none none reverse",
      },
    };

    // Map customVariants to GSAP if provided
    if (customVariants) {
      const hidden = customVariants.hidden || {};
      const visibleSource = customVariants.visible;
      const visible: TimelineAnimationState =
        typeof visibleSource === "function" ? visibleSource(animationNum) : (visibleSource ?? {});
      const transition = visible.transition || {};

      fromVars = {
        y: hidden.y !== undefined ? hidden.y : 30,
        opacity: hidden.opacity !== undefined ? hidden.opacity : 0,
        filter: hidden.filter || "blur(4px)",
      };

      toVars = {
        y: visible.y !== undefined ? visible.y : 0,
        opacity: visible.opacity !== undefined ? visible.opacity : 1,
        filter: visible.filter || "blur(0px)",
        duration: transition.duration || 0.8,
        delay: transition.delay !== undefined ? transition.delay : animationNum * 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: timelineRef?.current || el,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
      };
    }

    const anim = gsap.fromTo(el, fromVars, toVars);

    return () => {
      anim.kill();
    };
  }, [animationNum, timelineRef, customVariants]);

  const Component = as as React.ElementType;

  return (
    <Component ref={elementRef} className={className}>
      {children}
    </Component>
  );
}
