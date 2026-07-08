import { seedDatabase } from "@/lib/db/seed";

let seeded = false;

export function ensureDb() {
  if (!seeded) {
    seedDatabase();
    seeded = true;
  }
}
