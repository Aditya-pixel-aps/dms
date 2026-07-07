import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h2 className="text-xl font-bold">Page not found</h2>
      <p className="text-sm text-gray-500">
        The page you are looking for does not exist.
      </p>
      <Link className="rounded bg-black px-4 py-2 text-sm text-white" href="/">
        Go home
      </Link>
    </div>
  );
}
