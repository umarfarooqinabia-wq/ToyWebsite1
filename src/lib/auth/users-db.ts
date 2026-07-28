import type { Address } from "@/types/commerce";
import { hashPassword } from "@/lib/auth/password";
import type { PublicUser, StoredUser } from "@/lib/auth/types";
import { toPublicUser } from "@/lib/auth/types";
import { mutateJson, readJson } from "@/lib/admin/json-store";

const USERS_FILE = "users.json";

type Store = { users: StoredUser[] };

async function readStore(): Promise<Store> {
  const parsed = await readJson<Store>(USERS_FILE);
  if (!parsed) return { users: [] };
  return { users: Array.isArray(parsed.users) ? parsed.users : [] };
}

export async function findUserByEmail(email: string): Promise<StoredUser | null> {
  const store = await readStore();
  const key = email.trim().toLowerCase();
  return store.users.find((u) => u.email.toLowerCase() === key) ?? null;
}

export async function findUserById(id: string): Promise<StoredUser | null> {
  const store = await readStore();
  return store.users.find((u) => u.id === id) ?? null;
}

export type CreateUserInput = {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
};

export async function createUser(input: CreateUserInput): Promise<PublicUser> {
  const email = input.email.trim().toLowerCase();
  const { hash, salt } = await hashPassword(input.password);
  const now = new Date().toISOString();
  const user: StoredUser = {
    id: `user-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    fullName: input.fullName.trim(),
    email,
    phone: (input.phone ?? "").trim(),
    passwordHash: hash,
    passwordSalt: salt,
    addresses: [],
    createdAt: now,
    updatedAt: now,
  };

  await mutateJson<Store>(USERS_FILE, { users: [] }, (store) => {
    if (store.users.some((u) => u.email.toLowerCase() === email)) {
      throw new Error("EMAIL_TAKEN");
    }
    store.users.push(user);
    return store;
  });

  return toPublicUser(user);
}

export type UpdateUserProfileInput = {
  fullName?: string;
  phone?: string;
  addresses?: Address[];
};

export async function updateUserProfile(
  id: string,
  input: UpdateUserProfileInput,
): Promise<PublicUser | null> {
  let updated: StoredUser | null = null;

  await mutateJson<Store>(USERS_FILE, { users: [] }, (store) => {
    const idx = store.users.findIndex((u) => u.id === id);
    if (idx < 0) return store;
    const current = store.users[idx]!;
    updated = {
      ...current,
      fullName:
        input.fullName !== undefined ? input.fullName.trim() : current.fullName,
      phone: input.phone !== undefined ? input.phone.trim() : current.phone,
      addresses: input.addresses !== undefined ? input.addresses : current.addresses,
      updatedAt: new Date().toISOString(),
    };
    store.users[idx] = updated;
    return store;
  });

  return updated ? toPublicUser(updated) : null;
}

export async function listUsers(): Promise<PublicUser[]> {
  const store = await readStore();
  return store.users
    .map(toPublicUser)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}

export async function updateUserPassword(
  id: string,
  password: string,
): Promise<boolean> {
  const { hash, salt } = await hashPassword(password);
  let found = false;

  await mutateJson<Store>(USERS_FILE, { users: [] }, (store) => {
    const idx = store.users.findIndex((u) => u.id === id);
    if (idx < 0) return store;
    found = true;
    store.users[idx] = {
      ...store.users[idx]!,
      passwordHash: hash,
      passwordSalt: salt,
      updatedAt: new Date().toISOString(),
    };
    return store;
  });

  return found;
}

export { toPublicUser };
