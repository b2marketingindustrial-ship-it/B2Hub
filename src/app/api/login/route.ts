import { hashPassword, isPasswordHash, verifyPassword } from "@/app/src/lib/auth";
import { ensureDatabaseSetup, query } from "@/app/src/lib/db";
import { normalizeRole } from "@/app/src/lib/roles";
import { NextResponse } from "next/server";

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

    const normalizedRole = normalizeRole(matchedUser.role);
    if (normalizedRole === "guest") {
      return Response.json(
        { message: "Perfil de acesso sem permissao no sistema" },
        { status: 403 }
      );
    }

    const response = NextResponse.json(
      {
        name: matchedUser.name,
        role: normalizedRole,
        id: matchedUser.id,
        email: matchedUser.email,
        companyName: matchedUser.company_name ?? "",
        message: "Login bem sucedido",
      },
      { status: 200 }
    );

    response.cookies.set("user-role", normalizedRole, {
      httpOnly: false,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  }

  return Response.json(
    { message: "Usuario ou senha incorretos" },
    { status: 400 }
  );
}
