type CreateUserRequest = {
  name: string;
  email: string;
  role: "cliente" | "admin" | "ceo";
  password: string;
  companyName?: string;
};

import { hashPassword } from "../lib/auth";
import { ensureDatabaseSetup, query } from "../lib/db";

export async function createUser(data: CreateUserRequest) {
  await ensureDatabaseSetup();

  const userAlreadyExists = await query<{ id: string }>(
    "SELECT id FROM users WHERE email = $1 LIMIT 1",
    [data.email]
  );

  if (userAlreadyExists.rowCount) {
    throw new Error("Ja existe um usuario com este email");
  }

  const newUserId = crypto.randomUUID();
  const hashedPassword = await hashPassword(data.password);

  await query(
    `
      INSERT INTO users (id, name, email, role, company_name, password)
      VALUES ($1, $2, $3, $4, $5, $6)
    `,
    [
      newUserId,
      data.name,
      data.email,
      data.role,
      data.companyName ?? "",
      hashedPassword,
    ]
  );

  return {
    id: newUserId,
    name: data.name,
    email: data.email,
    role: data.role,
    companyName: data.companyName ?? "",
    message: "Usuario criado com sucesso",
  };
}
