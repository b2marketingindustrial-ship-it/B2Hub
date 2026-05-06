import { listClients } from "@/app/src/services/clientService";

export async function GET () {
    try {
     const clients = await listClients()
     return Response.json(clients , {status:200})
    } catch (error) { const message =
    error instanceof Error ? error.message : "Internal Server Error";
    return Response.json({ message }, { status: 500 });
    }
}