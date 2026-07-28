import type { Address } from "@/types/commerce";

export type StoredUser = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  passwordHash: string;
  passwordSalt: string;
  addresses: Address[];
  createdAt: string;
  updatedAt: string;
};

/** Safe profile returned to the client (no password fields). */
export type PublicUser = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  addresses: Address[];
  createdAt: string;
  updatedAt: string;
};

export function toPublicUser(user: StoredUser): PublicUser {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    addresses: user.addresses,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
