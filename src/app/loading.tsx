import { BrandMark } from "@/components/BrandMark";

export default function Loading() {
  return (
    <div className="flex flex-1 items-center justify-center p-6" role="status" aria-label="Loading">
      <div className="motion-safe:animate-pulse">
        <BrandMark size={36} />
      </div>
    </div>
  );
}
