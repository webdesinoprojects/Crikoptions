import React from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import createGlobe from "cobe";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { IconBrandYoutubeFilled } from "@tabler/icons-react";
import Link from "next/link";

export function FeaturesSectionWithBentoGrid() {
  const features = [
    {
      title: "Real-time Market Data",
      description:
        "Track live match statistics and odds with sub-second latency on our intuitive trading terminal.",
      skeleton: <SkeletonOne />,
      className:
        "col-span-1 md:col-span-4 lg:col-span-4 border-b md:border-r border-slate-700/50 bg-slate-900/50 backdrop-blur-md",
    },
    {
      title: "Instant Execution",
      description:
        "Experience blazing fast, zero-slippage trade execution with our state-of-the-art matching engine.",
      skeleton: <SkeletonTwo />,
      className: "col-span-1 md:col-span-2 lg:col-span-2 border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-md",
    },
    {
      title: "Learn to Trade",
      description:
        "Watch our tutorials and live trading sessions on YouTube to master your strategies and dominate the markets.",
      skeleton: <SkeletonThree />,
      className:
        "col-span-1 md:col-span-3 lg:col-span-3 border-b md:border-r border-slate-700/50 bg-slate-900/50 backdrop-blur-md",
    },
    {
      title: "Global Coverage",
      description:
        "From World Cups to domestic leagues, trade on cricket matches happening all around the globe.",
      skeleton: <SkeletonFour />,
      className: "col-span-1 md:col-span-3 lg:col-span-3 border-b md:border-none border-slate-700/50 bg-slate-900/50 backdrop-blur-md",
    },
  ];
  return (
    <div className="relative z-20 py-10 lg:py-24 max-w-7xl mx-auto">
      <div className="px-8">
        <h4 className="font-display text-3xl lg:text-5xl lg:leading-tight max-w-5xl mx-auto text-center font-black tracking-tight text-white">
          Experience the Ultimate Trading Platform
        </h4>

        <p className="text-sm lg:text-base max-w-2xl my-4 mx-auto text-slate-400 text-center font-medium">
          While you wait for the next live match, discover the powerful tools and features CricOptions offers to elevate your trading game.
        </p>
      </div>

      <div className="relative mt-12">
        <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-6 xl:border rounded-2xl border-slate-700/50 overflow-hidden">
          {features.map((feature) => (
            <FeatureCard key={feature.title} className={feature.className}>
              <FeatureTitle>{feature.title}</FeatureTitle>
              <FeatureDescription>{feature.description}</FeatureDescription>
              <div className="h-full w-full">{feature.skeleton}</div>
            </FeatureCard>
          ))}
        </div>
      </div>
    </div>
  );
}

const FeatureCard = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn(`p-4 sm:p-8 relative overflow-hidden transition-all hover:bg-slate-800/80`, className)}>
      {children}
    </div>
  );
};

const FeatureTitle = ({ children }: { children?: React.ReactNode }) => {
  return (
    <p className="max-w-5xl mx-auto text-left font-display tracking-tight text-white text-xl md:text-2xl font-bold md:leading-snug">
      {children}
    </p>
  );
};

const FeatureDescription = ({ children }: { children?: React.ReactNode }) => {
  return (
    <p
      className={cn(
        "text-sm md:text-base max-w-4xl text-left mx-auto",
        "text-slate-400 font-medium",
        "text-left max-w-sm mx-0 md:text-sm my-2"
      )}
    >
      {children}
    </p>
  );
};

export const SkeletonOne = () => {
  return (
    <div className="relative flex py-8 px-2 gap-10 h-full">
      <div className="w-full p-2 mx-auto bg-slate-900 border border-slate-800 rounded-xl shadow-2xl group h-full">
        <div className="flex flex-1 w-full h-full flex-col space-y-2 relative overflow-hidden rounded-lg">
          <Image
            src="https://images.unsplash.com/photo-1642543492481-44e81e391452?q=80&w=2070&auto=format&fit=crop"
            alt="Trading Terminal Dashboard"
            width={800}
            height={800}
            className="h-full w-full object-cover object-left-top rounded-sm transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-cyan-900/20 mix-blend-overlay pointer-events-none" />
        </div>
      </div>

      <div className="absolute bottom-0 z-40 inset-x-0 h-60 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent w-full pointer-events-none" />
      <div className="absolute top-0 z-40 inset-x-0 h-40 bg-gradient-to-b from-slate-900 via-transparent to-transparent w-full pointer-events-none" />
    </div>
  );
};

