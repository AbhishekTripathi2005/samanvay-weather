import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <Skeleton variant="text" className="w-72 h-8" />
        <Skeleton variant="card" className="w-56 h-9" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} variant="metric" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <Skeleton variant="card" className="h-[480px] w-full" />
        </div>
        <div className="lg:col-span-4 flex flex-col gap-4">
          <Skeleton variant="card" className="h-[230px] w-full" />
          <Skeleton variant="card" className="h-[230px] w-full" />
        </div>
      </div>
    </div>
  );
}
