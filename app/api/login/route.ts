import { hashPassword, isPasswordHash, verifyPassword } from "@/app/src/lib/auth";
import { ensureDatabaseSetup, query } from "@/app/src/lib/db";

type UserRow = {
  id: string;
  name: string;
  role: string;
  email: string;
  company_name: string | null;
  password: string;
};

export async function POST(req: Request) {
  await ensureDatabaseSetup();

  const body = await req.json();

  if (!body.email || !body.password) {
    return Response.json({ message: "Campos invalidos" }, { status: 400 });
  }

  const user = await query<UserRow>(
    `
      SELECT id, name, role, password
      , email, company_name
      FROM users
      WHERE email = $1
      LIMIT 1
    `,
    [body.email]
  );

  if (user.rowCount) {
    const matchedUser = user.rows[0];
    const passwordIsValid = await verifyPassword(
      body.password,
      matchedUser.password
    );

    if (!passwordIsValid) {
      return Response.json(
        { message: "Usuario ou senha incorretos" },
        { status: 400 }
      );
    }

    if (!isPasswordHash(matchedUser.password)) {
      const upgradedPassword = await hashPassword(body.password);

      await query(
        `
          UPDATE users
          SET password = $2
          WHERE id = $1
        `,
        [matchedUser.id, upgradedPassword]
      );
    }

    return Response.json(
      {
        name: matchedUser.name,
        role: matchedUser.role,
        id: matchedUser.id,
        email: matchedUser.email,
        companyName: matchedUser.company_name ?? "",
        message: "Login bem sucedido",
      },
      { status: 200 }
    );
  }

  return Response.json(
    { message: "Usuario ou senha incorretos" },
    { status: 400 }
  );
}