export const SkeletonThree = () => {
  return (
    <Link
      href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
      target="__blank"
      className="relative flex gap-10 h-full group/image"
    >
      <div className="w-full mx-auto bg-transparent group h-full">
        <div className="flex flex-1 w-full h-full flex-col space-y-2 relative rounded-xl overflow-hidden border border-slate-800">
          <IconBrandYoutubeFilled className="h-20 w-20 absolute z-10 inset-0 text-red-500 m-auto drop-shadow-xl transition-transform duration-300 group-hover/image:scale-110" />
          <Image
            src="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=3540&auto=format&fit=crop"
            alt="Cricket trading tutorial"
            width={800}
            height={800}
            className="h-full w-full aspect-square object-cover object-center rounded-sm blur-[2px] opacity-80 group-hover/image:blur-sm transition-all duration-300"
          />
          <div className="absolute inset-0 bg-slate-900/40 pointer-events-none" />
        </div>
      </div>
    </Link>
  );
};

export const SkeletonTwo = () => {
  const images = [
    "https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=3540&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1624526267352-700fb47071c3?q=80&w=3387&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1593341646782-e0b495cff86d?q=80&w=2581&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1589801258579-18e091f4ca26?q=80&w=3540&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=3540&auto=format&fit=crop",
  ];

  const imageVariants = {
    whileHover: {
      scale: 1.1,
      rotate: 0,
      zIndex: 100,
    },
    whileTap: {
      scale: 1.1,
      rotate: 0,
      zIndex: 100,
    },
  };
  return (
    <div className="relative flex flex-col items-start p-8 gap-10 h-full overflow-hidden">
      <div className="flex flex-row -ml-20">
        {images.map((image, idx) => (
          <motion.div
            variants={imageVariants}
            key={"images-first" + idx}
            style={{
              rotate: (idx * 7) % 20 - 10,
            }}
            whileHover="whileHover"
            whileTap="whileTap"
            className="rounded-xl -mr-4 mt-4 p-1 bg-slate-800 border border-slate-700 flex-shrink-0 overflow-hidden shadow-lg"
          >
            <Image
              src={image}
              alt="Action shots"
              width="500"
              height="500"
              className="rounded-lg h-20 w-20 md:h-40 md:w-40 object-cover flex-shrink-0 grayscale-[20%] hover:grayscale-0 transition-all"
            />
          </motion.div>
        ))}
      </div>
      <div className="flex flex-row">
        {images.map((image, idx) => (
          <motion.div
            key={"images-second" + idx}
            style={{
              rotate: ((idx + 2) * 11) % 20 - 10,
            }}
            variants={imageVariants}
            whileHover="whileHover"
            whileTap="whileTap"
            className="rounded-xl -mr-4 mt-4 p-1 bg-slate-800 border border-slate-700 flex-shrink-0 overflow-hidden shadow-lg"
          >
            <Image
              src={image}
              alt="Action shots"
              width="500"
              height="500"
              className="rounded-lg h-20 w-20 md:h-40 md:w-40 object-cover flex-shrink-0 grayscale-[20%] hover:grayscale-0 transition-all"
            />
          </motion.div>
        ))}
      </div>

      <div className="absolute left-0 z-[100] inset-y-0 w-20 bg-gradient-to-r from-slate-900 to-transparent h-full pointer-events-none" />
      <div className="absolute right-0 z-[100] inset-y-0 w-20 bg-gradient-to-l from-slate-900 to-transparent h-full pointer-events-none" />
    </div>
  );
};

export const SkeletonFour = () => {
  return (
    <div className="h-60 md:h-60 flex flex-col items-center relative bg-transparent mt-10">
      <Globe className="absolute -right-10 md:-right-10 -bottom-80 md:-bottom-72" />
    </div>
  );
};

export const Globe = ({ className }: { className?: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let phi = 0;

    if (!canvasRef.current) return;

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: 600 * 2,
      height: 600 * 2,
      phi: 0,
      theta: 0,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [0.1, 0.15, 0.25], // Slate blue base
      markerColor: [0.03, 0.82, 0.93], // Cyan marker
      glowColor: [0.03, 0.82, 0.93], // Cyan glow
      markers: [
        { location: [20.5937, 78.9629], size: 0.1 }, // India
        { location: [52.3555, -1.1743], size: 0.08 }, // UK
        { location: [-25.2744, 133.7751], size: 0.08 }, // Australia
        { location: [-30.5595, 22.9375], size: 0.07 }, // South Africa
      ],
      onRender: (state: { phi: number }) => {
        state.phi = phi;
        phi += 0.005;
      },
    } as Parameters<typeof createGlobe>[1]);

    return () => {
      globe.destroy();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: 600, height: 600, maxWidth: "100%", aspectRatio: 1 }}
      className={className}
    />
  );
};
