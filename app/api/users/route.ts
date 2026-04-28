import { createUser } from "@/app/src/services/userService";
import { ensureDatabaseSetup } from "@/app/src/lib/db";

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

  if (!body.name || !body.email || !body.role || !body.password) {
    return Response.json(
      { message: "Campos obrigatorios invalidos" },
      { status: 400 }
    );
  }

  if (body.role === "client" && !body.companyName) {
    return Response.json(
      { message: "Clientes precisam informar o nome da empresa" },
      { status: 400 }
    );
  }

  try {
    const newUser = await createUser(body);
    return Response.json(newUser, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";

    return Response.json({ message }, { status: 500 });
  }
}
