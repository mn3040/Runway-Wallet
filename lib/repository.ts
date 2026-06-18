import { promises as fs } from "fs";
import path from "path";
import { Pool } from "pg";
import { AppData, ConversationMessage, FinancialProfile, ModelExperiment, PaperOrder, StoredGoal } from "@/lib/domain";
import { seedData } from "@/lib/seed-data";

const dataDirectory = path.join(process.cwd(), ".runway-data");
const dataFile = path.join(dataDirectory, "app-data.json");
let writeQueue = Promise.resolve();
let pool: Pool | null = null;

function cloneSeed(): AppData {
  return JSON.parse(JSON.stringify(seedData));
}

async function readFileData(): Promise<AppData> {
  try {
    return JSON.parse(await fs.readFile(dataFile, "utf8"));
  } catch {
    await fs.mkdir(dataDirectory, { recursive: true });
    const initial = cloneSeed();
    await fs.writeFile(dataFile, JSON.stringify(initial, null, 2), "utf8");
    return initial;
  }
}

async function writeFileData(data: AppData) {
  writeQueue = writeQueue.then(async () => {
    await fs.mkdir(dataDirectory, { recursive: true });
    const temporary = `${dataFile}.tmp`;
    await fs.writeFile(temporary, JSON.stringify(data, null, 2), "utf8");
    await fs.rename(temporary, dataFile);
  });
  await writeQueue;
}

function getPool() {
  if (!process.env.DATABASE_URL) return null;
  pool ??= new Pool({ connectionString: process.env.DATABASE_URL });
  return pool;
}

async function readPostgresData(database: Pool): Promise<AppData> {
  const [profileResult, goalsResult, messagesResult, experimentsResult, ordersResult] = await Promise.all([
    database.query("select payload from financial_profiles where id = $1", ["demo-user"]),
    database.query("select payload from goals order by created_at"),
    database.query("select payload from conversation_messages order by created_at"),
    database.query("select payload from model_experiments order by created_at desc limit 100"),
    database.query("select payload from paper_orders order by created_at desc limit 500"),
  ]);
  return {
    profile: profileResult.rows[0]?.payload ?? seedData.profile,
    goals: goalsResult.rows.map((row) => row.payload),
    messages: messagesResult.rows.map((row) => row.payload),
    experiments: experimentsResult.rows.map((row) => row.payload),
    paperOrders: ordersResult.rows.map((row) => row.payload),
  };
}

export async function getAppData(): Promise<AppData> {
  const database = getPool();
  return database ? readPostgresData(database) : readFileData();
}

export async function saveProfile(profile: FinancialProfile) {
  const database = getPool();
  if (database) {
    await database.query(
      `insert into financial_profiles (id, payload) values ($1, $2)
       on conflict (id) do update set payload = excluded.payload, updated_at = now()`,
      [profile.id, JSON.stringify(profile)],
    );
    return profile;
  }
  const data = await readFileData();
  data.profile = profile;
  await writeFileData(data);
  return profile;
}

export async function saveGoals(goals: StoredGoal[]) {
  const database = getPool();
  if (database) {
    const client = await database.connect();
    try {
      await client.query("begin");
      await client.query("delete from goals");
      for (const goal of goals) {
        await client.query("insert into goals (id, payload) values ($1, $2)", [goal.id, JSON.stringify(goal)]);
      }
      await client.query("commit");
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
    return goals;
  }
  const data = await readFileData();
  data.goals = goals;
  await writeFileData(data);
  return goals;
}

export async function appendMessage(message: ConversationMessage) {
  const database = getPool();
  if (database) {
    await database.query("insert into conversation_messages (id, payload) values ($1, $2)", [message.id, JSON.stringify(message)]);
  } else {
    const data = await readFileData();
    data.messages.push(message);
    data.messages = data.messages.slice(-200);
    await writeFileData(data);
  }
  return message;
}

export async function saveExperiment(experiment: ModelExperiment) {
  const database = getPool();
  if (database) {
    await database.query("insert into model_experiments (id, payload) values ($1, $2)", [experiment.id, JSON.stringify(experiment)]);
  } else {
    const data = await readFileData();
    data.experiments.unshift(experiment);
    data.experiments = data.experiments.slice(0, 100);
    await writeFileData(data);
  }
  return experiment;
}

export async function savePaperOrder(order: PaperOrder) {
  const database = getPool();
  if (database) {
    await database.query("insert into paper_orders (id, payload) values ($1, $2)", [order.id, JSON.stringify(order)]);
  } else {
    const data = await readFileData();
    data.paperOrders.unshift(order);
    await writeFileData(data);
  }
  return order;
}
