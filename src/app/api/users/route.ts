import { createUser, listEmployees } from "@/app/src/services/userService";
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

async function ensureEmployeeManager() {
  const cookieStore = await cookies();
  const requesterRole = cookieStore.get("user-role")?.value;

  return canManageEmployees(requesterRole);
}

export async function GET() {
  await ensureDatabaseSetup();

  if (!(await ensureEmployeeManager())) {
    return Response.json(
      { message: "Apenas admin ou ceo podem listar funcionarios" },
      { status: 403 }
    );
  }

  try {
    const employees = await listEmployees();
    return Response.json(employees, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";

    return Response.json({ message }, { status: 500 });
  }
}

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
    if (!(await ensureEmployeeManager())) {
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
