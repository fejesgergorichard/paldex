import { staticPlugin } from "@elysiajs/static";
import { cors } from '@elysiajs/cors';
import { Elysia } from "elysia";
import { 
  getPals, 
  getPassives, 
  updateAllPals, 
  getCapturedPals,
  saveCapturedPals,
  closeDatabaseConnection 
} from "./services/mongoDataService";

const app = new Elysia()
  .use(staticPlugin())
  .use(cors())
  .get("/pals/", async () => {
    const pals = await getPals();
    return pals;
  })
  .get("/passives/", async () => {
    const passives = await getPassives();
    return passives;
  })
  .post("/pals/bulk", async ({ body }) => {
    const result = await updateAllPals(body as any[]);
    return result;
  })
  .get("/captured/:userId", async ({ params }) => {
    const captured = await getCapturedPals(params.userId);
    return captured;
  })
  .post("/captured/", async ({ body }) => {
    const { userId, pals } = body as { userId: string; pals: any[] };
    const result = await saveCapturedPals(userId, pals);
    return result;
  })
  .listen(3000);

console.log(`🦊 Elysia is running at on port ${app.server?.port}...`);

process.on("SIGINT", async () => {
  await closeDatabaseConnection();
  process.exit(0);
});