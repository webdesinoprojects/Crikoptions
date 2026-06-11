"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export const Component = () => {
  const [count, setCount] = useState(0);

  return (
    <div className={cn("flex flex-col items-center gap-4 p-6 rounded-2xl border border-white/10 bg-surface/50 backdrop-blur-md max-w-sm mx-auto text-white")}>
      <h1 className="text-xl font-bold tracking-tight uppercase text-transparent bg-clip-text bg-gradient-to-r from-primary to-white">
        Component Example
      </h1>
      <div className="text-4xl font-mono font-bold text-primary my-2 drop-shadow-[0_0_8px_rgba(14,165,233,0.3)]">
        {count}
      </div>
      <div className="flex gap-3">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setCount((prev) => prev - 1)}
          className="w-10 h-10 rounded-lg border-white/10 hover:bg-white/10 text-white font-bold text-lg"
        >
          -
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setCount((prev) => prev + 1)}
          className="w-10 h-10 rounded-lg border-primary/20 bg-primary/10 hover:bg-primary/20 text-primary font-bold text-lg"
        >
          +
        </Button>
      </div>
    </div>
  );
};
