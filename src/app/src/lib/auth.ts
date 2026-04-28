import { compare, hash } from "bcryptjs";

const SALT_ROUNDS = 12;

export function isPasswordHash(value: string) {
  return value.startsWith("$2a$") || value.startsWith("$2b$") || value.startsWith("$2y$");
}

export async function hashPassword(password: string) {
  return hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, storedPassword: string) {
  if (isPasswordHash(storedPassword)) {
    return compare(password, storedPassword);
  }

  return password === storedPassword;
}
