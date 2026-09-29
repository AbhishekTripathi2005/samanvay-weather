import { BentoGrid } from "@/components/ui/BentoGrid";
import { Skeleton } from "@/components/ui/Skeleton";
import { GlassCard } from "@/components/ui/GlassCard";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      <div className="flex items-center justify-between">
        <Skeleton variant="text" className="w-48 h-8" />
        <Skeleton variant="card" className="w-32 h-8" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} variant="metric" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Skeleton variant="card" className="h-96" />
        </div>
        <div>
          <Skeleton variant="card" className="h-96" />
        </div>
      </div>
    </div>
  );
}
