"use client";

import React from "react";
import { motion, useInView } from "motion/react";

interface TimelineContentProps {
  animationNum?: number;
  timelineRef?: React.RefObject<HTMLDivElement | null>;
  customVariants?: any;
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
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const defaultVariants = {
    hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: 0.5,
        delay: i * 0.15,
      },
    }),
  };

  const variants = customVariants || defaultVariants;
  
  // Dynamically resolve motion component based on 'as' string
  const MotionComponent = (motion as any)[as] || motion.div;

  return (
    <MotionComponent
      ref={ref}
      variants={variants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className={className}
      custom={animationNum}
    >
      {children}
    </MotionComponent>
  );
}
