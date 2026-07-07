"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h2 className="text-xl font-bold">Something went wrong</h2>
      <p className="text-sm text-gray-500">{error.message}</p>
      <button
        className="rounded bg-black px-4 py-2 text-sm text-white"
        onClick={reset}
      >
        Try again
      </button>
    </div>
  );
}
