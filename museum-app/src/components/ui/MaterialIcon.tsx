interface MaterialIconProps {
  name: string;
  className?: string;
  size?: number;
  filled?: boolean;
}

export function MaterialIcon({
  name,
  className = "",
  size = 24,
  filled = false,
}: MaterialIconProps) {
  return (
    <span
      className={`material-symbols-outlined ${className}`.trim()}
      style={{
        fontSize: size,
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' ${size}`,
      }}
      aria-hidden
    >
      {name}
    </span>
  );
}
