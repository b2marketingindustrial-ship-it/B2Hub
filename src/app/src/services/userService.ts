type CreateUserRequest = {
  name: string;
  email: string;
  role: "cliente" | "admin" | "ceo";
  password: string;
  companyName?: string;
};

import { hashPassword } from "../lib/auth";
import { ensureDatabaseSetup, query } from "../lib/db";

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: "cliente" | "admin" | "ceo";
  company_name: string | null;
  created_at: string;
};

type UpdateEmployeeRequest = {
  name: string;
  email: string;
  role: "admin" | "ceo";
  password?: string;
};

function mapUserRow(row: UserRow) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    companyName: row.company_name ?? "",
    createdAt: row.created_at,
  };
}

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

export async function listEmployees() {
  await ensureDatabaseSetup();

  const employees = await query<UserRow>(
    `
      SELECT id, name, email, role, company_name, created_at
      FROM users
      WHERE role IN ('admin', 'ceo')
      ORDER BY created_at DESC, name ASC
    `
  );

  return employees.rows.map(mapUserRow);
}

export async function updateEmployee(id: string, data: UpdateEmployeeRequest) {
  await ensureDatabaseSetup();

  const existingUser = await query<{ id: string }>(
    `
      SELECT id
      FROM users
      WHERE id = $1 AND role IN ('admin', 'ceo')
      LIMIT 1
    `,
    [id]
  );

  if (!existingUser.rowCount) {
    throw new Error("Funcionario nao encontrado");
  }

  const emailOwner = await query<{ id: string }>(
    `
      SELECT id
      FROM users
      WHERE email = $1 AND id <> $2
      LIMIT 1
    `,
    [data.email, id]
  );

  if (emailOwner.rowCount) {
    throw new Error("Ja existe um usuario com este email");
  }

  if (data.password) {
    const hashedPassword = await hashPassword(data.password);

    const updatedUser = await query<UserRow>(
      `
        UPDATE users
        SET name = $2,
            email = $3,
            role = $4,
            company_name = '',
            password = $5
        WHERE id = $1
        RETURNING id, name, email, role, company_name, created_at
      `,
      [id, data.name, data.email, data.role, hashedPassword]
    );

    return mapUserRow(updatedUser.rows[0]);
  }

  const updatedUser = await query<UserRow>(
    `
      UPDATE users
      SET name = $2,
          email = $3,
          role = $4,
          company_name = ''
      WHERE id = $1
      RETURNING id, name, email, role, company_name, created_at
    `,
    [id, data.name, data.email, data.role]
  );

  return mapUserRow(updatedUser.rows[0]);
}

export async function deleteEmployee(id: string) {
  await ensureDatabaseSetup();

  const managers = await query<{ total: string }>(
    `
      SELECT COUNT(*)::text AS total
      FROM users
      WHERE role IN ('admin', 'ceo')
    `
  );

  if (Number(managers.rows[0]?.total ?? 0) <= 1) {
    throw new Error("Nao e possivel remover o ultimo funcionario gestor");
  }

  const deletedUser = await query<{ id: string }>(
    `
      DELETE FROM users
      WHERE id = $1 AND role IN ('admin', 'ceo')
      RETURNING id
    `,
    [id]
  );

  if (!deletedUser.rowCount) {
    throw new Error("Funcionario nao encontrado");
  }

  return { id, message: "Funcionario removido com sucesso" };
}
