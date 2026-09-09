import { BrandMark } from "@/components/BrandMark";

export default function Loading() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6">
      <div className="animate-pulse">
        <BrandMark size={36} />
      </div>
      <p className="text-sm text-ink-soft">Loading...</p>
    </div>
  );
}
