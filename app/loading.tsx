export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-black border-r-transparent align-[-0.125em]" role="status">
          <span className="sr-only">Loading...</span>
        </div>
        <p className="mt-4 text-lg">Loading...</p>
      </div>
    </div>
  )
}
