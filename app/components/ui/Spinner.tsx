export default function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-8">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-700" />
      {label && <span className="text-sm text-gray-500">{label}</span>}
    </div>
  );
}
