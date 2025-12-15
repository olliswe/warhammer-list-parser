import Skeleton from "@/components/atoms/Skeleton.tsx";

function DetailsViewSkeleton() {
  return (
    <div>
      {/* URL Link skeleton */}
      <div className="mb-5 pb-4 border-b">
        <Skeleton className="h-9 w-40" variant="rect" />
      </div>

      {/* Faction info skeleton */}
      <div className="mb-5">
        <Skeleton className="w-32 mb-2" />
      </div>

      {/* Section 1 skeleton */}
      <div className="mb-5">
        <Skeleton className="h-5 w-48 mb-3" />
        <div className="bg-gray-50 p-3 rounded mb-2">
          <Skeleton className="w-full mb-2" />
          <Skeleton className="w-4/5 mb-2" />
          <Skeleton className="w-3/4" />
        </div>
      </div>

      {/* Section 2 skeleton */}
      <div className="mb-5">
        <Skeleton className="h-5 w-40 mb-3" />
        <div className="bg-gray-50 p-3 rounded mb-2">
          <Skeleton className="w-full mb-2" />
          <Skeleton className="w-5/6 mb-2" />
          <Skeleton className="w-2/3" />
        </div>
      </div>

      {/* Table skeleton */}
      <div className="mb-5">
        <Skeleton className="h-5 w-36 mb-3" />
        <div className="overflow-x-auto">
          <div className="border border-gray-300 rounded">
            {/* Table header */}
            <div className="bg-gray-100 flex border-b border-gray-300">
              <div className="p-2 flex-1 border-r border-gray-300">
                <Skeleton className="w-16" />
              </div>
              <div className="p-2 w-16 border-r border-gray-300">
                <Skeleton className="w-8 mx-auto" />
              </div>
              <div className="p-2 w-16 border-r border-gray-300">
                <Skeleton className="w-8 mx-auto" />
              </div>
              <div className="p-2 w-16 border-r border-gray-300">
                <Skeleton className="w-8 mx-auto" />
              </div>
              <div className="p-2 w-16">
                <Skeleton className="w-8 mx-auto" />
              </div>
            </div>
            {/* Table rows */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex border-b border-gray-300 last:border-b-0">
                <div className="p-2 flex-1 border-r border-gray-300">
                  <Skeleton className="w-24" />
                </div>
                <div className="p-2 w-16 border-r border-gray-300">
                  <Skeleton className="w-8 mx-auto" />
                </div>
                <div className="p-2 w-16 border-r border-gray-300">
                  <Skeleton className="w-8 mx-auto" />
                </div>
                <div className="p-2 w-16 border-r border-gray-300">
                  <Skeleton className="w-8 mx-auto" />
                </div>
                <div className="p-2 w-16">
                  <Skeleton className="w-8 mx-auto" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional sections */}
      <div className="mb-5">
        <Skeleton className="h-5 w-32 mb-3" />
        <div className="flex flex-wrap gap-1">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-28 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>

      <div className="mb-5">
        <Skeleton className="h-5 w-44 mb-3" />
        <div className="bg-gray-50 p-3 rounded">
          <Skeleton className="w-full mb-2" />
          <Skeleton className="w-4/5 mb-2" />
          <Skeleton className="w-3/5" />
        </div>
      </div>
    </div>
  );
}

export default DetailsViewSkeleton;
