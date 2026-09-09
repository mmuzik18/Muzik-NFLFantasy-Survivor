export function BrandMark({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="7" fill="#c8912f" />
      <ellipse cx="16" cy="16" rx="9.5" ry="6.2" fill="#0b2e1d" />
      <path d="M8 16 L24 16" stroke="#c8912f" strokeWidth="0.9" />
      <path
        d="M13 13.4 L13 18.6 M15 12.6 L15 19.4 M17 12.6 L17 19.4 M19 13.4 L19 18.6"
        stroke="#c8912f"
        strokeWidth="0.9"
        strokeLinecap="round"
      />
    </svg>
  );
}
