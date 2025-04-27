export default function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {Array.from({ length: 10 }).map((_, index) => (
        <div key={index} className="rounded-lg overflow-hidden">
          <div className="aspect-[2/3] skeleton" />
          <div className="p-2 bg-slate-800">
            <div className="h-4 w-3/4 skeleton rounded mb-1" />
            <div className="h-3 w-1/2 skeleton rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}
