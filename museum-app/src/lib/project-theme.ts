export const PROJECT_FONT_OPTIONS = [
  { value: "var(--font-onest)", label: "Onest" },
  { value: "var(--font-cormorant)", label: "Cormorant" },
  { value: "Georgia, serif", label: "Georgia" },
] as const;

export interface ProjectTheme {
  backgroundHorizontal: string;
  backgroundVertical: string;
  colors: string[];
  fontBody: string;
  fontDisplay: string;
}

export const DEFAULT_PROJECT_THEME: ProjectTheme = {
  backgroundHorizontal: "/assets/bg-horizontal.jpg",
  backgroundVertical: "/assets/bg-vertical.jpg",
  colors: ["#111827", "#ffffff", "#17549b", "#c82b30", "#e7eef7"],
  fontBody: "var(--font-onest)",
  fontDisplay: "var(--font-cormorant)",
};

export function parseProjectTheme(value: string | null | undefined): ProjectTheme {
  if (!value) return DEFAULT_PROJECT_THEME;
  try {
    const parsed = JSON.parse(value) as Partial<ProjectTheme>;
    return {
      backgroundHorizontal:
        parsed.backgroundHorizontal || DEFAULT_PROJECT_THEME.backgroundHorizontal,
      backgroundVertical:
        parsed.backgroundVertical || DEFAULT_PROJECT_THEME.backgroundVertical,
      colors:
        Array.isArray(parsed.colors) && parsed.colors.length
          ? parsed.colors.slice(0, 8)
          : DEFAULT_PROJECT_THEME.colors,
      fontBody: parsed.fontBody || DEFAULT_PROJECT_THEME.fontBody,
      fontDisplay: parsed.fontDisplay || DEFAULT_PROJECT_THEME.fontDisplay,
    };
  } catch {
    return DEFAULT_PROJECT_THEME;
  }
}
