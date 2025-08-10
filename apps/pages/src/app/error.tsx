'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4 w-full">
      <h1 className="text-4xl font-bold">Something went wrong!</h1>
      <p className="text-gray-600">An error occurred while loading this page.</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Try again
      </button>
      <div className="p-4 border-1 border-gray-400 bg-gray-100 text-gray-600">
        <pre>{error.message}</pre>
      </div>
    </div>
  );
}