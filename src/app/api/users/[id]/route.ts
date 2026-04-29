import { deleteEmployee, updateEmployee } from "@/app/src/services/userService";
import { ensureDatabaseSetup } from "@/app/src/lib/db";
import { canManageEmployees, normalizeRole } from "@/app/src/lib/roles";
import { cookies } from "next/headers";

type UpdateUserRequest = {
  name: string;
  email: string;
  role: string;
  password?: string;
};

async function ensureEmployeeManager() {
  const cookieStore = await cookies();
  const requesterRole = cookieStore.get("user-role")?.value;

  return canManageEmployees(requesterRole);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureDatabaseSetup();

  if (!(await ensureEmployeeManager())) {
    return Response.json(
      { message: "Apenas admin ou ceo podem alterar funcionarios" },
      { status: 403 }
    );
  }

  const { id } = await params;
  const body = (await req.json()) as UpdateUserRequest;
  const requestedRole = normalizeRole(body.role);

  if (
    !id ||
    !body.name ||
    !body.email ||
    (requestedRole !== "admin" && requestedRole !== "ceo")
  ) {
    return Response.json(
      { message: "Campos obrigatorios invalidos" },
      { status: 400 }
    );
  }

  try {
    const employee = await updateEmployee(id, {
      name: body.name,
      email: body.email,
      role: requestedRole,
      password: body.password?.trim() || undefined,
    });

    return Response.json(employee, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";

    return Response.json({ message }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureDatabaseSetup();

  if (!(await ensureEmployeeManager())) {
    return Response.json(
      { message: "Apenas admin ou ceo podem remover funcionarios" },
      { status: 403 }
    );
  }

  const { id } = await params;

  if (!id) {
    return Response.json(
      { message: "Funcionario invalido" },
      { status: 400 }
    );
  }

  try {
    const deletedEmployee = await deleteEmployee(id);
    return Response.json(deletedEmployee, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";

    return Response.json({ message }, { status: 500 });
  }
}
