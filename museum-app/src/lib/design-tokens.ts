/**
 * Палитра бренда БелОГ — извлечена из логотипа музея.
 * Основные цвета: белый, серый, голубой (#0077C0).
 */
export const brand = {
  blue: "#0077C0",
  blueDark: "#005A94",
  blueDarker: "#004A7A",
  blueLight: "#E8F4FC",
  blueMuted: "#B3D9F0",

  white: "#FFFFFF",
  gray50: "#F7F9FB",
  gray100: "#EEF1F5",
  gray200: "#D8DEE6",
  gray300: "#B8C1CC",
  gray400: "#8B95A5",
  gray600: "#5C6672",
  gray800: "#2E3744",
  gray900: "#1A2332",

  /** Минимальный размер тач-зоны для музейных киосков (мм → относительные единицы) */
  touchMin: "clamp(48px, 10cqw, 72px)",
} as const;

export const kioskType = {
  /** Заголовки на больших экранах */
  hero: "clamp(1.75rem, 6cqw, 3.5rem)",
  title: "clamp(1.25rem, 4.5cqw, 2.25rem)",
  subtitle: "clamp(0.8rem, 2.2cqw, 1.1rem)",
  body: "clamp(0.85rem, 2.4cqw, 1.15rem)",
  caption: "clamp(0.65rem, 1.6cqw, 0.85rem)",
  label: "clamp(0.6rem, 1.4cqw, 0.75rem)",
} as const;
