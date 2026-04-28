import { createUser } from "@/app/src/services/userService";
import { ensureDatabaseSetup } from "@/app/src/lib/db";
import {
  canManageEmployees,
  isClientRole,
  normalizeRole,
} from "@/app/src/lib/roles";
import { cookies } from "next/headers";

type CreateUserRequest = {
  name: string;
  email: string;
  role: string;
  password: string;
  companyName?: string;
};

export async function POST(req: Request) {
  await ensureDatabaseSetup();

  const body = (await req.json()) as CreateUserRequest;

  const requestedRole = normalizeRole(body.role);

  if (!body.name || !body.email || requestedRole === "guest" || !body.password) {
    return Response.json(
      { message: "Campos obrigatorios invalidos" },
      { status: 400 }
    );
  }

  if (isClientRole(requestedRole) && !body.companyName) {
    return Response.json(
      { message: "Clientes precisam informar o nome da empresa" },
      { status: 400 }
    );
  }

  if (!isClientRole(requestedRole)) {
    const cookieStore = await cookies();
    const requesterRole = cookieStore.get("user-role")?.value;

    if (!canManageEmployees(requesterRole)) {
      return Response.json(
        { message: "Apenas admin ou ceo podem cadastrar funcionarios" },
        { status: 403 }
      );
    }
  }

  try {
    const newUser = await createUser({
      ...body,
      role: requestedRole,
    });
    return Response.json(newUser, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";

    return Response.json({ message }, { status: 500 });
  }
}
