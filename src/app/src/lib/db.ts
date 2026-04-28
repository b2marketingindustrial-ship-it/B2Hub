import { Pool, type QueryResult, type QueryResultRow } from "pg";
import { hashPassword } from "./auth";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL nao configurada");
}

declare global {
  var __kanbamhubPool__: Pool | undefined;
  var __kanbamhubDbReady__: Promise<void> | undefined;
}

function isRetryableDatabaseError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  return (
    error.message.includes("Connection terminated unexpectedly") ||
    error.message.includes("ECONNRESET") ||
    error.message.includes("Connection ended unexpectedly")
  );
}

const pool =
  globalThis.__kanbamhubPool__ ??
  new Pool({
    connectionString,
    max: 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 15_000,
    ssl: {
      rejectUnauthorized: false,
    },
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__kanbamhubPool__ = pool;
}

export async function query<T extends QueryResultRow>(
  text: string,
  params: unknown[] = []
): Promise<QueryResult<T>> {
  try {
    return await pool.query<T>(text, params);
  } catch (error) {
    if (!isRetryableDatabaseError(error)) {
      throw error;
    }

    return pool.query<T>(text, params);
  }
}

async function setupDatabase() {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        role TEXT NOT NULL,
        company_name TEXT,
        password TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await client.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS company_name TEXT
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        client TEXT,
        status TEXT NOT NULL CHECK (status IN ('todo', 'doing', 'done')),
        due_date DATE,
        priority TEXT NOT NULL CHECK (priority IN ('Alta', 'Média', 'Baixa')),
        assignee TEXT,
        created_by_role TEXT NOT NULL DEFAULT 'staff',
        client_user_id TEXT,
        requester_name TEXT,
        reference_image_url TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS task_updates (
        id TEXT PRIMARY KEY,
        task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        author_name TEXT NOT NULL,
        author_role TEXT NOT NULL,
        attachment TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await client.query(`
      ALTER TABLE tasks
      ADD COLUMN IF NOT EXISTS created_by_role TEXT NOT NULL DEFAULT 'staff'
    `);

    await client.query(`
      ALTER TABLE tasks
      ADD COLUMN IF NOT EXISTS client_user_id TEXT
    `);

    await client.query(`
      ALTER TABLE tasks
      ADD COLUMN IF NOT EXISTS requester_name TEXT
    `);

    await client.query(`
      ALTER TABLE tasks
      ADD COLUMN IF NOT EXISTS reference_image_url TEXT
    `);

    await client.query(`
      ALTER TABLE task_updates
      ADD COLUMN IF NOT EXISTS attachment TEXT
    `);

    await client.query(`
      ALTER TABLE tasks
      DROP CONSTRAINT IF EXISTS tasks_created_by_role_check
    `);

    await client.query(`
      ALTER TABLE tasks
      ADD CONSTRAINT tasks_created_by_role_check
      CHECK (created_by_role IN ('staff', 'client'))
    `);

    const seededAdminPassword = await hashPassword("matheus123");

    await client.query(
      `
        INSERT INTO users (id, name, email, role, password)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (email) DO NOTHING
      `,
      [
        "seed-admin",
        "Dev",
        "teste@dev.com",
        "admin",
        seededAdminPassword,
      ]
    );

    const taskSeed = [
      {
        id: "task-1",
        title: "Refinar landing institucional",
        description:
          "Atualizar hero, prova social e CTA com a nova proposta comercial.",
        client: "EuroMav",
        status: "todo",
        dueDate: "2026-04-24",
        priority: "Alta",
        assignee: "Matheus",
      },
      {
        id: "task-2",
        title: "Ajustar identidade do dashboard",
        description:
          "Aplicar nova paleta, revisar cards e alinhar estados visuais.",
        client: "KanbamHub",
        status: "doing",
        dueDate: "2026-04-26",
        priority: "Média",
        assignee: "Ana",
      },
      {
        id: "task-3",
        title: "Publicar hotfix de autenticação",
        description:
          "Corrigir feedback do login e validar fluxo de redirecionamento.",
        client: "Hub Interno",
        status: "done",
        dueDate: "2026-04-22",
        priority: "Baixa",
        assignee: "Caio",
      },
      {
        id: "task-4",
        title: "Planejar sprint de conteúdo",
        description: "Organizar backlog com entregas da próxima semana.",
        client: "Studio Nexo",
        status: "todo",
        dueDate: "2026-04-21",
        priority: "Alta",
        assignee: "Lia",
      },
    ];

    for (const task of taskSeed) {
      await client.query(
        `
          INSERT INTO tasks (id, title, description, client, status, due_date, priority, assignee)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (id) DO NOTHING
        `,
        [
          task.id,
          task.title,
          task.description,
          task.client,
          task.status,
          task.dueDate,
          task.priority,
          task.assignee,
        ]
      );
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}

export async function ensureDatabaseSetup() {
  if (!globalThis.__kanbamhubDbReady__) {
    globalThis.__kanbamhubDbReady__ = setupDatabase().catch((error) => {
      globalThis.__kanbamhubDbReady__ = undefined;
      throw error;
    });
  }

  await globalThis.__kanbamhubDbReady__;
}
