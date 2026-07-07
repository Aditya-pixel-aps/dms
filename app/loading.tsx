import Spinner from "@/app/components/ui/Spinner";

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Spinner label="Loading…" />
    </div>
  );
}
