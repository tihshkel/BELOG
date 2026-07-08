import Image from "next/image";

interface MuseumLogoProps {
  size?: number;
  className?: string;
}

export function MuseumLogo({ size = 64, className = "" }: MuseumLogoProps) {
  return (
    <Image
      src="/assets/logo-belog.png"
      alt="Белорусское общество глухих"
      width={size}
      height={size}
      className={className}
      style={{ width: size, height: "auto" }}
    />
  );
}
