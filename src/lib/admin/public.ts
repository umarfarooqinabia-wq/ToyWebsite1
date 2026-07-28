/** Safe for client UI (no secrets). */
export const ADMIN_PUBLIC = {
  email: process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "mr.khan21991@gmail.com",
  name: process.env.NEXT_PUBLIC_ADMIN_NAME ?? "Mr Khan",
} as const;
