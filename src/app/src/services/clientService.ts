import { query } from "../lib/db";
import { ensureDatabaseSetup} from "../lib/db";


type UserRow = {
  id: string;
  name: string;
  email: string;
  role: "client" | "admin" | "ceo";
  company_name: string | null;
  created_at: string;
};

function mapClient(row: UserRow) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    company: row.company_name,
    created_at : row.created_at
  };
}

export async function listClients () {
  await ensureDatabaseSetup();

  const clients = await query <UserRow> (`
    SELECT id, name, email, role, company_name, created_at
    FROM users
    WHERE role = 'client'
    ORDER BY created_at DESC, name ASC
    `)
    return clients.rows.map(mapClient)
}